<template>
  <raw-editor
    v-if="note"
    v-model="note.content"
    :readonly="true"
    :config="readonlyConfig"
  ></raw-editor>
</template>

<script lang="ts" setup>
import { OrgNode } from 'org-mode-ast';
import { OrgNoteConfig } from 'src/api';
import { Note } from 'src/models';

import { toRef } from 'vue';

import RawEditor from 'src/components/containers/raw-editor/RawEditor.vue';

const props = defineProps<{
  note?: Note;
  orgTree?: OrgNode;
}>();

const note = toRef(props, 'note');

const readonlyConfig: OrgNoteConfig['editor'] = {
  showSpecialSymbols: false,
};
</script>

<style lang="scss" scoped>
.note-description {
  color: var(--description-font-color);
  font-style: var(--description-font-style);
  padding: var(--description-padding, 16px 0px);
}
</style>
