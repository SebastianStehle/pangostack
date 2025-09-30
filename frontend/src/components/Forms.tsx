/* eslint-disable react-refresh/only-export-components */
import { ChangeEventData } from '@yaireo/tagify';
import Tags from '@yaireo/tagify/dist/react.tagify';
import classNames from 'classnames';
import { ChangeEvent, HTMLProps, PropsWithChildren, ReactNode } from 'react';
import { ControllerFieldState, FormState, useController } from 'react-hook-form';
import { useEventCallback } from 'src/hooks';
import { isString } from 'src/lib';
import { texts } from 'src/texts';
import { CodeEditor, CodeEditorProps } from './CodeEditor';
import { FormControlError } from './FormControlError';
import { Markdown } from './Markdown';
import { MarkdownEditor } from './MarkdownEditor';
import { NumberInput } from './NumberInput';
import { Toggle } from './Toggle';

export type FormEditorOption<T> = {
  // The value to select.
  value?: T;

  // The label to render.
  label: string;
};

export interface FormEditorProps {
  // The label.
  label?: string;

  // The optional class name.
  className?: string;

  // The optional placeholder.
  placeholder?: string;

  // The hints.
  hints?: ReactNode;

  // The form name.
  name: string;

  // True to hide the error.
  hideError?: boolean;

  // Indicator if the field is required.
  required?: boolean;

  // Indicator if the field is readonly.
  readOnly?: boolean;

  // The layout.
  vertical?: boolean;

  // True if disabled.
  disabled?: boolean;
}

export interface NumberFormEditorProps extends FormEditorProps {
  // The minimum allowed value.
  min?: number;

  // The maximum allowed value.
  max?: number;

  // The steps.
  step?: number;
}

export interface OptionsFormEditorProps<T> extends FormEditorProps {
  // The allowed selected values.
  options: FormEditorOption<T>[];
}

export interface CodeFormEditorProps extends FormEditorProps, Omit<CodeEditorProps, 'onBlur' | 'onChange' | 'value'> {}

export interface FormRowProps extends FormEditorProps, PropsWithChildren {}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Forms {
  export const Error = ({ name }: { name: string }) => {
    const { fieldState, formState } = useController({ name });

    return (
      <FormControlError error={fieldState.error?.message} submitCount={formState.submitCount} touched={fieldState.isTouched} />
    );
  };

  export const Hints = ({ className, hints }: { className?: string; hints?: string }) => {
    return <FormDescription className={className} hints={hints} />;
  };

  export const Row = (props: FormRowProps & { aligned?: boolean }) => {
    const { aligned, children, className, hideError, hints, name, label, readOnly, required, vertical } = props;

    const labelText = (
      <>
        {label}

        {label && required && (
          <span
            className="text-error px-1 font-bold"
            data-tooltip-id="default"
            data-tooltip-content={texts.common.required}
            data-tooltip-delay-show={1000}
          >
            *
          </span>
        )}
        {label && readOnly && <div className="badge badge-sm badge-error">{texts.common.readonly}</div>}
      </>
    );

    return vertical ? (
      <div className={classNames('form-row flex flex-col', className, { 'items-center': aligned })}>
        {label && (
          <label className="mb-1 text-sm font-semibold" htmlFor={name}>
            {labelText}
          </label>
        )}

        {!hideError && <Forms.Error name={name} />}

        {children}

        <FormDescription hints={hints} />
      </div>
    ) : (
      <div className={classNames('form-row flex flex-row', className, { 'items-center': aligned })}>
        <label className="my-3 w-48 shrink-0 text-sm font-semibold" htmlFor={name}>
          {labelText}
        </label>

        <div className="min-w-0 grow">
          {!hideError && <Forms.Error name={name} />}

          {children}

          <FormDescription hints={hints} />
        </div>
      </div>
    );
  };

  export const Text = ({ className, required, ...other }: FormEditorProps & HTMLProps<HTMLInputElement>) => {
    return (
      <Forms.Row className={className} required={required} {...other}>
        <InputText type="text" {...other} />
      </Forms.Row>
    );
  };

  export const Url = ({ className, required, ...other }: FormEditorProps & HTMLProps<HTMLInputElement>) => {
    return (
      <Forms.Row className={className} required={required} {...other}>
        <InputText type="url" {...other} />
      </Forms.Row>
    );
  };

  export const Color = ({ className, required, ...other }: FormEditorProps) => {
    return (
      <Forms.Row className={className} required={required} {...other}>
        <InputText type="color" {...other} className="!w-[3rem] px-1" />
      </Forms.Row>
    );
  };

  export const Tags = ({ className, required, ...other }: FormEditorProps) => {
    return (
      <Forms.Row className={className} required={required} {...other}>
        <InputTags {...other} />
      </Forms.Row>
    );
  };

  export const Textarea = ({ className, required, ...other }: FormEditorProps) => {
    return (
      <Forms.Row className={className} required={required} {...other}>
        <InputTextarea {...other} />
      </Forms.Row>
    );
  };

  export const Number = ({ className, required, ...other }: NumberFormEditorProps) => {
    return (
      <Forms.Row className={className} required={required} {...other}>
        <InputNumber {...other} />
      </Forms.Row>
    );
  };

  export const Range = ({ className, required, ...other }: NumberFormEditorProps) => {
    return (
      <Forms.Row className={className} required={required} aligned={true} {...other}>
        <InputRange {...other} />
      </Forms.Row>
    );
  };

  export const Markdown = ({ className, required, ...other }: FormEditorProps) => {
    return (
      <Forms.Row className={className} required={required} {...other}>
        <InputMarkdown {...other} />
      </Forms.Row>
    );
  };

