import { useFieldArray } from 'react-hook-form';
import { texts } from 'src/texts';
import { Forms } from './Forms';
import { Icon } from './Icon';

export interface ChatSuggestionsProps {
  // The name of the form element.
  name: string;
}

export function ChatSuggestions(props: ChatSuggestionsProps) {
  const { name } = props;
  const array = useFieldArray({ name });

  return (
    <div className="grid gap-2">
      {array.fields.map((item, index) => (
        <div className="flex flex-row gap-2" key={item.id}>
          <div className="w-1/3">
            <Forms.Text vertical name={`${name}.${index}.title`} />
          </div>
          <div className="w-1/3">
            <Forms.Text vertical name={`${name}.${index}.subtitle`} />
          </div>
          <div className="w-1/3">
            <Forms.Text vertical name={`${name}.${index}.text`} />
          </div>
          <div>
            <button className="btn btn-ghost font-bold text-error" onClick={() => array.remove(index)}>
              <Icon size={16} icon="close" />
            </button>
          </div>
        </div>
      ))}

      {array.fields.length < 10 && (
        <div className="flex flex-row gap-2 text-sm  text-slate-600">
          <div className="w-1/3">
            <div className="flex h-12 items-center rounded-box bg-slate-200 px-4">{texts.common.title}</div>
          </div>
          <div className="w-1/3">
            <div className="flex h-12 items-center rounded-box bg-slate-200 px-4">{texts.common.subtitle}</div>
          </div>
          <div className="w-1/3">
            <div className="flex h-12 items-center rounded-box bg-slate-200 px-4">{texts.common.text}</div>
          </div>
          <div>
            <button type="button" className="btn btn-success" onClick={() => array.append({})}>
              <Icon size={16} icon="plus" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
