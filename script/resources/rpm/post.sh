#!/bin/bash

INSTALL_DIR="/usr/lib/github-desktop-plus"
CLI_DIR="$INSTALL_DIR/resources/app/static"

# add executable permissions for CLI interface
chmod +x "$CLI_DIR"/github || :

# create symbolic links to /usr/bin directory
ln -f -s "$CLI_DIR"/github /usr/bin || :

# https://github.com/shiftkey/desktop/issues/21
if [ ! -f /usr/lib64/libcurl-gnutls.so.4 ]; then
  ln -s /usr/lib64/libcurl.so.4 /usr/lib64/libcurl-gnutls.so.4
fi

exit 0
