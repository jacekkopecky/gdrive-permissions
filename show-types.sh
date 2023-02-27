FILES_DIR=".gdrive-permissions"

for FILE in "$FILES_DIR"/*.dir
do
  TYPECOL=`head -1 "$FILE"  | sed -e 's/Type.*//' | wc -c`

  tail +2 "$FILE" | node colrm.js 1 $((TYPECOL-1)) |
  while read TYPE REST
  do
    echo $TYPE
  done
done | sort -u
