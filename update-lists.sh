#!/bin/bash
# Convert all Letterboxd list CSVs to JSON and generate the index manifest.
# Usage: ./update-lists.sh [specific-list.csv ...]
# With no arguments, converts all CSVs in ../data/lists/
#
# All lists go through a single process.py invocation: the interpreter start-up
# and the master.csv parse dominate the cost, so doing them once per run rather
# than once per list is the difference between ~90s and ~2s. Outputs whose
# content is unchanged are left untouched, so rsync only re-uploads real edits.

set -e
cd "$(dirname "$0")"
ABSTRACT="$PWD"

PROCESS="/home/hbarbosa/letterboxd/process.py"
LISTS_DIR="/home/hbarbosa/letterboxd/data/lists"
OUT_DIR="$ABSTRACT/public/lists"
# Manifest of JSONs this script owns (one name per line, no extension). Anything
# in $OUT_DIR not listed here is treated as a manual addition and never purged.
MANAGED_FILE="$ABSTRACT/.managed-lists"
mkdir -p "$OUT_DIR"

if [ $# -gt 0 ]; then
  FILES=("$@")
  FULL_RUN=0
else
  FILES=("$LISTS_DIR"/*.csv)
  FULL_RUN=1
fi

cd ..

# Activate the parent project's venv so process.py finds tmdbsimple/texttable.
if [ -f "pyenv/bin/activate" ]; then
  source pyenv/bin/activate
fi

python3 "$PROCESS" --lists-to-json "${FILES[@]}" --out-dir "$OUT_DIR"
cd "$ABSTRACT"

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
    tags = data.get('tags', []) if isinstance(data, dict) else []
    lists.append({'file': name, 'title': title, 'count': count, 'preview': preview, 'tags': tags})

out = '$OUT_DIR/index.json'
content = json.dumps(lists, indent=2)
if not os.path.exists(out) or open(out).read() != content:
    with open(out, 'w') as fh:
        fh.write(content)
    print(f'Generated index.json with {len(lists)} lists')
else:
    print(f'index.json unchanged ({len(lists)} lists)')
"
