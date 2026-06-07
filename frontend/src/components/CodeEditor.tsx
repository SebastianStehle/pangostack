import Editor from '@monaco-editor/react';
import classNames from 'classnames';
import type { IDisposable, editor as MonacoEditor } from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { configureMonacoYaml } from 'monaco-yaml';
import YamlWorker from 'monaco-yaml/yaml.worker?worker';
import { useEffect, useRef, useState } from 'react';
import { useEventCallback } from 'src/hooks';
import { isEquals, isObject, isString } from 'src/lib';

const configureMonacoEnvironment = () => {
  const globalScope = globalThis as any;
  const previousGetWorker = globalScope.MonacoEnvironment?.getWorker;

  globalScope.MonacoEnvironment = {
    ...(globalScope.MonacoEnvironment || {}),
    getWorker(moduleId: string, label: string) {
      if (label === 'yaml') {
        return new YamlWorker();
      }

      if (previousGetWorker) {
        return previousGetWorker(moduleId, label);
      }

      return new EditorWorker();
    },
  };
};

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
  const blurSubscriptionRef = useRef<IDisposable | null>(null);
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const monacoYamlRef = useRef<{ dispose: () => void } | null>(null);
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
    monacoYamlRef.current?.dispose();
    const monaco = monacoRef.current;
    if (!monaco || mode !== 'yaml' || !jsonSchemaPath) {
      return;
    }

    monacoYamlRef.current = configureMonacoYaml(monaco, {
      schemas: [
        {
          fileMatch: ['**/*.yaml', '**/*.yml'],
          uri: jsonSchemaPath,
        },
      ],
    });
  }, [jsonSchemaPath, mode]);

  useEffect(() => {
    return () => {
      blurSubscriptionRef.current?.dispose();
      monacoYamlRef.current?.dispose();
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
          configureMonacoEnvironment();
          monacoRef.current = monaco;
        }}
        height={editorHeight}
        language={mode === 'yaml' ? 'yaml' : 'javascript'}
        path={mode === 'yaml' ? 'file:///editor.yaml' : undefined}
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
};

const stringifyValue = (value: any): string => {
  if (value == null) return '';
  return isString(value) ? value : JSON.stringify(value, undefined, 2);
};
