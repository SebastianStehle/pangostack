export function dotToNested(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Split by unescaped dot only
    const keys = key.split(/(?<!\\)\./).map((k) => k.replace(/\\\./g, '.'));

    let current: any = result;

    let convertedValue: unknown = value;
    if (typeof value === 'string') {
      if (/^-?\d+$/.test(value)) {
        convertedValue = parseInt(value, 10);
      } else if (value.toLowerCase() === 'true') {
        convertedValue = true;
      } else if (value.toLowerCase() === 'false') {
        convertedValue = false;
      } else {
        convertedValue = value.trim().replace(/^["']|["']$/g, '');
      }
    }

    keys.forEach((part, index) => {
      const arrayIndex = /^\d+$/.test(part) ? parseInt(part, 10) : -1;
      const nextPart = keys[index + 1];

      if (index === keys.length - 1) {
        if (arrayIndex >= 0) {
          if (!Array.isArray(current)) {
            current = [];
          }

          current[arrayIndex] = convertedValue;
        } else {
          current[part] = convertedValue;
        }
      } else {
        if (arrayIndex >= 0) {
          if (!Array.isArray(current)) {
            current = [];
          }

          if (!current[arrayIndex] || typeof current[arrayIndex] !== 'object') {
            current[arrayIndex] = /^\d+$/.test(nextPart) ? [] : {};
          }

          current = current[arrayIndex];
        } else {
          if (!current[part] || typeof current[part] !== 'object') {
            current[part] = /^\d+$/.test(nextPart) ? [] : {};
          }

          current = current[part];
        }
      }
    });
  }

  return result;
}
