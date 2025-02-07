<template>
  <div
    class="editor-wrapper"
    :class="{
      readonly,
      'hide-special-symbols': !config?.showSpecialSymbols,
      'show-property-drawer': config?.showPropertyDrawer,
    }"
  >
    <div id="editor" ref="editor"></div>
  </div>
</template>

<script lang="ts" setup>
import { initEditorExtensions } from './editor-extensions';
import { editorLanguages } from './editor-languages';
import { useEmbeddedWidgets } from './use-embedded-widgets';
import { EditorState } from '@codemirror/state';
import { EditorView, ViewUpdate } from '@codemirror/view';
import { OrgNode } from 'org-mode-ast';
import { OrgNoteConfig } from 'src/api';
import { onMobileViewportChanged, useDynamicComponent } from 'src/hooks';
import { orgMode } from 'src/tools/cm-org-language';

import { onMounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    readonly?: boolean;
    config?: OrgNoteConfig['editor'];
  }>(),
  { modelValue: () => '' }
);

const emits = defineEmits<{
  (e: 'update:modelValue', val: string): void;
  (e: 'dataUpdated', val: [string, OrgNode]): void;
  (e: 'changeCursorPosition', val: number): void;
  (e: 'focusChanged', val: boolean): void;
  (e: 'init', val: { view: EditorView }): void;
}>();

const text = ref(props.modelValue);

let orgNode: OrgNode;

const setText = (t: string) => {
  if (props.readonly) {
    return;
  }
  text.value = t;
  emits('dataUpdated', [t, orgNode]);
};

const editor = ref<HTMLDivElement>();
let editorView: EditorView;

const {
  multilineEmbeddedWidgets,
  inlineEmbeddedWidgets,
  lineClasses,
  foldWidget,
  editBadgeWidget,
} = useEmbeddedWidgets();

const dynamicComponent = useDynamicComponent();

const setCursorPositionToTheEOF = () => {
  if (!editorView) {
    return;
  }
  const lastLine = editorView.state.doc.lineAt(editorView.state.doc.length);
  editorView.dispatch({
    selection: {
      anchor: lastLine.to,
      head: lastLine.to,
    },
  });
};
// TODO: master refactor (important)
const initEditor = () => {
  if (!props.modelValue) {
    return;
  }
  editorView?.destroy();
  const startState = EditorState.create({
    doc: props.modelValue,
    extensions: [
      orgMode({
        orgAstChanged: (updatedOrgNode: OrgNode) => {
          orgNode = updatedOrgNode;
        },
        wrap: editorLanguages,
      }),
      EditorView.updateListener.of((v: ViewUpdate) => {
        if (v.docChanged) {
          setText(v.state.doc.toString());
        }
        emits('changeCursorPosition', v.state.selection.main.head);
        changeFocus(v.view.hasFocus);
      }),
      initEditorExtensions({
        dynamicComponent,
        editorViewGetter: () => editorView,
        inlineEmbeddedWidgets,
        lineClasses,
        multilineEmbeddedWidgets,
        readonly: props.readonly,
        orgNodeGetter: () => orgNode,
        showSpecialSymbols: props.config?.showSpecialSymbols,
        foldWidget,
        editBadgeWidget,
      }),
    ],
  });

  editorView = new EditorView({
    state: startState,
    parent: editor.value,
  });

  emits('init', { view: editorView });
  setCursorPositionToTheEOF();
};

const focus = ref<boolean>(false);
const changeFocus = (hasFocus: boolean) => {
  if (focus.value === hasFocus) {
    return;
  }
  focus.value = hasFocus;
  emits('focusChanged', hasFocus);
};

const { keyboardOpened } = onMobileViewportChanged();

watch(
  () => keyboardOpened.value,
  (opened) => {
    if (opened) {
      setTimeout(() => scrollIntoCurrentLine(), 100);
      return;
    }
    editorView.contentDOM.blur();
  }
);

const scrollIntoCurrentLine = () => {
  window.scroll(0, -1);
  editorView.dispatch({
    selection: {
      anchor: editorView.state.selection.main.head,
      head: editorView.state.selection.main.head,
    },
    scrollIntoView: true,
  });
};

onMounted(() => initEditor());

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value || value === editorView?.state.doc.toString()) {
      return;
    }
    initEditor();
  }
);

watch(
  () => [props.readonly, props.config],
  () => {
    if (!editorView) {
      return;
    }
    initEditor();
  },
  { deep: true }
);
</script>

<style lang="scss">
/* TODO: master simplify classes for CM */
.editor-wrapper {
  width: 100%;
  height: 100%;
  max-width: var(--content-max-width);
  margin: auto;
}

#editor {
  font-family: var(--editor-font-family-main);
}

.ql-editor {
  &:focus {
    outline: none;
  }

  p {
    margin: 0;
  }
}

.ql-clipboard {
  display: none;
}

.ql-syntax {
  overflow: auto;
}

.org-bold {
  font-weight: bold;
}

