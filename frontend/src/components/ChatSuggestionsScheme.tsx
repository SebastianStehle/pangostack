import * as Yup from 'yup';
import { texts } from 'src/texts';

export const CHAT_SUGGESTIONS_SCHEME = Yup.array(
  Yup.object().shape({
    // Required title.
    title: Yup.string().required().label(texts.common.title),

    // Required subtitle.
    subtitle: Yup.string().required().label(texts.common.subtitle),

    // Required text.
    text: Yup.string().required().label(texts.common.text),
  }),
).max(10);
