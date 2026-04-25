#!/bin/bash
# Convert all Letterboxd list CSVs to JSON and generate the index manifest.
# Usage: ./update-lists.sh [specific-list.csv ...]
# With no arguments, converts all CSVs in ../data/lists/

set -e
cd "$(dirname "$0")"

PROCESS="/home/hbarbosa/letterboxd/process.py"
LISTS_DIR="/home/hbarbosa/letterboxd/data/lists"
OUT_DIR="public/lists"
# Manifest of JSONs this script owns (one name per line, no extension). Anything
# in $OUT_DIR not listed here is treated as a manual addition and never purged.
MANAGED_FILE=".managed-lists"
mkdir -p "$OUT_DIR"

if [ $# -gt 0 ]; then
  FILES="$@"
  FULL_RUN=0
else
  FILES="$LISTS_DIR"/*.csv
  FULL_RUN=1
fi

cd ..

for csv in $FILES; do
  echo "Converting $csv ..."
  name=$(basename "$csv" .csv)
  # Drop any stale destination so a skipped list doesn't leave a broken JSON behind.
  rm -f "abstract/$OUT_DIR/$name.json"
  python3 $PROCESS --list-to-json "$csv"
done
cd abstract

# On a full run, purge JSONs whose source CSV was deleted. Only names we've
# previously managed (recorded in $MANAGED_FILE) are eligible — manual lists
# are never in that list, so they're left alone.
if [ "$FULL_RUN" = "1" ]; then
  current=$(ls "$LISTS_DIR"/*.csv 2>/dev/null | xargs -n1 basename | sed 's/\.csv$//' | sort -u)
  if [ -f "$MANAGED_FILE" ]; then
    # Names previously managed but no longer present as a CSV.
    while IFS= read -r name; do
      [ -z "$name" ] && continue
      if ! grep -qxF "$name" <<< "$current"; then
        if [ -f "$OUT_DIR/$name.json" ]; then
          rm -f "$OUT_DIR/$name.json"
          echo "  ✗ purged $OUT_DIR/$name.json (source CSV removed)"
        fi
      fi
    done < "$MANAGED_FILE"
  fi
  printf "%s\n" "$current" > "$MANAGED_FILE"
fi

# Move generated JSONs to public/lists/
for json in ../*.json; do
  [ -f "$json" ] || continue
  name=$(basename "$json")
  # Skip master.json
  [ "$name" = "master.json" ] && continue
  mv "$json" "$OUT_DIR/$name"
  echo "  → $OUT_DIR/$name"
done

# Generate index.json manifest
python3 -c "
import json, glob, os

lists = []
for f in sorted(glob.glob('$OUT_DIR/*.json')):
    if os.path.basename(f) == 'index.json':
        continue
    with open(f) as fh:
        data = json.load(fh)
    name = os.path.basename(f).replace('.json', '')
    title = data.get('title', name)
    movies = data.get('movies', [])
    count = len(movies)
    preview = [m['tmdbId'] if isinstance(m, dict) else m for m in movies[:5]]
    lists.append({'file': name, 'title': title, 'count': count, 'preview': preview})

with open('$OUT_DIR/index.json', 'w') as out:
    json.dump(lists, out, indent=2)
print(f'Generated index.json with {len(lists)} lists')
"