@for $i from 1 through 12 {
  .org-headline-#{$i} {
    position: relative;
    line-height: var(--editor-headline-line-height);
    font-family: var(--headline-font-family);
    font-weight: var(--headline-font-weight);

    .org-embedded-operator {
      margin-left: -6px;
      /* TODO: master plugin */
      /* position: absolute;
      // left - 100% from size of container via transform
      transform: translateX(-100%); */
    }
  }
}

.hide-special-symbols {
  .org-bold,
  .org-italic,
  .org-verbatim,
  .org-inline-code,
  .org-crossed {
    &.org-operator {
      display: none;
    }
  }

  @for $i from 1 through 12 {
    .org-headline-#{$i} {
      &.org-operator {
        display: none;
      }
    }
  }

  .org-keyword-description-line,
  .org-keyword-title-line,
  .org-keyword-filetags-line {
    &:not(.cm-activeLine) {
      .org-keyword:first-of-type {
        display: none !important;
      }
    }
  }
}

.org-bold {
  font-weight: bold;
}

.org-italic {
  font-style: italic;
}

.org-crossed {
  text-decoration: line-through;
  color: var(--fg-alt);
}

.org-file-tag {
  color: var(--base8) !important;
}

.org-keyword.org-operator {
  color: var(--base8);
  padding: 4px;
}

.org-link {
  color: var(--fg);
  text-decoration: underline;
  cursor: pointer;
}

.cm-gutters,
.cm-gutter {
  background: transparent;
  background-color: transparent !important;
  border-right: 0 !important;
}

.org-property-drawer {
  color: var(--fg-alt);
  font-family: var(--editor-font-family-main);
}

.cm-line,
.org-text,
.header-text {
  letter-spacing: 0.5px;
  white-space: pre-wrap;
  font-size: var(--paragraph-font-size);
  font-family: var(--main-font-family);
  color: var(--fg);
  -webkit-font-smoothing: auto;
}

