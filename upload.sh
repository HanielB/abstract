#!/bin/bash

# if fresh repo:
# - install via apt npm
# - npm install

if [ "$1" != "--no-build" ]; then
    echo "Building..."
    npm run build &> /dev/null
else
    cp public/*json build/
fi
cd build
echo "Uploading..."
rsync --exclude='.git/' --exclude='node-modules' --exclude='directors/' --exclude='year-review/' --delete --recursive --times --compress --progress . hostinger:~/public_html/filminhos/ &> /dev/null
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
echo "Uploading yearly review..."
rsync --exclude='.git/' --recursive --times --compress --progress year-review hostinger:~/public_html/filminhos/ &> /dev/null
rm public/master.json
