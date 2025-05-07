// can't use import with this, or it doesn't work
const gcpMetadata = require('gcp-metadata');

const isAvailablePromise = gcpMetadata.isAvailable();
const idPromise: Promise<string> = gcpMetadata.project('project-id').catch((err: any) => console.log(err));

export async function getProjectId() {
  const isAvailable = await isAvailablePromise;
  console.log('isAvailable: ' + isAvailable);

  if (isAvailable) {
    return await idPromise;
  } else {
    console.log('returning default project id: ' + process.env.GCP_PROJECT_ID);
    return process.env.GCP_PROJECT_ID;
  }
}
