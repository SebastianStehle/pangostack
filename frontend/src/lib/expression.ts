type EvalContext = Record<string, unknown>;

export function evaluateExpression(template: string, context: EvalContext): string {
  if (!template) {
    return '';
  }

  return template.replace(/\$\{([^}]+)\}/g, (_, expr) => {
    try {
      const func = new Function(...Object.keys(context), `return (${expr});`);
      return func(...Object.values(context));
    } catch (ex) {
      return '';
    }
  });
}
