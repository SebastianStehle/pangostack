import Editor from '@monaco-editor/react';
import classNames from 'classnames';
import { IDisposable, editor as MonacoEditor } from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import { useEventCallback } from 'src/hooks';
import { isEquals, isObject, isString } from 'src/lib';

export interface CodeEditorProps {
  // The value.
  value: any;

  // The editor model.
  mode: 'yaml' | 'javascript';

  // The value mode.
  valueMode: 'string' | 'object';

  // The optional number;
  height?: string;

  // Make the editor disabled.
  disabled?: boolean;

  // Disable wrapping.
  noWrap?: boolean;

  // Auto scroll to the last line.
  autoScrollBottom?: boolean;

  // When the value has changed.
  onChange?: (value: any) => void;

  // When the focus has lost.
  onBlur?: () => void;
}

export const CodeEditor = (props: CodeEditorProps) => {
  const { autoScrollBottom, height, mode, noWrap, onBlur, onChange, disabled, value, valueMode } = props;

  const [internalValue, setInternalValue] = useState(() => stringifyValue(value));
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const blurSubscriptionRef = useRef<IDisposable | null>(null);
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
    onChange?.(output);
  });

  useEffect(() => {
    if (editorRef.current && autoScrollBottom) {
      const editor = editorRef.current;

      const timeout = setTimeout(() => {
        const lineCount = editor.getModel()?.getLineCount() ?? 1;
        editor.revealLine(lineCount);
      }, 50);

      return () => clearTimeout(timeout);
    }
  }, [autoScrollBottom, value]);

  useEffect(() => {
    return () => {
      blurSubscriptionRef.current?.dispose();
    };
  }, []);

  const isFullHeight = height === 'full';
  const editorHeight = isFullHeight ? '100%' : height;

  return (
    <div
      className={classNames({
        'border-[1px] border-slate-300': !isFullHeight,
        'absolute top-0 right-0 bottom-0 left-0': isFullHeight,
      })}
    >
      <Editor
        height={editorHeight}
        language={mode}
        onChange={(editorValue) => doChange(editorValue ?? '')}
        onMount={(editor) => {
          editorRef.current = editor;
          blurSubscriptionRef.current?.dispose();
          blurSubscriptionRef.current = onBlur ? editor.onDidBlurEditorText(onBlur) : null;
        }}
        options={{
          automaticLayout: true,
          minimap: { enabled: false },
          readOnly: disabled,
          scrollBeyondLastLine: false,
          wordWrap: noWrap ? 'off' : 'on',
        }}
        theme="vs"
        value={internalValue}
        width="100%"
      />
    </div>
  );
};

const stringifyValue = (value: any): string => {
  if (value == null) return '';
  return isString(value) ? value : JSON.stringify(value, undefined, 2);
};
