#!/bin/bash

if [ "$1" != "--no-build" ]; then
    echo "Building..."
    npm run build &> /dev/null
else
    cp public/*json build/
fi
cd build
echo "Uploading..."
rsync --exclude='.git/' --exclude='node-modules' --recursive --times --compress --progress . hostinger:~/public_html/filminhos/ &> /dev/null
cd - &> /dev/null
cd public
unzip -o master.zip &> /dev/null
cd - &> /dev/null
echo "Uploading lists..."
./index.py lists/
rsync --exclude='.git/' --exclude='node-modules' --recursive --times --compress --progress lists hostinger:~/public_html/filminhos/ &> /dev/null
echo "Uploading directors..."
./directors.py
rsync --exclude='.git/' --exclude='node-modules' --recursive --times --compress --progress directors hostinger:~/public_html/filminhos/ &> /dev/null
# echo "Uploading yearly review..."
# rsync --exclude='.git/' --recursive --times --compress --progress year-review hostinger:~/public_html/filminhos/ &> /dev/null
rm public/master.json
