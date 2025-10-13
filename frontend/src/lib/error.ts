import { ResponseError } from 'src/api';
import { is, isArray, isString } from './types';

export async function buildError(common: string, details?: string | Error | null) {
  let errorSummary = common;
  let errorDetails: string[] = [];
  if (isString(details)) {
    errorSummary = details;
  } else if (is(details, ResponseError)) {
    try {
      const response = await details.response.json();

      if (isString(response.message)) {
        errorSummary = response.message;
      } else if (isArray(response.message)) {
        errorDetails = response.message;
      }
    } catch {
      console.error('Server response is not a JSON object.');
    }
  }

  if (!errorSummary) {
    errorSummary = 'common';
  }

  let result = errorSummary;
  if (errorDetails.length > 0) {
    result += '\n\n';
    for (const detail of errorDetails) {
      const normalized = detail.replace(/\n/g, '\n   ');

      result += ` * ${normalized}\n`;
    }
  }

  return result;
}
