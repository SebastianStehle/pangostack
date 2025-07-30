import { useMemo } from 'react';
import AceEditor from 'react-ace';
import { useEventCallback } from 'src/hooks';
import { isObject, isString } from 'src/lib';
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

  const doChange = useEventCallback((value: string) => {
    let output: any = value;
    if (valueMode === 'object') {
      try {
        output = JSON.parse(value);
        if (isObject(output)) {
          output = null;
        }
      } catch {
        output = null;
      }
    }

    onChange(output);
  });

  const parsedValue = useMemo(() => {
    if (!value) {
      return '';
    }

    if (!isString(value)) {
      return JSON.stringify(value);
    }

    return value;
  }, [value]);

  return (
    <div className="border-[1px] border-slate-300">
      <AceEditor height={height} value={parsedValue} mode={mode} onChange={doChange} onBlur={onBlur} width="100%" />
    </div>
  );
};
