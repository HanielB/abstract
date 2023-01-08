#!/bin/bash

if [ "$1" != "--no-build" ]; then
    echo "Building..."
    npm run build &> /dev/null
else
    cp public/*json build/
fi
cd build
echo "Uploading..."
rsync --exclude='.git/' --recursive --times --compress --progress . hostinger:~/public_html/filminhos/ &> /dev/null
cd - &> /dev/null
echo "Uploading lists..."
./index.py lists/
rsync --exclude='.git/' --recursive --times --compress --progress lists hostinger:~/public_html/filminhos/ &> /dev/null
