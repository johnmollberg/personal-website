import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
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
import { loadEnv } from 'vite'

// Load environment variables based on environment
const getEnvVariables = (environment: string) => {
  return loadEnv(environment, 'environment', ['PUBLIC_ENV__', 'SERVER_ENV__'])
}

const execAsyncWithStdio = async (command: string, env?: Record<string, string>) => {
  console.log(`Running: ${command}`)
  return new Promise<void>((resolve, reject) => {
    // Split the command but preserve quoted strings
    const cmdParts = command.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || []
    
    // Get the base command and args
    const cmd = cmdParts[0] || ''
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

// Calculate SHA256 hash of all files in the Lambda code directory
async function calculateCodeHash(dirPath = './dist/server'): Promise<string> {
  const files = await getAllFiles(dirPath);
  const fileContents = await Promise.all(
    files.map(async (file) => {
      const content = await readFile(file);
      return { file, content };
    })
  );

  // Sort files by path for consistent hashing
  fileContents.sort((a, b) => a.file.localeCompare(b.file));

  const hash = createHash('sha256');
  for (const { file, content } of fileContents) {
    hash.update(`${file}:${content.length}:`);
    hash.update(content);
  }

  return hash.digest('hex');
}

// Recursively get all files in a directory
async function getAllFiles(dirPath: string, allFiles: string[] = []): Promise<string[]> {
  const files = await readdir(dirPath);

  for (const file of files) {
    const filePath = join(dirPath, file);
    const stats = await stat(filePath);

    if (stats.isDirectory()) {
      await getAllFiles(filePath, allFiles);
    } else {
      allFiles.push(filePath);
    }
  }

  return allFiles;
}

interface DeploymentResult {
  cloudfrontDomain: string;
  siteDomain: string;
}

// Build the application using yarn script instead of Vite API
// This avoids the Vike deprecation warning
async function buildApplication(environment: string): Promise<void> {
  console.log(`Building application for ${environment} environment...`)
  // Pass APP_ENV to the build process through environment variables
  await execAsyncWithStdio(`yarn build`, { PUBLIC_ENV__APP_ENV: environment })
  console.log('Build completed successfully')
}

// Deploy infrastructure and static assets
const deploy = async (environment = 'prod'): Promise<DeploymentResult> => {
  try {
    console.log(`Starting deployment to ${environment} environment`)
    
    // Load environment variables for the specified environment
    const envObject = getEnvVariables(environment)
    
    // Get site domain from environment variables
    const siteDomain = envObject.PUBLIC_ENV__SITE_DOMAIN
    if (!siteDomain) {
      throw new Error(`PUBLIC_ENV__SITE_DOMAIN is not defined in environment/${environment}.env`)
    }
    
    // Create the stack name with environment suffix
    const stackName = `personal-website-${environment}`
    
    // Build the application using yarn script with environment
    await buildApplication(environment)
    
    // Run the SAM deploy command with environment and domain parameters
    console.log(`Deploying SAM template to ${stackName}...`)
    
    await execAsyncWithStdio(`sam deploy --stack-name ${stackName} --region ${region} --parameter-overrides ${Object.entries(envObject).map(([key, value]) => `${toPascalCase(key)}="${value}"`).join(' ')} --no-fail-on-empty-changeset`)
    
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
    
    // Upload all public directory files to S3 bucket root
    console.log('Copying all public directory files to S3 bucket root...')
    
    // Using AWS CLI to sync public directory to S3 bucket root
    await execAsyncWithStdio(`aws s3 sync ./public s3://${s3BucketName} --cache-control "max-age=86400,public" --acl public-read`)
    
    // Upload content directory to S3 bucket
    console.log('Copying content directory to S3 bucket...')
    await execAsyncWithStdio(`aws s3 sync ./src/content s3://${s3BucketName}/content --cache-control "max-age=3600,public" --acl public-read`)
    
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
                Quantity: 4,
                Items: ['/assets/*', '/favicon.ico', '/content/*', '/*']
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
    return { cloudfrontDomain, siteDomain }
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
  const environment = process.env.PUBLIC_ENV__APP_ENV || 'prod'
  
  // Validate environment
  const validEnvironments = ['dev', 'staging', 'prod']
  if (!validEnvironments.includes(environment)) {
    console.error(`Invalid environment "${environment}". Must be one of: ${validEnvironments.join(', ')}`)
    process.exit(1)
  }
  
  console.log(`Deploying to ${environment} environment`)
  const result = await deploy(environment)
  
  // Print the CloudFront domain name and custom domain
  if (result?.cloudfrontDomain) {
    console.log(`\n✅ Deployment completed successfully!`)
    console.log(`📱 ${environment.toUpperCase()} environment URLs:`)
    console.log(`   CloudFront URL: https://${result.cloudfrontDomain}`)
    console.log(`   Custom Domain: https://${result.siteDomain}\n`)
  }
}

// Execute main function and handle errors
main().catch((error) => {
  console.error('Deployment failed:', error instanceof Error ? error.message : String(error))
  process.exit(1)
})

/* example input:
  PUBLIC_ENV__SITE_DOMAIN
  SERVER_ENV__STATSIG_SECRET_ID
  SERVER_ENV__HOSTED_ZONE_ID
  SERVER_ENV__AWS_ACCOUNT_ID
  SERVER_ENV__AWS_REGION

  example output:
  PublicEnvSiteDomain
  ServerEnvStatsigSecretId
  ServerEnvHostedZoneId
  ServerEnvAwsAccountId
  ServerEnvAwsRegion
*/
const toPascalCase = (str: string): string => {
  return str
    .split('_')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}