<template>
  <div
    @click="openNote"
    class="file-item q-py-xs q-px-sm full-width cursor-pointer"
    :class="{
      'edit-mode': editMode,
      active: isFileOpened,
      desktop: $q.platform.is.desktop,
    }"
  >
    <div class="file-info">
      <q-icon v-if="!isFile" size="xs" name="folder"></q-icon>
      <input
        ref="fileNameInput"
        v-model="fileName"
        type="text"
        autofocus
        :readonly="!editMode"
        class="file-name"
        @focusout="stopEdit"
        @keydown.stop.enter="confirmEdit"
        @keydown.escape="stopEdit"
      />
    </div>
    <div v-show="!editMode" class="actions">
      <icon-btn
        v-if="!isFile"
        @click.stop="createFile"
        name="add_box"
        :hoverable="false"
      />
      <icon-btn @click.stop name="o_more_vert">
        <template v-slot:menu>
          <q-menu ref="actionMenuRef" max-width="300px">
            <q-list>
              <q-item clickable @click.stop.prevent="editName">
                <icon-btn name="edit" size="xs" :hoverable="false">
                  <template v-slot:append>
                    {{ $t('edit note') }}
                  </template>
                </icon-btn>
              </q-item>
              <q-item
                v-if="!isFile"
                clickable
                @click.stop="createFolder"
                v-close-popup
              >
                <icon-btn name="note_add" size="xs" :hoverable="false">
                  <template v-slot:append>{{ $t('create folder') }}</template>
                </icon-btn>
              </q-item>
              <q-item clickable @click.stop.prevent="deleteFile" v-close-popup>
                <icon-btn name="delete" size="xs" :hoverable="false">
                  <template v-slot:append>
                    {{ $t('delete') }}
                  </template>
                </icon-btn>
              </q-item>
            </q-list>
          </q-menu>
        </template>
      </icon-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { QMenu, useQuasar } from 'quasar';
import { RouteNames } from 'src/router/routes';
import {
  useAuthStore,
  useCurrentNoteStore,
  useFileManagerStore,
  useSidebarStore,
} from 'src/stores';
import { FlatTree, callKeyboard, convertFlatTreeToFileTree } from 'src/tools';
import { useRouter } from 'vue-router';

import { computed, onMounted, ref, watch } from 'vue';

import IconBtn from 'src/components/ui/IconBtn.vue';

const props = defineProps<{
  fileNode: FlatTree;
}>();

const emits = defineEmits<{
  (e: 'expand', key: string): void;
}>();

const fileName = ref(props.fileNode.name);
const isFile = props.fileNode.type === 'file';
const authStore = useAuthStore();

const deleteFile = () => {
  if (isFileOpened.value) {
    router.push({
      name: RouteNames.UserNotes,
      params: { userId: authStore.user.id },
    });
  }
  fileManagerStore.deleteFile(props.fileNode);
};

const createFolder = async () => {
  await fileManagerStore.createFolder(props.fileNode);
  emits('expand', props.fileNode.id);
  callKeyboard();
};

const createFile = async () => {
  await fileManagerStore.createFile(convertFlatTreeToFileTree(props.fileNode));
  emits('expand', props.fileNode.id);
};

const router = useRouter();
const sidebarStore = useSidebarStore();
const openNote = () => {
  if (editMode.value) {
    return;
  }
  if (props.fileNode.type === 'file') {
    router.push({
      name: RouteNames.RawEditor,
      params: { id: props.fileNode.id },
    });
    sidebarStore.close();
  }
};

const fileManagerStore = useFileManagerStore();

const editMode = ref(false);
const fileNameInput = ref<HTMLInputElement | null>();

const actionMenuRef = ref<QMenu>();

const editName = () => {
  actionMenuRef.value?.hide();
  editMode.value = true;
  callKeyboard();
};

const confirmEdit = async () => {
  editMode.value = false;
  await fileManagerStore.renameFile(
    convertFlatTreeToFileTree(props.fileNode),
    fileName.value
  );
  fileManagerStore.stopEdit();
};

const $q = useQuasar();
const stopEdit = async () => {
  if (!editMode.value) {
    return;
  }
  if (!$q.platform.is.desktop) {
    await confirmEdit();
    return;
  }
  fileManagerStore.stopEdit();
  editMode.value = false;
  fileName.value = props.fileNode.name;
};

const focusEditedInput = () => {
  if (!editMode.value || !fileNameInput.value) {
    return;
  }
  setTimeout(() => {
    // TODO: master doesn't work for ios
    fileNameInput.value.setSelectionRange(
      0,
      props.fileNode.name.length - 4,
      'forward'
    );
    fileNameInput.value.focus();
  });
};

watch(
  () => editMode.value,
  () => focusEditedInput()
);

watch(
  () => fileManagerStore.editedFileItem,
  () => tryInitEditMode()
);

watch(
  () => props.fileNode,
  (val) => {
    if (val.name !== fileName.value) {
      fileName.value = val.name;
    }
  }
);

const tryInitEditMode = () => {
  editMode.value =
    fileManagerStore.editedFileItem?.name &&
    fileManagerStore.editedFileItem?.name === props.fileNode.name;
};
tryInitEditMode();

onMounted(() => focusEditedInput());

const currentNoteStore = useCurrentNoteStore();
const isFileOpened = computed(() => {
  return (
    currentNoteStore.currentNote &&
    currentNoteStore.currentNote?.id === props.fileNode.id
  );
});
</script>

<style lang="scss" scoped>
.actions {
  @include flexify(row);
  gap: var(--xs-gap);
}

.file-name {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  padding: 0;
  color: var(--fg);
  margin: 0;
  border: none;
  width: 100%;
  height: 100%;
  background: transparent;

  &:not(.edit-mode) {
    cursor: pointer;
  }

  &:focus,
  &:focus-visible {
    outline: none;
    border: none;
  }
}

.file-info {
  @include flexify(row, flex-start);
  gap: 6px;
  width: 100%;
}

.file-item {
  @include flexify(rows, space-between);

  max-height: var(--file-item-height);
  height: var(--file-item-height);

  border-radius: 4px;

  .actions {
    display: none;
  }

  .icon-btn {
    color: var(--fg-alt);
  }

  &:hover:not(.edit-mode),
  &.active:not(.edit-mode) {
    background-color: var(--file-item-bg-hover);
    color: var(--file-item-color-hover);

    input {
      color: var(--white);
    }

    .file-info {
      width: calc(100% - 96px);
    }

    .actions {
      display: flex;
    }

    .icon-btn {
      color: var(--file-item-color-hover) !important;
    }
  }
}

.file-item.desktop {
  .actions {
    display: none !important;
  }

  &:hover {
    .actions {
      display: flex !important;
    }
  }
}

.edit-mode {
  background-color: var(--base5);

  input {
    color: var(--bg);
  }

  .file-name {
    width: 100%;
    background: var(--base5);

    &:focus {
      outline: none;
    }
  }
}
</style>
