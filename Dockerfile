FROM python:3.8.13-alpine3.15

RUN apk add --no-cache python3-dev~3.9 gcc~10 libc-dev~0.7 nodejs~16 npm~8 && rm -rf /var/cache/apk/*

RUN pip3 install --upgrade pip && \
    pip3 install "Cython<3.0" "pyyaml<6" --no-build-isolation && \
    pip3 install taskcat==0.9.23 --upgrade

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY dist/index.js /dist/index.js

ENTRYPOINT ["/entrypoint.sh"]
