require.config({ paths: { vs: "https://unpkg.com/monaco-editor/min/vs" } });

export let monacoEditor;

export const tabSize = 2;

export function getEditorContent(editor) {
  return editor.getValue();
}

export function setEditorContent(editor, content) {
  editor.setValue(content);
}

require(['vs/editor/editor.main'], function () {
  monacoEditor = monaco.editor.create(document.getElementById('jsonEditor'), {
    value: '',
    language: 'json',
    theme: 'vs',
    automaticLayout: true,
    lineNumbers: 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    tabSize: tabSize,
    insertSpaces: true,
    copyWithSyntaxHighlighting: true,
    detectIndentation: true,
    selectionHighlight: false,
    acceptSuggestionOnEnter: 'on'
  });

  // Adjust height dynamically based on envOutputTextarea height
  const envOutputTextarea = document.getElementById('output');
  const adjustEditorHeight = () => {
    const outputHeight = envOutputTextarea.clientHeight;
    const style = window.getComputedStyle(envOutputTextarea);
    const paddingTop = parseFloat(style.paddingTop);
    const paddingBottom = parseFloat(style.paddingBottom);
    const totalPadding = paddingTop + paddingBottom;
    const adjustedHeight = outputHeight - totalPadding;
    monacoEditor.layout({ width: monacoEditor.getLayoutInfo().width, height: adjustedHeight });
  };

  // Initial layout adjustment
  adjustEditorHeight();

  // Height adjustment on window resize
  window.addEventListener('resize', adjustEditorHeight);

  // Drag-n-drop file support
  const editorContainer = document.getElementById('jsonEditor');

  editorContainer.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  });

  editorContainer.addEventListener('drop', async (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setEditorContent(monacoEditor, content);
      };
      reader.readAsText(file);
    }
  });
});