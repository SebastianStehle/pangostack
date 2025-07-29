import { ResponseError } from 'src/api';
import { is, isString } from './types';

export async function buildError(common: string, details?: string | Error | null) {
  let result = common;

  let detailString: string | null = null;
  if (isString(details)) {
    detailString = details;
  } else if (is(details, ResponseError)) {
    try {
      const response = await details.response.json();

      detailString = response.message;
    } catch {
      console.error('Server response is an not a JSON object.');
    }
  }

  if (isString(detailString)) {
    if (result.endsWith('.')) {
      result = result.substring(0, result.length - 1);
    }

    result = `${result}: ${detailString}`;
  }

  if (!result.endsWith('.')) {
    result = `${result}.`;
  }

  return result;
}
