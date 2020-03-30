FROM taskcat/taskcat

ENTRYPOINT /bin/sh -c "taskcat test run | cat"
