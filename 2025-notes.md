# Google Drive Permissions Manager in HTML

- [x] make the view sticky so we always know whom, and what permission, we have selected
- visual
  - [o] hide logs behind a button "show logs" while not loading
    - replaced with making logs scrolling in a small container
  - [x] scroll to bottom on every log addition
  - [x] hide all other stuff when not authorized?
  - [x] change authorize to "log in"?
  - [x] hide "authorize" when logged in?
  - [/] show who's logged in (cannot, the info doesn't seem to be easily accessible)
  - [ ] change "view" link to "open document" or "open folder"
- functional
  - [ ] add a possibility to load all documents from the logged-in person's drive
    - document that it needs "root" or use that as default
  - [ ] add a button to remove all of someone's selected permission from a whole folder
- saving-related changes
  - [ ] rephrase saving text to say save automatically?
  - [ ] show saved stuff only when logged in?
  - [ ] can we remember in local storage what has been revoked?
  - [ ] hide "save" button when saving is ticked
  - [ ] make sure saving saves all the time when saving - when loading after every folder, if we can also record revocations, then after every revocation

## done by 2025-07-13

- [x] load all files and folders recursively and with nextPageToken handling and statistics logging
  - folders loaded
  - folders remaining
  - files loaded
  - [x] for each file load id, name, permissions, mimeType
  - [x] be able to export the loaded data into JSON so it can be used instead of loading
  - [x] be able to take that loaded data above, even if incomplete, and continue loading
- [x] show all files in a folder structure (foldable)
- [x] show all people who have any permissions
- [x] for a person, show all their permissions
- [x] highlight the People… and Files… headings in the page
- [x] for a person (and maybe selected permission), show all their files
  - [x] for a person and selected permission, show only all those files
- [x] link to files so we can see them in the folder, or the file itself?
  - https://drive.google.com/file/d/FILE_ID/view ?
  - https://drive.google.com/drive/folders/FOLDER_ID
- [x] make the ROOT configurable in an input box
- [x] save loaded files in localstorage
- [x] disable Load button when not authorized
- [x] rename loaded-files.js to local-storage.js
- [x] add a button to remove a given permission, or all permissions for a given user (and maybe selected permission)
