import { useAuthStore } from './auth';
import { OrgNode, parse, withMetaInfo } from 'org-mode-ast';
import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { repositories } from 'src/boot/repositories';
import { ModelsPublicNote } from 'src/generated/api';
import { Note } from 'src/models';
import { RouteNames } from 'src/router/routes';
import { useRouter } from 'vue-router';

import { ref } from 'vue';

type ParsedNote = { note: Note; orgTree: OrgNode };

export const useCurrentNoteStore = defineStore('current-note', () => {
  const currentNote = ref<Note | null>(null);
  const noteCache = ref<ParsedNote[]>([]);
  const currentOrgTree = ref<OrgNode | null>(null);

  // TODO: master add to configuration file.
  const cacheSize = 10;

  const router = useRouter();
  const authStore = useAuthStore();

  // const selectNoteFromCache = async (noteId: string): Promise<ParsedNote> => {
  //   const foundParsedNote = noteCache.value.find((pn) => pn.note.id === noteId);
  //   return foundParsedNote as ParsedNote;
  // };

  const selectPublicNote = async (
    noteId: string
  ): Promise<ModelsPublicNote> => {
    try {
      return (await sdk.notes.notesIdGet(noteId)).data.data;
    } catch (e: unknown) {
      // TODO: master handle error here [low]
      console.log('🦄: [line 41][current-note.ts] [35me: ', e);
    }
  };

  const selectMyNote = async (noteId: string): Promise<ModelsPublicNote> => {
    const myNote = (await repositories.notes.getById(
      noteId
    )) as ModelsPublicNote;

    if (!myNote) {
      return;
    }

    myNote.author = authStore.user;
    myNote.isMy = true;
    await repositories.notes.touchNote(myNote.id);
    return myNote;
  };

  const cacheNote = (parsedNote: ParsedNote) => {
    noteCache.value = [parsedNote, ...noteCache.value].slice(0, cacheSize);
  };

  const getNoteById = async (noteId: string): Promise<[Note?, OrgNode?]> => {
    const publicNote =
      (await selectMyNote(noteId)) ?? (await selectPublicNote(noteId));

    if (!publicNote) {
      return [];
    }

    const orgTree = withMetaInfo(parse(publicNote.content));

    const parsedNote: ParsedNote = { note: publicNote, orgTree };

    cacheNote(parsedNote);

    return [publicNote, orgTree];
  };

  const selectNoteById = async (noteId: string): Promise<void> => {
    currentNote.value = null;

    [currentNote.value, currentOrgTree.value] = await getNoteById(noteId);
    if (!currentNote.value) {
      router.push({ name: RouteNames.NotFound });
    }
  };

  const resetNote = (): void => (currentNote.value = null);

  return {
    currentNote,
    currentOrgTree,
    selectNoteById,
    getNoteById,
    resetNote,
  };
});
