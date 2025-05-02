const gcpMetadata = require('gcp-metadata');

const isAvailablePromise = gcpMetadata.isAvailable();
const idPromise: Promise<string> = gcpMetadata.project('project-id');

export async function getProjectId() {
  const isAvailable = await isAvailablePromise;

  if (isAvailable) {
    return await idPromise;
  } else {
    return process.env.GCP_PROJECT_ID;
  }
}
