#!/bin/bash

# if fresh repo:
# - install via apt npm
# - npm install

BUILD=1
LISTS=1
for arg in "$@"; do
    case "$arg" in
        --no-build) BUILD=0 ;;
        --no-lists) LISTS=0 ;;
        *) echo "Unknown option: $arg" >&2; exit 1 ;;
    esac
done

# Refresh public/lists/ from the Letterboxd CSVs before building, so the build
# picks them up. Cheap: one process.py run, and unchanged JSONs keep their mtime,
# which keeps the rsync below from re-uploading lists that didn't change.
if [ "$LISTS" = "1" ]; then
    echo "Updating lists..."
    ./update-lists.sh
fi

if [ "$BUILD" = "1" ]; then
    echo "Building..."
    npm run build &> /dev/null
else
    cp public/*json build/
fi
cd build
echo "Uploading..."
rsync --exclude='.git/' --exclude='node-modules' --exclude='directors/' --exclude='year-review/' --exclude='clube/' --delete --recursive --times --compress --progress . hostinger:~/public_html/filminhos/ &> /dev/null
cd - &> /dev/null
cd public
unzip -o master.zip &> /dev/null
cd - &> /dev/null
echo "Uploading lists..."
./index.py public/lists/
rsync --exclude='.git/' --exclude='node-modules' --delete --recursive --times --compress --progress public/lists/ hostinger:~/public_html/filminhos/lists/ &> /dev/null
echo "Uploading directors..."
python3 directors.py
rsync --exclude='.git/' --exclude='node-modules' --recursive --times --compress --progress directors hostinger:~/public_html/filminhos/ &> /dev/null
echo "Uploading clube..."
python3 clube.py
rsync --exclude='.git/' --exclude='node-modules' --recursive --times --compress --progress clube hostinger:~/public_html/filminhos/ &> /dev/null
echo "Uploading yearly review..."
rsync --exclude='.git/' --recursive --times --compress --progress year-review hostinger:~/public_html/filminhos/ &> /dev/null
rm public/master.json
