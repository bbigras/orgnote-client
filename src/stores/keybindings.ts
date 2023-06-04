import { defineStore } from 'pinia';
import hotkeys from 'src/tools/tinykeys-wrapper';
import { computed, ref } from 'vue';

import {
  Keybinding,
  DEFAULT_KEYBINDING_GROUP,
} from 'src/models/keybinding.model';
import { CompletionCandidate, useCompletionStore } from './completion';

type GroupedKeybindings = { [key: string]: Keybinding[] };

export const useKeybindingStore = defineStore('keybindings', () => {
  const keybindings = ref<{ [command: string]: Keybinding }>({});

  const groupedKeybindings = computed<GroupedKeybindings>(() =>
    Object.values(keybindings).reduce<GroupedKeybindings>((acc, keybinding) => {
      const key = keybinding.group;
      acc[key] ??= [];
      acc[key].push(keybinding);
      return acc;
    }, {})
  );

  const keybindingList = computed<Keybinding[]>(() =>
    Object.values(keybindings.value)
  );

  let unregisterFunctions: (() => void)[] = [];

  // TODO: master hashmap
  const unattachHotkeys = () => {
    unregisterFunctions.forEach((unregister) => unregister());
    unregisterFunctions = [];
  };

  const deleteKeybinding = (command: string) => {
    const clonedBindings = { ...keybindings.value };
    if (clonedBindings[command]) {
      delete clonedBindings[command];
    }
    keybindings.value = clonedBindings;
  };

  const attachHotkeys = () => {
    Object.values(keybindings.value).forEach((k) => {
      const command = { [k.keySequence]: k.handler };
      unregisterFunctions.push(hotkeys(window, command, !k.allowOnInput));
    });
  };

  const completionStore = useCompletionStore();

  const initCompletionCandidatesGetter = () => {
    const candidates = keybindingList.value
      .filter((k) => !k.ignorePrompt)
      .map(
        (k) =>
          ({
            command: k.command,
            description: k.description,
            group: k.group,
            icon: 'settings',
          } as CompletionCandidate)
      );

    completionStore.setCandidateGetter((filter) =>
      candidates.filter((c) => c.command.includes(filter))
    );
  };

  const registerKeybindings = (kb: Keybinding[]) => {
    unattachHotkeys();
    const registerKeybindings = kb.reduce<{
      [command: string]: Keybinding;
    }>((acc, k) => {
      k.group ??= DEFAULT_KEYBINDING_GROUP;
      acc[k.command] = k;
      return acc;
    }, {});

    keybindings.value = {
      ...keybindings.value,
      ...registerKeybindings,
    };
    attachHotkeys();
  };

  const uregisterKeybindings = (kb: Keybinding[]) => {
    unattachHotkeys();
    kb.forEach((k) => {
      delete keybindings.value[k.command];
    });
    attachHotkeys();
  };

  const executeCommand = ({
    command,
    commandHandler,
  }: {
    command: string;
    commandHandler?: () => void;
  }) => {
    if (commandHandler) {
      commandHandler();
      return;
    }
    keybindings.value[command]?.handler?.();
  };

  return {
    keybindingList,
    executeCommand,
    registerKeybindings,
    deleteKeybinding,
    groupedKeybindings,
    uregisterKeybindings,
    initCompletionCandidatesGetter,
  };
});
