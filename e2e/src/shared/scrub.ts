const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

const ID_KEY = /(^id$|Id$)/;

// Replaces values that change on every run, so that snapshots only show changes of the response shape.
export function scrub(value: unknown, names: string[] = []): unknown {
  if (value instanceof Date) {
    return '<date>';
  }

  if (Array.isArray(value)) {
    return value.map((item) => scrub(item, names));
  }

  if (typeof value === 'string') {
    if (ISO_DATE.test(value)) {
      return '<date>';
    }

    let result = value;
    for (const name of names) {
      result = result.split(name).join('<name>');
    }
    return result;
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      if (ID_KEY.test(key) && (typeof item === 'number' || typeof item === 'string')) {
        result[key] = '<id>';
      } else {
        result[key] = scrub(item, names);
      }
    }
    return result;
  }

  return value;
}
