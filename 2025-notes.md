# Google Drive Permissions Manager in HTML

- [x] load all files and folders recursively and with nextPageToken handling and statistics logging
  - folders loaded
  - folders remaining
  - files loaded
  - [x] for each file load id, name, permissions, mimeType
  - [x] be able to export the loaded data into JSON so it can be used instead of loading
  - [x] be able to take that loaded data above, even if incomplete, and continue loading
- [x] show all files in a folder structure (foldable)
- [ ] show all people who have any permissions
- [ ] for a person, show all their permissions
- [ ] for a person (and maybe selected permission), show all their files
- [ ] link to files so we can see them in the folder, or the file itself?
  - https://drive.google.com/file/d/FILE_ID/view ?
  - https://drive.google.com/drive/folders/FOLDER_ID
- [ ] add a button to remove a given permission, or all permissions for a given user (and maybe selected permission)
- [ ] make the ROOT configurable in an input box
