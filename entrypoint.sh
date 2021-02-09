#! /bin/sh

if [ "${INPUT_UPDATE_TASKCAT}" == "true" ]; then
    pip install --upgrade taskcat
fi

taskcat $@ --minimal-output
