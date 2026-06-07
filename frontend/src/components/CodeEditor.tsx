import Editor from '@monaco-editor/react';
import classNames from 'classnames';
import type { IDisposable, editor as MonacoEditor } from 'monaco-editor';
import { configureMonacoYaml } from 'monaco-yaml';
import { useEffect, useMemo, useRef, useState } from 'react';
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

export const CodeEditor = (props: CodeEditorProps) => {
  const { autoScrollBottom, disabled, height, jsonSchemaPath, mode, noWrap, onBlur, onChange, value, valueMode } = props;

  const [internalValue, setInternalValue] = useState(() => stringifyValue(value));
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const yamlDisposableRef = useRef<{ dispose: () => void } | null>(null);
  const blurSubscriptionRef = useRef<IDisposable | null>(null);
  const editorId = useRef(`code-editor-${Math.random().toString(36).slice(2)}`);
  const outputValue = useRef<any>();
  const editorPath = useMemo(() => `file:///code-editor/${editorId.current}.${mode === 'yaml' ? 'yaml' : 'js'}`, [mode]);

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
    const monaco = monacoRef.current;
    if (!monaco || mode !== 'yaml') {
      return;
    }

    yamlDisposableRef.current?.dispose();

    yamlDisposableRef.current = configureMonacoYaml(monaco, {
      completion: true,
      enableSchemaRequest: true,
      hover: true,
      validate: true,
      schemas: jsonSchemaPath
        ? [
            {
              fileMatch: [editorPath],
              uri: jsonSchemaPath,
            },
          ]
        : [],
    });
  }, [editorPath, jsonSchemaPath, mode]);

  useEffect(() => {
    return () => {
      blurSubscriptionRef.current?.dispose();
      yamlDisposableRef.current?.dispose();
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
        beforeMount={(monaco) => {
          monacoRef.current = monaco;
        }}
        height={editorHeight}
        language={mode === 'yaml' ? 'yaml' : 'javascript'}
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
        path={editorPath}
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
