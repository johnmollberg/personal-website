#!/usr/bin/env node

import { execSync } from 'child_process'

// Deploy infrastructure with SAM CLI
const deploySAM = () => {
  try {
    console.log('Building and deploying infrastructure with SAM CLI')
    
    // Run the SAM deploy command
    console.log('Deploying SAM template...')
    execSync('sam deploy --resolve-s3 --stack-name personal-website --capabilities CAPABILITY_IAM --no-fail-on-empty-changeset', 
      { stdio: 'inherit' })
    
    // Get the stack outputs to find our S3 bucket
    const cloudformationOutput = execSync('aws cloudformation describe-stacks --stack-name personal-website --query "Stacks[0].Outputs" --output json', { encoding: 'utf-8' })
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
deploySAM()