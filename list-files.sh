FILES_DIR=".gdrive-permissions"

if [ "$1" = "--clean" -o "$1" = "--clear" ]
then
  echo "cleaning"
  rm "$FILES_DIR/"*.dir
  shift
fi

if [ $# -gt 1 ]
then
  echo "error: too many parameters"
  echo "usage: `basename $0` [--clean] [<FOLDER_ID>]" >/dev/stderr
  exit -1
fi

function read_and_recurse() {
  FOLDERID="$1"
  FILENAME="ls-$FOLDERID.dir"

  mkdir -p "$FILES_DIR"

  if [ -z "$FOLDERID" ]
  then
    FILENAME="ls-root.dir"
  fi

  FILE="$FILES_DIR/$FILENAME"

  if [ ! -e "$FILE" ]
  then
    echo listing into "$FILE"
    trap "rm '$FILE'; echo 'interrupted - removing last file'; exit -1" EXIT # remove the file if we're interrupted
    if [ -z "$FOLDERID" ]
    then
      gdrive files list --max 10000 > "$FILE" || mv "$FILE" "$FILE.err"
    else
      gdrive files list --parent "$FOLDERID" --max 10000 > "$FILE" || mv "$FILE" "$FILE.err"
    fi
    trap "" EXIT # disable the trap above
  fi

  NAMECOL=`head -1 "$FILE"  | sed -e 's/Name.*//' | wc -c`
  TYPECOL=`head -1 "$FILE"  | sed -e 's/Type.*//' | wc -c`

  tail +2 "$FILE" | node dist/colrm.js $NAMECOL $((TYPECOL-1)) |
  while read ID TYPE REST
  do
    if [ "$TYPE" = "folder" ]
    then
      read_and_recurse "$ID" || exit
    fi
  done
}

read_and_recurse "$1"