  export const Code = ({ className, required, ...other }: CodeFormEditorProps) => {
    return (
      <Forms.Row className={className} required={required} {...other}>
        <InputCode {...other} />
      </Forms.Row>
    );
  };

  export const Password = ({ className, required, ...other }: FormEditorProps) => {
    return (
      <Forms.Row className={className} required={required} {...other}>
        <InputText type="password" {...other} />
      </Forms.Row>
    );
  };

  export const Boolean = ({ className, required, label, vertical, ...other }: FormEditorProps) => {
    return (
      <Forms.Row className={className} required={required} label={!vertical ? label : undefined} vertical={vertical} {...other}>
        <InputToggle label={label} vertical={vertical} {...other} />
      </Forms.Row>
    );
  };

  export const Select = ({ className, required, options, ...other }: OptionsFormEditorProps<any>) => {
    return (
      <Forms.Row className={className} required={required} {...other}>
        <InputSelect options={options} {...other} />
      </Forms.Row>
    );
  };
}

const FormDescription = ({ className, hints }: { className?: string; hints?: ReactNode }) => {
  if (!hints) {
    return null;
  }

  return (
    <div className={classNames(className, 'text-sm leading-6 text-slate-500')}>
      {isString(hints) ? <Markdown>{hints}</Markdown> : hints}
    </div>
  );
};

const InputText = ({ className, name, ...other }: FormEditorProps & HTMLProps<HTMLInputElement>) => {
  const { field, fieldState, formState } = useController({ name });

  return (
    <input
      id={name}
      {...field}
      {...other}
      className={classNames('input input-bordered w-full', className, { 'input-error': isInvalid(fieldState, formState) })}
    />
  );
};

const InputNumber = ({ className, name, ...other }: FormEditorProps & HTMLProps<HTMLInputElement>) => {
  const { field, fieldState, formState } = useController({ name });

  return (
    <NumberInput
      id={name}
      {...field}
      {...other}
      className={classNames('input input-bordered w-full', className, { 'input-error': isInvalid(fieldState, formState) })}
    />
  );
};

const InputTextarea = ({ className, name, ...other }: FormEditorProps) => {
  const { field, fieldState, formState } = useController({ name });

  return (
    <textarea
      id={name}
      {...field}
      {...other}
      className={classNames('textarea textarea-bordered w-full', className, {
        'textarea-error': isInvalid(fieldState, formState),
      })}
    />
  );
};

const InputRange = ({ className, name, ...other }: FormEditorProps & HTMLProps<HTMLInputElement>) => {
  const { field, fieldState, formState } = useController({ name });

  return (
    <div className="flex flex-row">
      <div className="max-w-24 grow">
        <input
          type="range"
          id={name}
          {...other}
          {...field}
          className={classNames('h-2 w-full appearance-none rounded bg-gray-200', className, {
            'range-error': isInvalid(fieldState, formState),
          })}
        />
      </div>
      <div className="w-12 text-right">{field.value}</div>
    </div>
  );
};

const InputToggle = ({ className, label, name, vertical, ...other }: FormEditorProps) => {
  const { field } = useController({ name });

  return (
    <div className="flex items-center gap-2">
      <Toggle
        className={classNames(className, { 'mt-3': !vertical })}
        {...other}
        checked={field.value}
        onBlur={field.onBlur}
        onChange={field.onChange}
      />

      {vertical && <label htmlFor={name}>{label}</label>}
    </div>
  );
};

const InputTags = ({ className, name, ...other }: FormEditorProps) => {
  const { field, fieldState, formState } = useController({ name });

  const doChange = useEventCallback((event: CustomEvent<ChangeEventData<any>>) => {
    const values: any[] = JSON.parse(event.detail.value || '[]');

    field.onChange(values.map((x) => x.value));
  });

  return (
    <>
      <Tags
        {...other}
        onChange={doChange}
        value={field.value || []}
        settings={{ dropdown: { enabled: false } }}
        className={classNames('tags input input-bordered w-full', className, { 'input-error': isInvalid(fieldState, formState) })}
      />
    </>
  );
};

const InputSelect = ({
  className,
  name,
  options,
}: FormEditorProps & { options: ReadonlyArray<FormEditorOption<string | number>> }) => {
  const { field, fieldState, formState } = useController({ name });

  const doChange = useEventCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    if (value === SET_UNDEFINED) {
      field.onChange(undefined);
    } else {
      field.onChange(event);
    }
  });

  return (
    <>
      <select
        id={name}
        {...field}
        onChange={doChange}
        className={classNames('select select-bordered w-full', className, { 'select-error': isInvalid(fieldState, formState) })}
      >
        {isUndefined(field.value) && !options.find((x) => x.value === field.value) && <option></option>}

        {options.map((option, i) => (
          <option key={i} value={isUndefined(option.value) ? SET_UNDEFINED : option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  );
};

const InputMarkdown = ({ name }: FormEditorProps) => {
  const { field } = useController({ name });

  return <MarkdownEditor id={name} {...field} />;
};

const InputCode = ({ name, ...other }: CodeFormEditorProps) => {
  const { field } = useController({ name });

  return <CodeEditor {...field} {...other} />;
};

const SET_UNDEFINED = '__UNDEFINED';

function isUndefined(value: any): value is undefined {
  return typeof value === 'undefined';
}

function isInvalid(fieldState: ControllerFieldState, formState: FormState<any>) {
  return !!fieldState.error && (fieldState.isTouched || formState.submitCount > 0);
}
