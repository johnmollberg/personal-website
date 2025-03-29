import StatsigServer from 'statsig-node';
import type { StatsigUser } from '@statsig/js-client';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

interface StatsigSecret {
  server_api_key: string;
}

// Function to get Statsig secret from AWS Secrets Manager
const getStatsigSecret = async (): Promise<StatsigSecret> => {
  try {
    // Create a Secrets Manager client
    const client = new SecretsManagerClient({
      region: 'us-east-1',
    });
    
    // Get the Statsig secret from Secrets Manager
    // Lambda@Edge doesn't support environment variables, so we need to hardcode the secret name
    const secretId = 'statsig-credentials';
    const command = new GetSecretValueCommand({ SecretId: secretId });
    
    // Execute the command to get the secret
    const response = await client.send(command);
    
    // Parse the secret value
    if (!response.SecretString) {
      throw new Error('Secret value is empty');
    }
    
    // Return the parsed secret
    return JSON.parse(response.SecretString) as StatsigSecret;
  } catch (error) {
    console.error('Error retrieving Statsig credentials from Secrets Manager:', error);
    throw error;
  }
};


// Initialize the server SDK (will be done on server startup)
const initializeStatsigServer = async (): Promise<void> => {
  try {
    const { server_api_key } = await getStatsigSecret()
    await StatsigServer.initialize(server_api_key);
    console.log('Statsig server SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Statsig server SDK:', error);
    throw error;
  }
};

// Get bootstrap values for a specific user
export const getClientInitializeResponse = async (user: StatsigUser) => {
  try {
    await initializeStatsigServer()
    console.log('user', user)
    return await StatsigServer.getClientInitializeResponse(
      // @ts-expect-error
      user,
    )
  } catch (error) {
    console.error('Failed to get Statsig bootstrap values:', error);
    return null;
  }
};

// Shutdown the Statsig server SDK (useful for cleanup)
export const shutdownStatsigServer = async (): Promise<void> => {
  try {
    await StatsigServer.shutdown();
    console.log('Statsig server SDK shut down successfully');
  } catch (error) {
    console.error('Failed to shut down Statsig server SDK:', error);
  }
};