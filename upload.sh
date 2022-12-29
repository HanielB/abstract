#!/bin/bash

npm run build &> /dev/null
cd build
rsync --recursive --times --compress --delete --progress . hostinger:~/public_html/filminhos/ &> /dev/null
cd - &> /dev/null
