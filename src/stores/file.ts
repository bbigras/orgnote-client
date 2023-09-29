import { useAuthStore } from './auth';
import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { repositories } from 'src/boot/repositories';
import { sleep } from 'src/tools';

export const useFileStore = defineStore('fileStore', () => {
  const saveFile = async (image: File) => {
    repositories.files.save(image);
    preserveFiles();
  };

  const getFile = async (name: string) => {
    return repositories.files.getByName(name);
  };

  // TODO: IMPORTANT master delete all stored files when delete note
  const deleteFile = async (name: string) => {
    repositories.files.deleteByName(name);
  };

  const authStore = useAuthStore();

  const preserveFiles = async () => {
    if (authStore.user?.isAnonymous) {
      return;
    }

    let firstFile = await repositories.files.getFirst();
    while (firstFile) {
      if (!firstFile) {
        return;
      }
      try {
        await sdk.files.uploadFile(firstFile);
        await deleteFile(firstFile.name);
        await sleep(1500);
        firstFile = await repositories.files.getFirst();
      } catch (e) {
        console.error(e);
        preserveFiles();
      }
    }
  };

  const uploadMediaFile = async (): Promise<string> => {
    // Programmatically create input for file upload (image extensions)
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;

    const abortController = new AbortController();

    const fileUploadPromise = new Promise<string>((resolve) => {
      input.addEventListener(
        'change',
        async () => {
          if (!input.files?.length) {
            return;
          }
          const file = input.files[0];
          await saveFile(file);
          resolve(file.name);
          abortController.abort();
          console.log('✎: [line 70][import-store.ts] file: ', file);
        },
        { signal: abortController.signal }
      );
    });

    input.click();
    return fileUploadPromise;
  };

  return {
    saveFile,
    getFile,
    deleteFile,
    preserveFiles,
    uploadMediaFile,
  };
});
