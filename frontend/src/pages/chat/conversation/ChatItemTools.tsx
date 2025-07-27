export interface ChatItemToolsProps {
  // The tool sthat are currently running.
  tools: Record<string, 'Started' | 'Completed'>;
}

export function ChatItemTools(props: ChatItemToolsProps) {
  const { tools } = props;

  const entries = Object.entries(tools);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="mb-1 flex gap-2">
      {Object.entries(tools).map(([name, state]) => (
        <div className="flex items-center gap-1 rounded border-[1px] border-gray-200 px-2 py-1" key={name}>
          {name}

          {state === 'Started' && (
            <>
              <span className="loading loading-spinner loading-xs"></span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
