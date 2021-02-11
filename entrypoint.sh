#! /bin/sh

if [ "${INPUT_UPDATE_TASKCAT}" == "true" ]; then
    pip install --upgrade taskcat
fi

if [ "${INPUT_UPDATE_LINT}" == "true" ]; then
    pip install --upgrade cfn-lint
fi

taskcat $@ --minimal-output
