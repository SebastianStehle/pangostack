const SIZE_UNITS_GB: Record<string, number> = {
  b: 1 / 1024 ** 3,
  kb: 1 / 1000 ** 2,
  kib: 1 / 1024 ** 2,
  mb: 1 / 1000,
  mib: 1 / 1024,
  gb: 1,
  gib: 1,
  tb: 1000,
  tib: 1024,
};

// Parses a percentage such as '12.34%' into a number, defaulting to 0 for invalid input.
export function parsePercent(source: string | undefined): number {
  const parsed = parseFloat(source?.replace('%', '') || '');

  return isNaN(parsed) ? 0 : parsed;
}

// Parses a size with a unit such as '512MiB' into GB, defaulting to 0 for invalid input.
export function parseSizeGb(source: string | undefined): number {
  const match = /^([\d.]+)\s*([a-z]+)$/i.exec(source?.trim() || '');
  if (!match) {
    return 0;
  }

  return parseFloat(match[1]) * (SIZE_UNITS_GB[match[2].toLowerCase()] ?? 0);
}

// Rounds a number to two decimal places.
export function roundValue(value: number): number {
  return Math.round(value * 100) / 100;
}

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
