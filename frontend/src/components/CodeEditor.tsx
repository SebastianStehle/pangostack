import Editor from '@monaco-editor/react';
import classNames from 'classnames';
<<<<<<< HEAD
import type { editor as MonacoEditor } from 'monaco-editor';
import { configureMonacoYaml } from 'monaco-yaml';
import { useEffect, useMemo, useRef, useState } from 'react';
=======
import { IDisposable, editor as MonacoEditor } from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
>>>>>>> origin/main
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
<<<<<<< HEAD
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const yamlDisposableRef = useRef<{ dispose: () => void } | null>(null);
  const blurDisposableRef = useRef<{ dispose: () => void } | null>(null);
  const editorId = useRef(`code-editor-${Math.random().toString(36).slice(2)}`);
=======
  const blurSubscriptionRef = useRef<IDisposable | null>(null);
>>>>>>> origin/main
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
<<<<<<< HEAD
    const editor = editorRef.current;
    if (editor && autoScrollBottom) {
      setTimeout(() => {
        const lineCount = editor.getModel()?.getLineCount() || 1;
=======
    if (editorRef.current && autoScrollBottom) {
      const editor = editorRef.current;

      const timeout = setTimeout(() => {
        const lineCount = editor.getModel()?.getLineCount() ?? 1;
>>>>>>> origin/main
        editor.revealLine(lineCount);
      }, 50);

      return () => clearTimeout(timeout);
    }
  }, [autoScrollBottom, value]);

  useEffect(() => {
<<<<<<< HEAD
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
      blurDisposableRef.current?.dispose();
      yamlDisposableRef.current?.dispose();
=======
    return () => {
      blurSubscriptionRef.current?.dispose();
>>>>>>> origin/main
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
<<<<<<< HEAD
        beforeMount={(monaco) => {
          monacoRef.current = monaco;
        }}
        height={editorHeight}
        language={mode === 'yaml' ? 'yaml' : 'javascript'}
        onChange={(next) => doChange(next || '')}
        onMount={(editor) => {
          editorRef.current = editor;
          blurDisposableRef.current?.dispose();
          blurDisposableRef.current = editor.onDidBlurEditorWidget(() => {
            onBlur?.();
          });
=======
        height={editorHeight}
        language={mode}
        onChange={(editorValue) => doChange(editorValue ?? '')}
        onMount={(editor) => {
          editorRef.current = editor;
          blurSubscriptionRef.current?.dispose();
          blurSubscriptionRef.current = onBlur ? editor.onDidBlurEditorText(onBlur) : null;
>>>>>>> origin/main
        }}
        options={{
          automaticLayout: true,
          minimap: { enabled: false },
          readOnly: disabled,
<<<<<<< HEAD
          wordWrap: noWrap ? 'off' : 'on',
        }}
        path={editorPath}
=======
          scrollBeyondLastLine: false,
          wordWrap: noWrap ? 'off' : 'on',
        }}
>>>>>>> origin/main
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
