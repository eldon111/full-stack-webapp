const {SecretManagerServiceClient} = require('@google-cloud/secret-manager').v1
const secretManagerClient = new SecretManagerServiceClient();

export async function accessSecret(name: String): Promise<string> {
  return (await accessSecretAsBuffer(name)).toString('utf8')
}

export async function accessSecretAsBuffer(name: String): Promise<Buffer> {
  const [version] = await secretManagerClient.accessSecretVersion({
    name: `projects/622349036584/secrets/${name}/versions/latest`,
  });
  return version.payload.data;
}