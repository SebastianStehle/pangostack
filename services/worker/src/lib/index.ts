import { Format, TransformableInfo } from 'logform';

export class PrettyFormat implements Format {
  options?: object;

  transform(info: TransformableInfo): TransformableInfo {
    const message = info.message as string;

    if (!message) {
      return info;
    }

    info.message = message.replace(/{(.*?)}/g, (match, placeholder) => {
      return info[placeholder] || placeholder;
    });

    return info;
  }
}
