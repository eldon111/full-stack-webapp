const gcpMetadata = require('gcp-metadata');

const idPromise: Promise<string> = gcpMetadata.project('project-id');

export async function getProjectId() {
  return await idPromise;
}