.cm-line {
  &:not(.org-headline-line),
  &:not(.org-keyword-title-line) {
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.cm-line:not(.org-src-block-line, .org-headline-line) {
  line-height: var(--editor-line-height);
}

.cm-tag-name,
.cm-angle-bracket {
  color: var(--yellow);
}

.org-keyword,
.cm-line-comment,
.org-block-property,
.org-comment {
  color: var(--fg-alt);
}

.org-src-block,
.org-quote-block.org-keyword {
  font-size: var(--code-font-size);
  font-family: var(--editor-font-family-main);
  letter-spacing: 0;
}

.org-src-language {
  color: var(--yellow);
}

.cm-string,
.cm-regexp {
  color: var(--green);
}

.cm-definition-keyword,
.cm-keyword,
.cm-control-keyword,
.cm-type-name,
.cm-type-definition,
.cm-property-definition,
.cm-private-property-definition {
  color: var(--violet);
}

.cm-variable-name,
.cm-bool {
  color: var(--fg);
}

.cm-property-name,
.cm-name {
  color: var(--blue);
}

.cm-activeLine {
  .org-operator,
  .org-link-url {
    display: inline !important;
  }
}

.org-verbatim,
.org-inline-code {
  &:not(.org-operator) {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    border-radius: 6px;
    background-color: var(--inline-code-background);
    color: var(--inline-code-font-color);
  }
}

.cm-attribute-value {
  color: var(--green);
}

.org-headline-1 {
  font-size: 2rem;
}

.org-headline-2 {
  font-size: 1.8rem;
}

.org-headline-3 {
  font-size: 1.6rem;
}

.org-headline-4 {
  font-size: 1.4rem;
}

.org-headline-5 {
  font-size: 1.2rem;
}

.org-checkbox {
  color: var(--green);
}

.org-headline-6,
.org-headline-7,
.org-headline-8,
.org-headline-9,
.org-headline-10,
.org-headline-11,
.org-headline-12 {
  font-size: 1rem;
}

.org-priority-1 {
  color: var(--red);
}

.org-priority-2 {
  color: var(--orange);
}

.org-priority-3 {
  color: var(--yellow);
}

.org-priority-4 {
  color: var(--blue);
}

.org-priority-5 {
  color: var(--base8);
}

.org-priority-6 {
  color: var(--green);
}

.cm-line {
  > .org-quote-block:not(.org-keyword):first-child {
    padding-left: 16px;
    position: relative;
  }
}

.org-quote-block-line {
  position: relative;

  &::before {
    content: '';
    display: block;
    position: absolute;
    height: 100%;
    border-left: 3px solid var(--base8);
  }
}

.org-keyword-todo,
.org-keyword-wait,
.org-keyword-hold {
  color: var(--yellow);
}

.org-keyword-done,
.org-keyword-idea {
  color: var(--green);
}

.org-keyword-kill,
.org-keyword-rejected,
org-keyword-block {
  color: var(--red);
}

.org-widget-edit-badge {
  position: absolute;
  cursor: pointer;
  color: var(--fg-alt);
  opacity: 0;
  z-index: 1000;
  cursor: pointer;
  right: 16px;
  top: var(--small-gap);

  &:hover {
    opacity: 1;
  }
}

.org-multiline-widget {
  margin-top: var(--default-block-margin);
  &:hover,
  &:active {
    .org-widget-edit-badge {
      opacity: 1;
    }
  }

  width: 100%;
  overflow: auto;

  .actions {
    right: 58px;
  }
}

.org-doc-title {
  color: var(--fg);
}

.org-headline-line {
  /* TODO: master create padding for main title */
  padding-top: 16px !important;
}

.org-horizontal-rule-line {
  @include flexify();
  height: var(--editor-default-line-height);
  span {
    display: inline-block;
    height: 100%;
    width: 100%;
  }
}

.org-src-block-line {
  background: var(--base7) !important;
  padding-left: var(--src-block-padding-x) !important;
  padding-right: var(--src-block-padding-x) !important;
}

.org-block-footer {
  border-bottom-right-radius: var(--sm-block-border-radius);
  border-bottom-left-radius: var(--sm-block-border-radius);
  padding-bottom: var(--src-block-footer-padding-y) !important;
  margin-bottom: var(--src-block-margin-y);
}

.org-keyword-description-line,
.org-keyword-title-line {
  :not(&) + .org-block-header {
    margin-top: var(--sm-block-margin);
  }
}
.org-block-header {
  position: relative;

  border-top-right-radius: var(--sm-block-border-radius);
  border-top-left-radius: var(--sm-block-border-radius);
}

// Readonly mode

.org-list-bullet {
  color: var(--fg-alt);
  position: absolute;
  left: -8px;

  display: inline-block;
  transform: scale(1.6);
  width: 16px;
}

/* FIXME: hack for empty line with absolute bullet */
.org-list-item-line.cm-activeLine {
  min-height: var(--editor-default-line-height);
}

.org-list-item-checked {
  .org-list-item:not(.org-checkbox) {
    text-decoration: line-through;
    color: var(--fg-alt);
  }
}

.org-operator.org-list-item:first-child {
  display: inline-block;
  color: var(--fg-alt);
}

.org-list-item-line {
  position: relative;
  margin-left: 8px;
}

.org-list-item-bullet-line {
  margin-left: var(--org-list-item-bullet-margin-left);
}

.org-list-item-section-line {
  margin-left: calc(var(--org-list-item-bullet-margin-left) + 16px);
  position: relative;

  > .org-list-item:first-of-type {
    margin-left: -4.6px;
  }

  &::before {
    content: '';
    display: block;
    position: absolute;
    left: -8px;
    height: 100%;
    border-left: 1px solid var(--base7);
  }
}

.cm-action-menu {
  width: 48px;
  left: -56px;
}

.org-keyword-title-line {
  .org-keyword {
    font-size: 2rem;
    font-weight: var(--headline-font-weight);
    font-family: var(--headline-font-family);
  }
  .org-keyword {
    line-height: var(--editor-headline-line-height);
  }
  .org-keyword:not(:first-of-type) {
    color: var(--fg);
  }
}

.org-keyword-description-line {
  .org-keyword:not(:first-of-type) {
    font-style: italic;
    font-weight: bold;
    font-size: 1.2rem;
  }
}

.org-keyword-filetags-line,
.org-keyword-description-line,
.org-keyword-title-line {
  padding-bottom: var(--default-block-padding) !important;
}

.org-embedded-propertydrawer {
  padding-bottom: calc(var(--default-block-padding) * 2);
  display: none;
}

.show-property-drawer {
  .org-embedded-propertydrawer {
    display: block;
  }
}

/* TODO: master what a hell..need to fix dual name in org parser */
.org-embedded-listtag,
.org-embedded-taglist,
.org-embedded-latexfragment {
  display: inline-block;
}

@include mobile {
  .cm-gutters {
    left: -16px !important;
  }

  .editor-wrapper {
    .cm-action-menu {
      display: none;
    }

    .cm-scroller {
      padding: var(--mobile-editor-padding);
      outline: none !important;
    }

    .cm-gutters {
      position: absolute !important;
      left: 0;
    }

    .org-widget-edit-badge {
      right: 8px;
      top: 8px;
      opacity: 1;
      left: unset;
      display: none;
    }

    .org-multiline-widget {
      &:hover {
        .org-widget-edit-badge {
          display: block;
        }
      }
    }

    .cm-line {
      padding-left: var(--default-block-padding);
      padding-right: var(--default-block-padding);
    }
  }

  .org-multiline-widget {
    .actions {
      right: 50px;
    }
  }
}

.readonly {
  .cm-cursor,
  .cm-dropCursor {
    display: none !important;
    border-color: transparent !important;
  }

  .org-property-drawer,
  .org-operator,
  .cm-action-menu {
    display: none !important;
  }

  .org-src-block-line {
    .org-keyword {
      display: none !important;
    }
  }

  .org-keyword-line {
    .org-keyword:first-of-type {
      display: none !important;
    }
  }

  .org-widget-edit-badge {
    display: none !important;
  }
}
</style>
