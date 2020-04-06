FROM taskcat/taskcat

ENTRYPOINT /bin/sh -c "set -euo pipefail && taskcat test run | cat"
