import { BucketDto, ExtensionArgumentSpecDto, ExtensionSpecDto } from 'src/api';
import { Forms, Icon, Markdown } from 'src/components';
import { texts } from 'src/texts';

export interface ExtensionFormProps {
  // The buckets.
  buckets: BucketDto[];

  // The extension spec.
  spec: ExtensionSpecDto;
}

export function ExtensionForm(props: ExtensionFormProps) {
  const { buckets, spec } = props;

  return (
    <div className="flex flex-col">
      <Forms.Boolean name="enabled" label={texts.common.enabled} />

      {Object.keys(spec.arguments).length > 0 && (
        <>
          <hr className="mb-6" />

          {Object.entries(spec.arguments).map(([name, spec]) => (
            <Argument key={name} buckets={buckets} name={name} argument={spec} />
          ))}
        </>
      )}
    </div>
  );
}

function Argument({ buckets, name, argument }: { buckets: BucketDto[]; name: string; argument: ExtensionArgumentSpecDto }) {
  const { allowedValues, description, documentationUrl, editor, max, min, label, type } = argument;

  const hints = () => {
    if (!description) {
      return undefined;
    }

    return (
      <>
        <Markdown>{description}</Markdown>

        {documentationUrl && (
          <div className="mt-1">
            <span>{texts.common.documentationLabel}&nbsp;</span>

            <a className="text-primary hover:underline" href={documentationUrl} rel="noopener" target="_blank">
              <Icon icon="external-link" className="inline-block align-baseline" size={12} /> {texts.common.documentation}
            </a>
          </div>
        )}
      </>
    );
  };

  if (type === 'string' && editor === 'password') {
    return <Forms.Password name={`values.${name}`} label={label} hints={hints()} />;
  }

  if (type === 'string' && editor === 'select' && allowedValues) {
    const options = allowedValues.map((x) => ({ value: x, label: x }));

    return <Forms.Select name={`values.${name}`} options={options} label={label} hints={hints()} />;
  }

  if (type === 'string' && editor === 'textarea') {
    return <Forms.Textarea name={`values.${name}`} label={label} hints={hints()} />;
  }

  if (type === 'string') {
    return <Forms.Text name={`values.${name}`} label={label} hints={hints()} />;
  }

  if (type === 'number' && editor === 'slider') {
    const step = ((max || 100) - (min || 0)) / 100;

    return <Forms.Range name={`values.${name}`} max={max} min={min} step={step} label={label} hints={hints()} />;
  }

  if (type === 'number' && editor === 'bucket') {
    const options = buckets.map((x) => ({ value: x.id, label: x.name }));

    return <Forms.Select name={`values.${name}`} options={options} label={label} hints={hints()} />;
  }

  if (type === 'number') {
    const step = ((max || 100) - (min || 0)) / 100;

    return <Forms.Number name={`values.${name}`} max={max} min={min} step={step} label={label} hints={hints()} />;
  }

  if (type === 'boolean') {
    return <Forms.Boolean name={`values.${name}`} label={label} hints={hints()} />;
  }

  return null;
}
