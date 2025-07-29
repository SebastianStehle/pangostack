import { SimpleMdeReact, SimpleMDEReactProps } from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';

const OPTIONS = { spellChecker: false, status: false };

export const MarkdownEditor = (props: SimpleMDEReactProps & React.RefAttributes<HTMLDivElement>) => {
  return <SimpleMdeReact options={OPTIONS} {...props} />;
};
