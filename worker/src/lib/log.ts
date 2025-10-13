import { Format, TransformableInfo } from 'logform';

export class PrettyFormat implements Format {
  options?: object;

  transform(info: TransformableInfo): TransformableInfo {
    const message = info.message as string;

    if (!message) {
      return info;
    }

    info.message = message.replace(/{(.*?)}/g, (_match, placeholder) => {
      return info[placeholder] || placeholder;
    });

    return info;
  }
}

export function safeStringify(obj: unknown, space = 2): string {
  const cache = new WeakSet();
  return JSON.stringify(
    obj,
    (_, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) return '[Circular]';
        cache.add(value);
      }
      return value;
    },
    space,
  );
}
