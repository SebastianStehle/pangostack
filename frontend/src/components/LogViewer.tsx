import { useEffect, useRef } from 'react';

interface LogViewerProps {
  messages: string;
}

export default function LogViewer({ messages }: LogViewerProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={logRef} className="h-130 overflow-auto font-mono">
      {messages.split('\n').map((line, i) => (
        <div key={i} className={`text-sm whitespace-pre`}>
          {line}
        </div>
      ))}
    </div>
  );
}
