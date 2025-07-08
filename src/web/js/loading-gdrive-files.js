const statsEl = document.getElementById('stats');
const errorsEl = document.getElementById('errors');

let stopping = false;

export function stop() {
  stopping = true;
}

export async function loadFiles(files) {
  console.time('loadFiles');
  try {
    stopping = false;

    do {
      printStats(files);
      const nextFolder = files.find((f) => f.isFolder && !f.isLoaded);
      if (!nextFolder) {
        break;
      }

      const filesInNext = await loadFilesIn(nextFolder.id);
      if (filesInNext) {
        nextFolder.isLoaded = true;
        files.push(
          ...filesInNext.map((f) => {
            const isFolder = f.mimeType === 'application/vnd.google-apps.folder';
            return {
              isLoaded: !isFolder,
              id: f.id,
              name: f.name,
              permissions: f.permissions,
              isFolder,
              parent: nextFolder.id,
            };
          }),
        );
      }
    } while (!stopping);
  } catch (err) {
    errorsEl.textContent = err.message;
  }
  console.timeEnd('loadFiles');
}

async function loadFilesIn(dir) {
  try {
    let pageToken = undefined;
    let files = [];

    do {
      console.log(`loading files in ${dir}`, pageToken ? '(continued)' : '');

      const response = await gapi.client.drive.files.list({
        pageSize: 1000,
        pageToken,
        fields: 'nextPageToken, files(id, name, permissions, mimeType, parents)',
        q: `'${dir}' in parents`,
      });

      files.push(...response.result.files);

      pageToken = response.result.nextPageToken;
    } while (pageToken);

    return files;
  } catch (err) {
    errorsEl.textContent = err.message;
    return;
  }
}

export function printStats(files) {
  const knownFilesCount = files.length;
  const allFolders = files.filter((f) => f.isFolder);
  const pendingFoldersCount = allFolders.filter((f) => !f.isLoaded).length;

  const remaining = `${pendingFoldersCount} of ${allFolders.length}`;
  statsEl.textContent += `loaded ${String(knownFilesCount - allFolders.length).padStart(4)} files, remaining ${remaining.padStart(10)} folders\n`;

  errorsEl.scrollIntoView({ behavior: 'instant' });
}
