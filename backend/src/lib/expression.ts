type EvalContext = Record<string, any>;

export function evaluateExpression(template: string, context: EvalContext): string {
  if (!template) {
    return '';
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
