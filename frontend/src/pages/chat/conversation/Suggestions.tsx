import { useMemo } from 'react';
import { DeploymentDto } from 'src/api';
import { useTheme } from 'src/hooks';

export interface SuggestionsProps {
  // The actual deployment.
  deployment?: DeploymentDto;

  // Invoked when the user selects a suggestion.
  onSelect: (input: string) => void;
}

export function Suggestions(props: SuggestionsProps) {
  const { deployment, onSelect } = props;

  const { theme } = useTheme();

  const suggestions = useMemo(() => {
    return [...(theme.chatSuggestions || []), ...(deployment?.chatSuggestions || [])];
  }, [deployment, theme]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mb-2 grid grid-cols-3 gap-2">
      {suggestions.map((x, i) => (
        <div
          className="btn btn-ghost h-auto flex-col items-start border-slate-300 py-4 text-left font-normal leading-5 hover:bg-gray-200"
          key={i}
          onClick={() => onSelect(x.text)}
        >
          <strong>{x.title}</strong>

          <div className="text-slate-500">{x.subtitle}</div>
        </div>
      ))}
    </div>
  );
}
