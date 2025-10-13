import { isString } from './types';

type EvalContext = Record<string, unknown>;

export function evaluateExpression(template: string | undefined, context: EvalContext): string {
  if (!template) {
    return '';
  }

  if (!isString(template)) {
    return JSON.stringify(template);
  }

  return template.replace(/\$\{([^}]+)\}/g, (_, expr) => {
    try {
      const func = new Function(...Object.keys(context), `return (${expr});`);
      const value = func(...Object.values(context));

      return value?.toString();
    } catch {
      return '';
    }
  });
}
