import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import React from "react";

import { MonacoEditorProps } from "./types";
import { processSize } from "./utils";


function noop() { }

// monaco.languages.typescript.javascriptDefaults.addExtraLib(extraLib);
// monaco.languages.typescript.javascriptDefaults.addExtraLib(ramdaExtraLib);
// monaco.languages.typescript.javascriptDefaults.addExtraLib(cheerioExtraLib);

monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  allowJs: true,
  allowNonTsExtensions: true,
  target: monaco.languages.typescript.ScriptTarget.ESNext,
  suppressExcessPropertyErrors: false,
})

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  allowNonTsExtensions: true,
  target: monaco.languages.typescript.ScriptTarget.ESNext,
  suppressExcessPropertyErrors: false,
})

// monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
//   suppressExcessPropertyErrors: false,
// })

class MonacoEditor extends React.Component<MonacoEditorProps> {
  public static defaultProps = {
    width: "100%",
    height: "100%",
    value: null,
    defaultValue: "",
    language: "javascript",
    theme: null,
    options: {},
    editorDidMount: noop,
    editorWillMount: noop,
    onChange: noop,
  };

  public containerElement?: HTMLElement;

  private currentValue?: string | null;
  private editor?: monaco.editor.IStandaloneCodeEditor;
  private preventTriggerChangeEvent?: boolean;

  private disposables: { [name: string]: monaco.IDisposable } = {};

  constructor(props: MonacoEditorProps) {
    super(props);
    this.containerElement = undefined;
    this.currentValue = props.value;
  }

  public componentDidMount() {
    this.initMonaco();
  }

  public componentDidUpdate(prevProps: MonacoEditorProps) {
    if (this.props.value !== this.currentValue) {
      // Always refer to the latest value
      this.currentValue = this.props.value;
      // Consider the situation of rendering 1+ times before the editor mounted
      if (this.editor) {
        this.preventTriggerChangeEvent = true;
        if (this.currentValue) {
          this.editor.setValue(this.currentValue);
        } else {
          this.editor.setValue("");
        }
        this.preventTriggerChangeEvent = false;
      }
    }
    if (prevProps.language !== this.props.language) {
      if (this.editor) {
        const model = this.editor.getModel()
        if (model && this.props.language) {
          monaco.editor.setModelLanguage(model, this.props.language);
        }
      }
    }
    if (prevProps.theme !== this.props.theme) {
      if (this.props.theme) {
        monaco.editor.setTheme(this.props.theme);
      }
    }
    if (
      this.editor
      && (this.props.width !== prevProps.width || this.props.height !== prevProps.height)
    ) {
      this.editor.layout();
    }

    if (this.editor && this.props.options && prevProps.options !== this.props.options) {
      this.editor.updateOptions(this.props.options);
    }
  }

  public componentWillUnmount() {
    this.destroyMonaco();
  }

  public assignRef = (component: HTMLDivElement) => {
    this.containerElement = component;
  }

  public destroyMonaco() {
    if (typeof this.editor !== "undefined") {
      this.editor.dispose();
    }

    for (const i of Object.keys(this.disposables)) {
      this.disposables[i].dispose();
      delete this.disposables[i];
    }
  }

  public initMonaco() {
    for (const i of Object.keys(this.disposables)) {
      this.disposables[i].dispose();
      delete this.disposables[i];
    }


    const value = this.props.value !== null ? this.props.value : this.props.defaultValue;
    const { language, theme, options } = this.props;

    if (this.props.extraLibs) {
      for (const i of Object.keys(this.props.extraLibs || {})) {
        this.disposables[i + ".ts"] = monaco.languages.typescript.typescriptDefaults.addExtraLib(
          this.props.extraLibs[i],
          i + ".d.ts",
        );
      }
    }

    if (this.containerElement) {
      // Before initializing monaco editor
      Object.assign(options, this.editorWillMount());

      this.editor = monaco.editor.create(this.containerElement, {
        value,
        language,
        scrollBeyondLastLine: false,
        minimap: {
          enabled: false,
        },
        ...options,
      });
      if (theme) {
        monaco.editor.setTheme(theme);
      }
      // After initializing monaco editor
      this.editorDidMount(this.editor);
    }
  }

  public editorWillMount() {
    const { editorWillMount } = this.props;
    if (editorWillMount) {
      const options = editorWillMount(monaco);
      return options || {};
    }

    return {}
  }

  public editorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    if (this.props.editorDidMount) {
      this.props.editorDidMount(editor, monaco);
      editor.onDidChangeModelContent((event) => {
        const value = editor.getValue();

        // Always refer to the latest value
        this.currentValue = value;

        // Only invoking when user input changed
        if (!this.preventTriggerChangeEvent && this.props.onChange) {
          this.props.onChange(value, event);
        }
      });
    }
  }

  public render() {
    const { width, height } = this.props;
    const fixedWidth = processSize(width);
    const fixedHeight = processSize(height);
    const style = {
      width: fixedWidth,
      height: fixedHeight,
    };

    return <div ref={this.assignRef} style={style} className="react-monaco-editor-container" />;
  }
}

// MonacoEditor.propTypes = {
//   width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//   height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//   value: PropTypes.string,
//   defaultValue: PropTypes.string,
//   language: PropTypes.string,
//   theme: PropTypes.string,
//   options: PropTypes.object,
//   editorDidMount: PropTypes.func,
//   editorWillMount: PropTypes.func,
//   onChange: PropTypes.func,
// };

export default MonacoEditor;
