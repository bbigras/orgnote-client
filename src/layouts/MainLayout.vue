<template>
  <q-layout
    view="lHh Lpr lFf"
    :style="{
      '--viewport-height': viewportHeight + 'px',
      minHeight: 0,
    }"
  >
    <file-uploader
      class="main-content"
      @uploaded="notesImportStore.uploadFiles"
    >
      <the-header />
      <action-side-panel
        v-if="$q.screen.gt.xs || sidebarStore.opened"
        :full-width="$q.screen.lt.sm"
        :user="user"
      />
      <q-page-container
        class="height-max-dynamic"
        v-touch-swipe.mouse.right="sidebarStore.open"
        :class="{ 'with-composite-bar': $q.screen.gt.xs }"
      >
        <modal-window />
        <confirmation-modal />
        <router-view />
        <editor-actions-toolbar
          v-if="
            $q.screen.lt.sm &&
            !toolbarStore.showToolbar &&
            (keyboardOpened || $q.platform.is.desktop)
          "
        />
      </q-page-container>
      <mini-buffer />
      <completion-prompt />
      <ToolBar v-if="$q.screen.lt.sm" />
    </file-uploader>
  </q-layout>
</template>

<script lang="ts" setup>
import {
  onAppActive,
  onMobileViewportChanged,
  registerEditorCommands,
  useMainCommands,
} from 'src/hooks';
import { useSidebarStore, useSyncStore, useToolbarStore } from 'src/stores';
import { useAuthStore } from 'src/stores/auth';
import { useNotesImportStore } from 'src/stores/import-store';
import { useKeybindingStore } from 'src/stores/keybindings';
import { debounce } from 'src/tools';

import { computed } from 'vue';

import ActionSidePanel from 'src/components/containers/ActionSidePanel.vue';
import CompletionPrompt from 'src/components/containers/CompletionPromt.vue';
import ConfirmationModal from 'src/components/containers/ConfirmationModal.vue';
import EditorActionsToolbar from 'src/components/containers/EditorActionsToolbar.vue';
import FileUploader from 'src/components/containers/FileUploader.vue';
import ModalWindow from 'src/components/containers/ModalWindow.vue';
import ProfileSideBar from 'src/components/containers/ProfileSideBar.vue';
import TheHeader from 'src/components/containers/TheHeader.vue';
import ToolBar from 'src/components/containers/ToolBar.vue';
import MiniBuffer from 'src/components/ui/MiniBuffer.vue';

const sidebarStore = useSidebarStore();

const authStore = useAuthStore();
const user = computed(() => authStore.user);
authStore.verifyUser();

const { registerKeybindings } = useKeybindingStore();

useMainCommands().register();
registerEditorCommands();

registerKeybindings([
  {
    handler: () => sidebarStore.toggleWithFallback(ProfileSideBar),
    command: 'toggleActionSidePanel',
    keySequence: 'o p',
    description: 'Toggle left sidebar',
  },
]);

const notesImportStore = useNotesImportStore();

const toolbarStore = useToolbarStore();

const alignViaVirtualkeyboard = debounce(() => window.scrollTo(0, 0));

const { viewportHeight, keyboardOpened } = onMobileViewportChanged((info) => {
  toolbarStore.showToolbar = !info.keyboardOpened.value;
  if (info.keyboardOpened.value) {
    document.body.classList.add('keyboard-opened');
  } else {
    document.body.classList.remove('keyboard-opened');
  }

  document.body.style.height = info.viewportHeight.value + 'px';
  if (info.keyboardOpened.value) {
    alignViaVirtualkeyboard();
  }
});

const syncStore = useSyncStore();
onAppActive((active: boolean) => {
  if (active) {
    syncStore.syncNotes();
  }
});
</script>

<style lang="scss" scoped>
.content {
  max-width: var(--content-max-width);
  margin: auto;
}

.with-composite-bar {
  margin-left: var(--sidebar-width);
}
</style>

<style lang="scss" scoped>
.q-layout,
.q-page-container,
.file-uploader {
  max-height: var(--viewport-height);
  height: var(--viewport-height);
}
.q-header {
  left: 0 !important;
}
</style>
