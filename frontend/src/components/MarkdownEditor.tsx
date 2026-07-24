import { SimpleMdeReact, SimpleMDEReactProps } from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';

const OPTIONS = { spellChecker: false, status: false };

export interface MarkdownEditorProps extends SimpleMDEReactProps, React.RefAttributes<HTMLDivElement> {}

export const MarkdownEditor = (props: MarkdownEditorProps) => {
  return <SimpleMdeReact options={OPTIONS} {...props} />;
};
