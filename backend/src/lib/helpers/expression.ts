import { isString } from './types';

type EvalContext = Record<string, unknown>;

// Identifiers that must not resolve to the ambient host globals inside an expression. Definitions
// are authored by administrators, but shadowing these (plus strict mode, which makes `this`
// undefined) keeps a template from trivially reaching the host environment.
const BLOCKED_GLOBALS = ['process', 'global', 'globalThis', 'require', 'module', 'exports', '__dirname', '__filename'];

export function evaluateExpression(template: string | undefined, context: EvalContext): string {
  if (!template) {
    return '';
  }

  if (!isString(template)) {
    return JSON.stringify(template);
  }

  const contextKeys = Object.keys(context);
  const blocked = BLOCKED_GLOBALS.filter((name) => !contextKeys.includes(name));

  const argNames = [...contextKeys, ...blocked];
  const argValues = [...Object.values(context), ...blocked.map(() => undefined)];

  return template.replace(/\$\{([^}]+)\}/g, (_, expr) => {
    try {
      const func = new Function(...argNames, `"use strict"; return (${expr});`);
      const value = func(...argValues);

      return value?.toString();
    } catch {
      return '';
    }
  });
}
