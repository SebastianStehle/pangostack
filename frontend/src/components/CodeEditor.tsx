import Editor from '@monaco-editor/react';
import classNames from 'classnames';
import type { IDisposable, editor as MonacoEditor } from 'monaco-editor';
import { configureMonacoYaml } from 'monaco-yaml';
import { forwardRef, useEffect, useRef, useState } from 'react';
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

  // The optional JSON schema path.
  jsonSchemaPath?: string;

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

type Monaco = typeof import('monaco-editor');

export const CodeEditor = forwardRef<HTMLDivElement, CodeEditorProps>((props, ref) => {
  const { autoScrollBottom, disabled, height, jsonSchemaPath, mode, noWrap, onBlur, onChange, value, valueMode } = props;

  const [internalValue, setInternalValue] = useState(() => stringifyValue(value));
  const [monaco, setMonaco] = useState<Monaco | null>(null);
  const blurSubscriptionRef = useRef<IDisposable | null>(null);
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const outputValue = useRef<any>();

  useEffect(() => {
    if (isEquals(value, outputValue.current)) {
      return;
    }

    setInternalValue(stringifyValue(value));
  }, [value]);

  const doChange = useEventCallback((editorValue: string | undefined) => {
    const coercedValue = editorValue ?? '';
    setInternalValue(coercedValue);

    let output: any = editorValue;
    if (valueMode === 'object') {
      try {
        const parsed = JSON.parse(coercedValue);
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
    if (!monaco || mode !== 'yaml' || !jsonSchemaPath) {
      return;
    }

    const yamlConfig = configureMonacoYaml(monaco, {
      schemas: [
        {
          fileMatch: ['file:///editor.yaml'],
          uri: jsonSchemaPath,
        },
      ],
    });

    return () => {
      yamlConfig.dispose();
    };
  }, [jsonSchemaPath, mode, monaco]);

  useEffect(() => {
    return () => {
      blurSubscriptionRef.current?.dispose();
    };
  }, []);

  const isFullHeight = height === 'full';
  const editorHeight = isFullHeight ? '100%' : height;
  const editorPath = mode === 'yaml' ? 'file:///editor.yaml' : 'file:///editor.js';

  return (
    <div
      ref={ref}
      className={classNames({
        'border-[1px] border-slate-300': !isFullHeight,
        'absolute top-0 right-0 bottom-0 left-0': isFullHeight,
      })}
    >
      <Editor
        beforeMount={setMonaco}
        height={editorHeight}
        language={mode}
        path={editorPath}
        onChange={doChange}
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
});

CodeEditor.displayName = 'CodeEditor';

const stringifyValue = (value: any): string => {
  if (value == null) return '';
  return isString(value) ? value : JSON.stringify(value, undefined, 2);
};
