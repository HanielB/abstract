#!/bin/bash

npm run build &> /dev/null
cd build
scp -rp . dcc-login:~/public_html/filminhos/ &> /dev/null
cd -
