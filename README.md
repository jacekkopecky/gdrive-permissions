# Permissions tool for Google Drive

This is built with the `gdrive` tool version 3.

## Installation

1. Install the `gdrive` tool [from here](https://github.com/glotlabs/gdrive)
2. Follow its handy [Create Google API credentials in 50 easy steps](https://github.com/glotlabs/gdrive/blob/main/docs/create_google_api_credentials.md) guide
3. ...
4. profit

## script naming:

- list-files - starting from a given ID, or the root of your gdrive, list all directories in `ls-*.dir`
- get-info - for all the files listed in `ls-*.dir`, download info into info-id.txt
- get-permissions - for all the files listed in `ls-*.dir`, download permissions into perm-id.txt
- show-types - from all the `ls-*.dir`, show all the "type" column values (document, folder, regular, others?)
- show-permission-emails - from all the `perm-*.txt` files, show all the unique email addresses

## analysis and todo

for a folder:

- [ ] list the folder itself in ls-self.dir
- [x] list files, documents and directories into ls-ID.dir
- [x] for each directory, do "for a folder"
- [ ] this script should also download all info files, including for the root (which get-info doesn't do)
- [ ] this script should also get all perm files, including for the root (which get-permissions doesn't do)
  - [ ] the above can be done by adding a "root" param to both scripts to include, and calling them from main script

for every \*.dir:

- [x] list access for every file into perm-ID.txt
- [x] list info for every file into info-ID.txt

[ ] from \*.perm, aggregate emails, choose emails to remove

- many writers should be removed (high-priority)
- anyone reader should be revisited, there are many of those
- owners include jacek.kopecky@port.ac.uk and kamilakrajewska7@gmail.com
  - check they files, maybe get owner to transfer ownerships, or copy and delete their files
- commenters and readers are low-priority

- [ ] given an email and role (e.g. jacek@jacek.cz writer), find file IDs with that permission
  - role could be omitted to match all roles
  - email could be omitted to match files where "anyone" has the given role
  - (a role doesn't have @, email does)
- [ ] given a list of file IDs, show them with names and in a folder hierarchy

- [ ] be able to go quickly from ID to file name and tree location? or be able to list things here by tree location?

- [x] to do the next thing: list IDs from \*.perm, sort, look for specials (e.g. anyoneWithLink)
  - specials are only "anyoneWithLink"
- [x] list \*.perm that contain special permissions

- [x] list owner(s) from each \*.perm, check they are ok, maybe get them to transfer ownership, or copy and delete their files

- [ ] for every email to remove
  - for every \*.perm
    - find permission ID, call gdrive to remove permission

## gdrivep tool

Functionalities:

- [x] list all known files
- [ ] for a given [email] and [role], list files where that email has that role
  - folders may or may not have the role, how do we show that?
- [ ] for a given role, list files where "anyone" has that role
- [ ] for a given email, list files where that user has any role
