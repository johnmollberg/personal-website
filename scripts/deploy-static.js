#!/usr/bin/env node

import { execSync } from 'child_process'

// Deploy infrastructure with SAM CLI
const deploySAM = (environment = 'prod') => {
  try {
    console.log(`Building and deploying infrastructure to ${environment} environment`)
    
    // Create the stack name with environment suffix
    const stackName = `personal-website-${environment}`
    
    // Run the SAM deploy command with environment parameter
    console.log(`Deploying SAM template to ${stackName}...`)
    execSync(`sam deploy --resolve-s3 --stack-name ${stackName} --capabilities CAPABILITY_IAM --no-fail-on-empty-changeset --parameter-overrides Environment=${environment}`, 
      { stdio: 'inherit' })
    
    // Get the stack outputs to find our S3 bucket
    const cloudformationOutput = execSync(`aws cloudformation describe-stacks --stack-name ${stackName} --query "Stacks[0].Outputs" --output json`, { encoding: 'utf-8' })
    const outputs = JSON.parse(cloudformationOutput)
    
    // Find S3 bucket name from stack outputs
    const s3BucketOutput = outputs.find(output => output.OutputKey === 'StaticAssetsS3BucketName')
    
    if (!s3BucketOutput) {
      console.error('Could not find S3 bucket name in CloudFormation stack outputs')
      process.exit(1)
    }
    
    const s3BucketName = s3BucketOutput.OutputValue
    console.log(`Deploying static assets to S3 bucket: ${s3BucketName}`)
    
    // Deploy static assets to S3 using AWS CLI
    console.log('Copying assets to S3 bucket...')
    execSync(`aws s3 sync ./dist/client/assets s3://${s3BucketName}/assets --cache-control "max-age=31536000,public" --acl public-read`, 
      { stdio: 'inherit' })
    
    // Deploy favicon.ico to S3 bucket root
    console.log('Copying favicon.ico to S3 bucket root...')
    execSync(`aws s3 cp ./public/favicon.ico s3://${s3BucketName}/favicon.ico --cache-control "max-age=86400,public" --acl public-read`,
      { stdio: 'inherit' })
    
    // Invalidate CloudFront cache for assets if needed
    const cloudfrontOutput = outputs.find(output => output.OutputKey === 'CloudFrontDistributionDomainName')
    if (cloudfrontOutput) {
      const distributionDomain = cloudfrontOutput.OutputValue
      // Extract distribution ID (we need it for invalidation)
      const distributionId = getDistributionIdFromDomain(distributionDomain)
      
      if (distributionId) {
        console.log(`Creating CloudFront invalidation for distribution: ${distributionId}`)
        const invalidationResult = execSync(`aws cloudfront create-invalidation --distribution-id ${distributionId} --paths "/assets/*" "/favicon.ico"`, 
          { encoding: 'utf-8' })
        
        // Parse the invalidation ID from the result
        const invalidationData = JSON.parse(invalidationResult)
        const invalidationId = invalidationData.Invalidation.Id
        
        console.log(`Waiting for invalidation ${invalidationId} to complete...`)
        execSync(`aws cloudfront wait invalidation-completed --distribution-id ${distributionId} --id ${invalidationId}`, 
          { stdio: 'inherit' })
        
        console.log(`CloudFront invalidation completed successfully`)
      }
    }
    
    console.log('Deployment completed successfully')
    return {
      cloudfrontDomain: cloudfrontOutput?.OutputValue || 'Unknown'
    }
  } catch (error) {
    console.error('Error during deployment:', error.message)
    process.exit(1)
  }
}

// Helper to get CloudFront distribution ID from domain name
const getDistributionIdFromDomain = (domain) => {
  try {
    const result = execSync(`aws cloudfront list-distributions --query "DistributionList.Items[?DomainName=='${domain}'].Id" --output text`, 
      { encoding: 'utf-8' })
    return result.trim()
  } catch (error) {
    console.error('Could not get CloudFront distribution ID:', error.message)
    return null
  }
}

// Main execution
const main = () => {
  // Get environment argument from command line (default to prod)
  const args = process.argv.slice(2)
  const envArg = args.find(arg => arg.startsWith('--env='))
  const environment = envArg ? envArg.split('=')[1] : 'prod'
  
  // Validate environment
  const validEnvironments = ['dev', 'staging', 'prod']
  if (!validEnvironments.includes(environment)) {
    console.error(`Invalid environment "${environment}". Must be one of: ${validEnvironments.join(', ')}`)
    process.exit(1)
  }
  
  console.log(`Deploying to ${environment} environment`)
  const result = deploySAM(environment)
  
  // Print the CloudFront domain name
  if (result?.cloudfrontDomain) {
    console.log(`\n✅ Deployment completed successfully!`)
    console.log(`📱 ${environment.toUpperCase()} environment URL: https://${result.cloudfrontDomain}\n`)
  }
}

main()