import { toast } from 'react-toastify';
import { buildError } from 'src/lib';
import { Markdown } from './Markdown';

export async function toastError(common: string, details?: string | Error | null) {
  const formatted = await buildError(common, details);

  toast.error(<Markdown>{formatted}</Markdown>);
}
