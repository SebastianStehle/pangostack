import { CodeEditor } from './CodeEditor';

export interface LogViewerProps {
  // The log messages to render.
  messages: string;
}

export default function LogViewer(props: LogViewerProps) {
  const { messages } = props;

  return (
    <div className="log">
      <CodeEditor value={messages} mode="javascript" valueMode="string" noWrap disabled autoScrollBottom />
    </div>
  );
}
