import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import AceEditor from 'react-ace';
import { useEventCallback } from 'src/hooks';
import { isEquals, isObject, isString } from 'src/lib';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

export interface CodeEditorProps {
  // The value.
  value: any;

  // The editor model.
  mode: 'yaml' | 'javascript';

  // The value mode.
  valueMode: 'string' | 'object';

  // The optional number;
  height?: string;

  // When the value has changed.
  onChange: (value: any) => void;

  // When the focus has lost.
  onBlur: () => void;
}

export const CodeEditor = (props: CodeEditorProps) => {
  const { height, mode, onBlur, onChange, value, valueMode } = props;

  const [internalValue, setInternalValue] = useState(() => stringifyValue(value));
  const outputValue = useRef<any>();

  useEffect(() => {
    if (isEquals(value, outputValue.current)) {
      return;
    }

    setInternalValue(stringifyValue(value));
  }, [value]);

  const doChange = useEventCallback((editorValue: string) => {
    setInternalValue(editorValue);

    let output: any = editorValue;
    if (valueMode === 'object') {
      try {
        const parsed = JSON.parse(editorValue);
        output = isObject(parsed) ? parsed : null;
      } catch {
        output = null;
      }
    }

    outputValue.current = output;
    onChange(output);
  });

  const isFullHeight = height === 'full';
  const editorHeight = isFullHeight ? '100%' : height;

  return (
    <div
      className={classNames({
        'border-[1px] border-slate-300': !isFullHeight,
        'absolute top-0 right-0 bottom-0 left-0': isFullHeight,
      })}
    >
      <AceEditor
        height={editorHeight}
        mode={mode}
        onBlur={onBlur}
        onChange={doChange}
        value={internalValue}
        width="100%"
        wrapEnabled={true}
      />
    </div>
  );
};

const stringifyValue = (value: any): string => {
  if (value == null) return '';
  return isString(value) ? value : JSON.stringify(value);
};
