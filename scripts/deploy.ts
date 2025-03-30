#!/usr/bin/env node

import { exec, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { createReadStream } from 'node:fs'
import path from 'node:path'
import { 
  CloudFormationClient, 
  DescribeStacksCommand
} from '@aws-sdk/client-cloudformation'
import { 
  CloudFrontClient, 
  ListDistributionsCommand,
  CreateInvalidationCommand,
  waitUntilInvalidationCompleted
} from '@aws-sdk/client-cloudfront'
import { 
  S3Client, 
  PutObjectCommand,
} from '@aws-sdk/client-s3'

// Convert exec to promise-based for commands we still need to execute
const execAsync = promisify(exec)

const execAsyncWithStdio = async (command: string, env?: Record<string, string>) => {
  console.log(`Running: ${command}`)
  return new Promise<void>((resolve, reject) => {
    // Split the command but preserve quoted strings
    const cmdParts = command.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || []
    
    // Get the base command and args
    const cmd = cmdParts[0]
    const args = cmdParts.slice(1)
    
    // Create environment by extending process.env
    const environment = env ? { ...process.env, ...env } : process.env
    
    const child = spawn(cmd, args, { 
      stdio: 'inherit',
      env: environment,
      shell: false
    })
    
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Command failed with code ${code}`))
    })
  })
}

// Create AWS clients
const region = 'us-east-1'
const cloudformationClient = new CloudFormationClient({ region })
const cloudfrontClient = new CloudFrontClient({ region })
const s3Client = new S3Client({ region })

interface DeploymentResult {
  cloudfrontDomain: string;
}

// Build the application using yarn script instead of Vite API
// This avoids the Vike deprecation warning
async function buildApplication(environment: string): Promise<void> {
  console.log(`Building application for ${environment} environment...`)
  // Pass APP_ENV to the build process through environment variables
  await execAsyncWithStdio(`yarn build`, { APP_ENV: environment })
  console.log('Build completed successfully')
}

// Deploy infrastructure and static assets
const deploy = async (environment: string = 'prod'): Promise<DeploymentResult> => {
  try {
    console.log(`Starting deployment to ${environment} environment`)
    
    // Create the stack name with environment suffix
    const stackName = `personal-website-${environment}`
    const timestamp = Math.floor(Date.now() / 1000)
    
    // Build the application using yarn script with environment
    await buildApplication(environment)
    
    // Run the SAM deploy command with environment parameter
    // Note: We still use execAsync for SAM CLI as it doesn't have a JavaScript SDK
    console.log(`Deploying SAM template to ${stackName}...`)
    
    await execAsyncWithStdio(`sam deploy --resolve-s3 --stack-name ${stackName} --region ${region} --capabilities CAPABILITY_IAM --parameter-overrides Environment=${environment} DeploymentTimestamp=${timestamp} AppEnv=${environment} --no-fail-on-empty-changeset`)
    
    // Get the stack outputs to find our S3 bucket
    console.log(`Getting CloudFormation outputs for stack: ${stackName}`)
    const { Stacks } = await cloudformationClient.send(
      new DescribeStacksCommand({ StackName: stackName })
    )
    
    if (!Stacks || Stacks.length === 0) {
      throw new Error(`Stack ${stackName} not found`)
    }
    
    const outputs = Stacks[0].Outputs || []
    
    // Find S3 bucket name from stack outputs
    const s3BucketOutput = outputs.find(output => output.OutputKey === 'StaticAssetsS3BucketName')
    
    if (!s3BucketOutput || !s3BucketOutput.OutputValue) {
      throw new Error('Could not find S3 bucket name in CloudFormation stack outputs')
    }
    
    const s3BucketName = s3BucketOutput.OutputValue
    console.log(`Deploying static assets to S3 bucket: ${s3BucketName}`)
    
    // Upload static assets to S3
    console.log('Copying assets to S3 bucket...')
    
    // Note: For simplicity, we're still using AWS CLI for the sync operation
    // A full SDK implementation would require listing all files and uploading each one
    await execAsyncWithStdio(`aws s3 sync ./dist/client/assets s3://${s3BucketName}/assets --cache-control "max-age=31536000,public" --acl public-read`)
    
    // Upload favicon.ico to S3 bucket root (using SDK)
    console.log('Copying favicon.ico to S3 bucket root...')
    const faviconPath = './public/favicon.ico'
    const faviconStream = createReadStream(faviconPath)
    
    await s3Client.send(
      new PutObjectCommand({
        Bucket: s3BucketName,
        Key: 'favicon.ico',
        Body: faviconStream,
        CacheControl: 'max-age=86400,public',
        ACL: 'public-read',
        ContentType: 'image/x-icon'
      })
    )
    
    // Invalidate CloudFront cache for assets if needed
    const cloudfrontDomainOutput = outputs.find(output => output.OutputKey === 'CloudFrontDistributionDomainName')
    let cloudfrontDomain = 'Unknown'
    
    if (cloudfrontDomainOutput?.OutputValue) {
      cloudfrontDomain = cloudfrontDomainOutput.OutputValue
      
      // Get distribution ID from domain name
      const distributionId = await getDistributionIdFromDomain(cloudfrontDomain)
      
      if (distributionId) {
        console.log(`Creating CloudFront invalidation for distribution: ${distributionId}`)
        
        // Create invalidation
        const invalidationResponse = await cloudfrontClient.send(
          new CreateInvalidationCommand({
            DistributionId: distributionId,
            InvalidationBatch: {
              CallerReference: `deploy-${Date.now()}`,
              Paths: {
                Quantity: 2,
                Items: ['/assets/*', '/favicon.ico']
              }
            }
          })
        )
        
        if (invalidationResponse.Invalidation?.Id) {
          const invalidationId = invalidationResponse.Invalidation.Id
          console.log(`Waiting for invalidation ${invalidationId} to complete...`)
          
          // Wait for invalidation to complete
          await waitUntilInvalidationCompleted(
            { client: cloudfrontClient, maxWaitTime: 300 },
            { 
              DistributionId: distributionId,
              Id: invalidationId
            }
          )
          
          console.log(`CloudFront invalidation completed successfully`)
        }
      }
    }
    
    console.log('Deployment completed successfully')
    return { cloudfrontDomain }
  } catch (error) {
    console.error('Error during deployment:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Helper to get CloudFront distribution ID from domain name
const getDistributionIdFromDomain = async (domain: string): Promise<string | null> => {
  try {
    const response = await cloudfrontClient.send(
      new ListDistributionsCommand({})
    )
    
    const distributions = response.DistributionList?.Items || []
    const matchingDistribution = distributions.find(dist => dist.DomainName === domain)
    
    return matchingDistribution?.Id || null
  } catch (error) {
    console.error('Could not get CloudFront distribution ID:', error instanceof Error ? error.message : String(error))
    return null
  }
}

// Main execution
const main = async (): Promise<void> => {
  // Get environment argument from command line (default to prod)
  const environment: string | undefined = process.env.CLIENT_APP_ENV

  if (!environment) {
    console.error('CLIENT_APP_ENV environment variable is not set')
    process.exit(1)
  }
  
  // Validate environment
  const validEnvironments = ['dev', 'staging', 'prod']
  if (!validEnvironments.includes(environment)) {
    console.error(`Invalid environment "${environment}". Must be one of: ${validEnvironments.join(', ')}`)
    process.exit(1)
  }
  
  console.log(`Deploying to ${environment} environment`)
  const result = await deploy(environment)
  
  // Print the CloudFront domain name
  if (result?.cloudfrontDomain) {
    console.log(`\n✅ Deployment completed successfully!`)
    console.log(`📱 ${environment.toUpperCase()} environment URL: https://${result.cloudfrontDomain}\n`)
  }
}

// Execute main function and handle errors
main().catch((error) => {
  console.error('Deployment failed:', error instanceof Error ? error.message : String(error))
  process.exit(1)
})