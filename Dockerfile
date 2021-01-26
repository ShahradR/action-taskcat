# For v0.9 and higher, the taskcat containers do not pin specific
# versions. Rather, they always fetch the latest version from pip. See
# https://dockr.ly/2BjpG7C to see the taskcat Dockerfile.

# hadolint disable=DL3007
FROM taskcat/taskcat:latest

RUN apk add --no-cache nodejs=12.20.1-r0 npm=12.20.1-r0 && rm -rf /var/cache/apk/*

COPY dist/index.js /dist/index.js

ENTRYPOINT ["/dist/index.js"]
