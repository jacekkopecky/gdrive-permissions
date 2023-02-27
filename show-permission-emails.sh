FILES_DIR=".gdrive-permissions"

for FILE in "$FILES_DIR"/perm-*.txt
do
  TYPECOL=`head -1 "$FILE"  | sed -e 's/Type.*//' | wc -c`
  DOMAINCOL=`head -1 "$FILE"  | sed -e 's/Domain.*//' | wc -c`

  tail +2 "$FILE" | colrm 1 $((TYPECOL-1)) | colrm $((DOMAINCOL)) |
  while read TYPE ROLE EMAIL
  do
    echo $TYPE $ROLE $EMAIL
  done
done | sort -u
