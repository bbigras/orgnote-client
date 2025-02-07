import { EditorView } from 'codemirror';

const cursorColor = 'var(--fg)';

export const basicOrgTheme = EditorView.theme({
  '.cm-content': {
    caretColor: cursorColor,
    width: '100%',
  },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: cursorColor },

  '.cm-line': {
    padding: '0',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection, .cm-line ::selection':
    {
      backgroundColor: 'var(--base8) !important',
      color: 'var(--fg) !important',
    },

  '.cm-gutterElement': {
    color: 'var(--fg-alt)',
    display: 'flex',
    alignItems: 'start',
  },

  '.cm-gutterElement > span': {
    marginTop: '18px',
  },
  '&.cm-focused': {
    outline: 'none',
  },

  '.cm-gutterElement:hover': {
    color: 'var(--base8)',
  },

  '.cm-foldPlaceholder': {
    backgroundColor: 'none',
    background: 'none',
    color: 'var(--fg)',
    fontSize: 'inherit',
    border: 0,
    display: 'none',
  },

  '.cm-activeLine': {
    'background-color': 'transparent',
  },

  '.cm-scroller': {
    overflowX: 'unset',
  },
});
