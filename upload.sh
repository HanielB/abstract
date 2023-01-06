#!/bin/bash

if [ "$1" != "--no-build" ]; then
    echo "Building..."
    npm run build &> /dev/null
else
    cp public/*json build/
fi
cd build
echo "Uploading..."
rsync --exclude='.git/' --recursive --times --compress --delete --progress . hostinger:~/public_html/filminhos/ &> /dev/null
cd - &> /dev/null
