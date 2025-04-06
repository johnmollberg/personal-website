#!/usr/bin/env node

/**
 * Script to create or update the Statsig server API keys in AWS Secrets Manager for all environments
 * Usage: 
 *   export HISTCONTROL=ignorespace # This is needed to prevent writing the sensitive keys to the shell history
 *   STATSIG_DEV_API_KEY=key1 STATSIG_STAGING_API_KEY=key2 STATSIG_PROD_API_KEY=key3 yarn create-statsig-secrets
 * 
 * Environment variables:
 *   STATSIG_DEV_API_KEY - Statsig API key for dev environment
 *   STATSIG_STAGING_API_KEY - Statsig API key for staging environment
 *   STATSIG_PROD_API_KEY - Statsig API key for prod environment
 */

import { 
  SecretsManagerClient, 
  CreateSecretCommand, 
  UpdateSecretCommand, 
  GetSecretValueCommand,
  type CreateSecretCommandInput,
  type UpdateSecretCommandInput
} from '@aws-sdk/client-secrets-manager'

// Define environments
const environments = ['dev', 'staging', 'prod'] as const
type Environment = typeof environments[number]

// Get API keys from environment variables
const apiKeys: Record<Environment, string | undefined> = {
  dev: process.env.STATSIG_DEV_API_KEY,
  staging: process.env.STATSIG_STAGING_API_KEY,
  prod: process.env.STATSIG_PROD_API_KEY
}

// Create AWS Secrets Manager client
const client = new SecretsManagerClient({
  region: 'us-east-1' // Using the same region as in the CloudFormation template
})

// Function to create or update a secret for a specific environment
async function createOrUpdateSecret(environment: Environment): Promise<void> {
  const apiKey = apiKeys[environment]
  
  if (!apiKey) {
    console.warn(`Warning: No API key provided for ${environment} environment (STATSIG_${environment.toUpperCase()}_API_KEY)`)
    return
  }
  
  // Secret name follows the pattern defined in CloudFormation template
  const secretName = `${environment}/statsig-server-secret`

  try {
    // Check if the secret already exists
    let secretExists = false
    try {
      const getCommand = new GetSecretValueCommand({ SecretId: secretName })
      await client.send(getCommand)
      secretExists = true
      console.log(`Secret ${secretName} already exists.`)
    } catch (error) {
      if (error instanceof Error && error.name === 'ResourceNotFoundException') {
        console.log(`Secret ${secretName} does not exist yet. Will create it.`)
      } else {
        throw error
      }
    }

    // Prepare the secret value
    const secretValue = JSON.stringify({
      server_api_key: apiKey
    })

    if (secretExists) {
      // Update existing secret
      const updateParams: UpdateSecretCommandInput = {
        SecretId: secretName,
        SecretString: secretValue
      }
      
      const updateCommand = new UpdateSecretCommand(updateParams)
      await client.send(updateCommand)
      console.log(`✅ Secret ${secretName} updated successfully.`)
    } else {
      // Create new secret
      const createParams: CreateSecretCommandInput = {
        Name: secretName,
        Description: `Statsig API credentials for personal website - ${environment} environment`,
        SecretString: secretValue,
        Tags: [
          {
            Key: 'Environment',
            Value: environment
          },
          {
            Key: 'Application',
            Value: 'personal-website'
          },
          {
            Key: 'ManagedBy',
            Value: 'create-statsig-secrets-script'
          }
        ]
      }
      
      const createCommand = new CreateSecretCommand(createParams)
      await client.send(createCommand)
      console.log(`✅ Secret ${secretName} created successfully.`)
    }
  } catch (error) {
    console.error(`❌ Error managing secret for ${environment}:`, error)
  }
}

async function main(): Promise<void> {
  console.log('Starting Statsig secrets management...\n')
  
  // Check if any API keys are provided
  const hasAnyApiKey = Object.values(apiKeys).some(key => !!key)
  if (!hasAnyApiKey) {
    console.error('Error: No API keys provided. Please set at least one of the following environment variables:')
    console.error('  - STATSIG_DEV_API_KEY')
    console.error('  - STATSIG_STAGING_API_KEY')
    console.error('  - STATSIG_PROD_API_KEY')
    process.exit(1)
  }
  
  // Process each environment in parallel
  const promises = environments.map(env => createOrUpdateSecret(env))
  await Promise.all(promises)
  
  console.log('\nSecret management completed.')
  console.log(`
Secret information:
- Region: us-east-1
- Environments processed: ${environments.join(', ')}
  `)
}

// Execute main function
main().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})