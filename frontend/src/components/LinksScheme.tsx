import * as Yup from 'yup';
import { texts } from 'src/texts';

export const LINKS_SCHEME = Yup.array(
  Yup.object().shape({
    // Required title.
    title: Yup.string().required().label(texts.common.title),

    // Required url.
    url: Yup.string().required().label(texts.common.url).url(),
  }),
).max(10);
