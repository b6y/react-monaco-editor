import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import React from "react";
import { MonacoEditorProps } from "./types";
declare function noop(): void;
declare class MonacoEditor extends React.Component<MonacoEditorProps> {
    static defaultProps: {
        width: string;
        height: string;
        value: null;
        defaultValue: string;
        language: string;
        theme: null;
        options: {};
        editorDidMount: typeof noop;
        editorWillMount: typeof noop;
        onChange: typeof noop;
    };
    containerElement?: HTMLElement;
    private currentValue?;
    private editor?;
    private preventTriggerChangeEvent?;
    private disposables;
    constructor(props: MonacoEditorProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: MonacoEditorProps): void;
    componentWillUnmount(): void;
    assignRef: (component: HTMLDivElement) => void;
    destroyMonaco(): void;
    initMonaco(): void;
    editorWillMount(): monaco.editor.IEditorConstructionOptions;
    editorDidMount(editor: monaco.editor.IStandaloneCodeEditor): void;
    render(): JSX.Element;
}
export default MonacoEditor;
