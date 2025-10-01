export function dotToNested(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const parts = key.split('.');

    let current = result;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (i === parts.length - 1) {
        current[part] = value;
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    }
  }

  return result;
}
