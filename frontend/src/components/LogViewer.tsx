import { CodeEditor } from './CodeEditor';

export default function LogViewer({ messages }: { messages: string }) {
  return (
    <div className="log">
      <CodeEditor value={messages} mode="javascript" valueMode="string" noWrap disabled autoScrollBottom />
    </div>
  );
}
