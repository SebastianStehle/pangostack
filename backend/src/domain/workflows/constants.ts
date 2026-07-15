// This file must stay free of imports, because it is shared between workflow code
// (which is bundled for the Temporal sandbox) and the API layer.

// How often a resource step is retried by the deployment workflow.
export const DEPLOYMENT_STEP_MAX_ATTEMPTS = 5;
