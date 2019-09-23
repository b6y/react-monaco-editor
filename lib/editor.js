"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var monaco = __importStar(require("monaco-editor/esm/vs/editor/editor.api"));
var react_1 = __importDefault(require("react"));
var utils_1 = require("./utils");
function noop() { }
// monaco.languages.typescript.javascriptDefaults.addExtraLib(extraLib);
// monaco.languages.typescript.javascriptDefaults.addExtraLib(ramdaExtraLib);
// monaco.languages.typescript.javascriptDefaults.addExtraLib(cheerioExtraLib);
monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    allowJs: true,
    allowNonTsExtensions: true,
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    suppressExcessPropertyErrors: false,
});
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    allowNonTsExtensions: true,
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    suppressExcessPropertyErrors: false,
});
// monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
//   suppressExcessPropertyErrors: false,
// })
var MonacoEditor = /** @class */ (function (_super) {
    __extends(MonacoEditor, _super);
    function MonacoEditor(props) {
        var _this = _super.call(this, props) || this;
        _this.disposables = {};
        _this.assignRef = function (component) {
            _this.containerElement = component;
        };
        _this.containerElement = undefined;
        _this.currentValue = props.value;
        return _this;
    }
    MonacoEditor.prototype.componentDidMount = function () {
        this.initMonaco();
    };
    MonacoEditor.prototype.componentDidUpdate = function (prevProps) {
        if (this.props.value !== this.currentValue) {
            // Always refer to the latest value
            this.currentValue = this.props.value;
            // Consider the situation of rendering 1+ times before the editor mounted
            if (this.editor) {
                this.preventTriggerChangeEvent = true;
                if (this.currentValue) {
                    this.editor.setValue(this.currentValue);
                }
                else {
                    this.editor.setValue("");
                }
                this.preventTriggerChangeEvent = false;
            }
        }
        if (prevProps.language !== this.props.language) {
            if (this.editor) {
                var model = this.editor.getModel();
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
        if (this.editor
            && (this.props.width !== prevProps.width || this.props.height !== prevProps.height)) {
            this.editor.layout();
        }
        if (this.editor && this.props.options && prevProps.options !== this.props.options) {
            this.editor.updateOptions(this.props.options);
        }
    };
    MonacoEditor.prototype.componentWillUnmount = function () {
        this.destroyMonaco();
    };
    MonacoEditor.prototype.destroyMonaco = function () {
        if (typeof this.editor !== "undefined") {
            this.editor.dispose();
        }
        for (var _i = 0, _a = Object.keys(this.disposables); _i < _a.length; _i++) {
            var i = _a[_i];
            this.disposables[i].dispose();
            delete this.disposables[i];
        }
    };
    MonacoEditor.prototype.initMonaco = function () {
        for (var _i = 0, _a = Object.keys(this.disposables); _i < _a.length; _i++) {
            var i = _a[_i];
            this.disposables[i].dispose();
            delete this.disposables[i];
        }
        var value = this.props.value !== null ? this.props.value : this.props.defaultValue;
        var _b = this.props, language = _b.language, theme = _b.theme, options = _b.options;
        if (this.props.extraLibs) {
            for (var _c = 0, _d = Object.keys(this.props.extraLibs || {}); _c < _d.length; _c++) {
                var i = _d[_c];
                this.disposables[i + ".ts"] = monaco.languages.typescript.typescriptDefaults.addExtraLib(this.props.extraLibs[i], i + ".d.ts");
            }
        }
        if (this.containerElement) {
            // Before initializing monaco editor
            Object.assign(options, this.editorWillMount());
            this.editor = monaco.editor.create(this.containerElement, __assign({ value: value,
                language: language, scrollBeyondLastLine: false, minimap: {
                    enabled: false,
                } }, options));
            if (theme) {
                monaco.editor.setTheme(theme);
            }
            // After initializing monaco editor
            this.editorDidMount(this.editor);
        }
    };
    MonacoEditor.prototype.editorWillMount = function () {
        var editorWillMount = this.props.editorWillMount;
        if (editorWillMount) {
            var options = editorWillMount(monaco);
            return options || {};
        }
        return {};
    };
    MonacoEditor.prototype.editorDidMount = function (editor) {
        var _this = this;
        if (this.props.editorDidMount) {
            this.props.editorDidMount(editor, monaco);
            editor.onDidChangeModelContent(function (event) {
                var value = editor.getValue();
                // Always refer to the latest value
                _this.currentValue = value;
                // Only invoking when user input changed
                if (!_this.preventTriggerChangeEvent && _this.props.onChange) {
                    _this.props.onChange(value, event);
                }
            });
        }
    };
    MonacoEditor.prototype.render = function () {
        var _a = this.props, width = _a.width, height = _a.height;
        var fixedWidth = utils_1.processSize(width);
        var fixedHeight = utils_1.processSize(height);
        var style = {
            width: fixedWidth,
            height: fixedHeight,
        };
        return react_1.default.createElement("div", { ref: this.assignRef, style: style, className: "react-monaco-editor-container" });
    };
    MonacoEditor.defaultProps = {
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
    return MonacoEditor;
}(react_1.default.Component));
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
exports.default = MonacoEditor;
//# sourceMappingURL=editor.js.map