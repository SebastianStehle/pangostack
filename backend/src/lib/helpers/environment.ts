export function parseEnvironmentMap(prefix: string) {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (!value) {
      continue;
    }

    if (key.startsWith(prefix)) {
      const mapKey = key.replace(prefix, '').toLowerCase();

      result[mapKey] = value;
    }
  }

  return result;
}
