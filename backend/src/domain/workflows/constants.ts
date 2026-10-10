// This file must stay free of imports, because it is shared between workflow code
// (which is bundled for the Temporal sandbox) and the API layer.

// How often a resource step is retried by the deployment workflow, unless configured otherwise.
export const DEPLOYMENT_STEP_MAX_ATTEMPTS = 5;

// Errors that do not go away by retrying, e.g. a deployment that has been deleted in the meantime.
export const NON_RETRYABLE_ERRORS = ['NotFoundException', 'BadRequestException'];

// Tracking runs every few minutes anyway, so a few quick retries bridge short outages without delaying the next run.
export const TRACKING_RETRY_POLICY = {
  maximumAttempts: 3,
  initialInterval: '10s',
  backoffCoefficient: 2,
  nonRetryableErrorTypes: NON_RETRYABLE_ERRORS,
} as const;

// Cleanups run at most every hour, so they can wait longer for the database to come back.
export const CLEANUP_RETRY_POLICY = {
  maximumAttempts: 5,
  initialInterval: '30s',
  backoffCoefficient: 2,
  nonRetryableErrorTypes: NON_RETRYABLE_ERRORS,
} as const;

// A missed charge is lost revenue and charging only runs once a month, so retry for about 1.5 hours.
export const BILLING_RETRY_POLICY = {
  maximumAttempts: 8,
  initialInterval: '1m',
  backoffCoefficient: 2,
  maximumInterval: '30m',
  nonRetryableErrorTypes: NON_RETRYABLE_ERRORS,
} as const;
