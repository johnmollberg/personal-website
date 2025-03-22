#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

// Deploy static assets to S3 using CDK
const deployStaticAssets = async () => {
  try {
    console.log('Using AWS CDK to deploy static assets');
    
    // Import CDK stack (assuming it exists)
    // You'd need to import your actual CDK stack module here
    const { StaticAssetsStack } = await import('../infra/static-assets-stack.js');
    
    // Create CDK app
    const app = new cdk.App();
    
    // Instantiate the stack
    const stack = new StaticAssetsStack(app, 'personal-website-static');
    
    // Synthesize and deploy the stack
    console.log('Deploying CDK stack for static assets...');
    const result = execSync('cd infra && npx cdk deploy', { stdio: 'inherit' });
    
    // Get the bucket name from stack outputs
    const stackOutputs = stack.exportValue('StaticAssetsS3BucketName');
    const s3BucketName = stackOutputs.toString();
    
    if (!s3BucketName) {
      console.error('Could not find S3 bucket name in CDK stack outputs');
      process.exit(1);
    }
    
    console.log(`Static assets will be deployed to S3 bucket: ${s3BucketName}`);
    
    // Use S3 Deployment construct to deploy assets
    new s3deploy.BucketDeployment(stack, 'DeployStaticAssets', {
      sources: [s3deploy.Source.asset('./dist/client/assets')],
      destinationBucket: s3.Bucket.fromBucketName(stack, 'StaticAssetsBucket', s3BucketName),
      cacheControl: [s3deploy.CacheControl.setMaxAge(cdk.Duration.days(365))],
    });
    
    console.log('Static assets deployed successfully');
  } catch (error) {
    console.error('Error deploying static assets:', error.message);
    process.exit(1);
  }
};

// Main execution
deployStaticAssets();