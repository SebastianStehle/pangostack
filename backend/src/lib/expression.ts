import { parseScript } from 'esprima';
import evaluate from 'static-eval';

export function expression(source: string, context: any) {
  try {
    const parsed = parseScript(source).body[0] as any;

    return evaluate(parsed.expression, context);
  } catch {
    return source;
  }
}
