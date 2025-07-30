import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const secretsManagerClient = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });

export async function accessSecret(name: String): Promise<string> {
  return (await accessSecretAsBuffer(name)).toString('utf8');
}

export async function accessSecretAsBuffer(name: String): Promise<Buffer> {
  const command = new GetSecretValueCommand({
    SecretId: `${name}-${process.env.NODE_ENV}`,
  });

  const response = await secretsManagerClient.send(command);

  if (response.SecretBinary) {
    // If the secret is binary, return it as a Buffer
    return Buffer.from(response.SecretBinary);
  } else if (response.SecretString) {
    // If the secret is a string, convert it to a Buffer
    return Buffer.from(response.SecretString);
  } else {
    throw new Error(`Secret ${name}-${process.env.NODE_ENV} has no value`);
  }
}
