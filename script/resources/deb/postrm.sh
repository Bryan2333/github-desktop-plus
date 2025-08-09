#!/bin/bash
set -e

PROFILE_D_FILE="/etc/profile.d/github-desktop-plus.sh"
BASE_FILE="/usr/bin/github"

case "$1" in
    purge|remove|upgrade|failed-upgrade|abort-install|abort-upgrade|disappear)
      echo "#!/bin/sh" > "${PROFILE_D_FILE}";
      . "${PROFILE_D_FILE}";
      rm "${PROFILE_D_FILE}";
      # remove symbolic links in /usr/bin directory
      test -f ${BASE_FILE} && unlink ${BASE_FILE}
      test -f ${BASE_FILE}-desktop-plus && unlink ${BASE_FILE}-desktop-plus
      test -f ${BASE_FILE}-desktop-plus-dev && unlink ${BASE_FILE}-desktop-plus-dev
    ;;

    *)
      echo "postrm called with unknown argument \`$1'" >&2
      exit 1
    ;;
esac

exit 0
