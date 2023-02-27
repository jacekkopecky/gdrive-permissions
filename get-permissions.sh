FILES_DIR=".gdrive-permissions"

DIR_COUNT=`ls "$FILES_DIR"/*.dir | wc -l`
DIR_CURR=0

ALL_COUNT=`cat "$FILES_DIR"/*.dir | wc -l`
ALL_COUNT=$[ALL_COUNT-DIR_COUNT] # remove header lines
ALL_CURR=0

for FILE in "$FILES_DIR"/*.dir
do
  DIR_CURR=$[DIR_CURR+1]

  FILE_COUNT=`tail +2 "$FILE" | wc -l`
  FILE_CURR=0

  tail +2 "$FILE" |
  while read ID REST
  do
    FILE_CURR=$[FILE_CURR+1]
    ALL_CURR=$[ALL_CURR+1]

    FILE="$FILES_DIR/perm-$ID.txt"
    if [ ! -e "$FILE" ]
    then
      echo "$ALL_CURR/$ALL_COUNT: directory $DIR_CURR/$[DIR_COUNT], file $FILE_CURR/$[FILE_COUNT]: $ID"
      trap "rm '$FILE'; echo 'interrupted - removing last file'; exit 130" EXIT # remove the file if we're interrupted
      gdrive permissions list "$ID" > "$FILE" || mv "$FILE" "$FILE.err"
      trap "" EXIT # disable the trap above
    fi
  done || exit -1

  ALL_CURR=$[ALL_CURR+FILE_COUNT]
done
