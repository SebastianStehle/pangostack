export function parseEnvironment(text?: string | null): Record<string, any> {
  if (!text || !text.trim()) {
    return {};
  }

  const result: Record<string, any> = {};

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    const index = trimmed.indexOf("=");
    if (index === -1) {
      continue;
    }

    const key = trimmed.slice(0, index).trim();
    if (!key) {
      continue;
    }

    const value = trimmed.slice(index + 1);
    result[key] = value;
  }

  return result;
}