#
# Base Docker image containing the software - NOT to be used at runtime! - Also see https://github.com/PharmaLedger-IMI/epi-workspace/issues/577
# This Dockefile builds the software only!
#
# docker build --target=base --build-arg GIT_BRANCH=v0.8.6 -t fgt:v0.8.6-base --rm=false --pull --network host -f=Dockerfile .
#
FROM node:16 as base

# The tag, branch or commit hash to clone.
ARG GIT_BRANCH
ENV GIT_BRANCH=${GIT_BRANCH:-v0.8.6}

RUN npm install -g node-gyp

# create folder fgt-workspace and change its owner to pre-existing user 'node'
RUN mkdir -p /fgt-workspace && \
    chown node /fgt-workspace

#checkov:skip=CKV_DOCKER_3: "Ensure that a user for the container has been created"
USER node
WORKDIR /fgt-workspace

# Build the software - Note: Clone by specific tag or branch
RUN git clone -b ${GIT_BRANCH} --single-branch --depth 1 https://github.com/PharmaLedger-IMI/fgt-workspace.git . && \
    npm install --unsafe-perm

# Remove all Git related files and directories - see https://gist.github.com/facelordgists/80e868ff5e315878ecd6
RUN find . \( -name ".git" -o -name ".gitignore" -o -name ".gitmodules" -o -name ".gitattributes" \) -exec rm -rf -- {} +

#All of the next lines will be handled from deployment.yaml

#ADD config/env.json /$TARGET_FOLDER_NAME/env.json
#After the custimization of config/server.json file uncomment the next line
#ADD config/server.json /$TARGET_FOLDER_NAME/apihub-root/external-volume/config/server.json
#ADD config/BDNS.hosts /$TARGET_FOLDER_NAME/apihub-root/external-volume/config/BDNS.hosts
#ADD config/ssl_certs /$TARGET_FOLDER_NAME/apihub-root/external-volume/config/ssl/server.crt
#ADD config/ssl_certs /$TARGET_FOLDER_NAME/apihub-root/external-volume/config/ssl/server.key



# -----------------------------------------------------------------------------------
#
# Used for runtime. This is a minimal image based on Alpine.
# We copy the build result from "base" image to this image
#
# Build:
# docker build --target=runtime --build-arg GIT_BRANCH=v0.8.6 -t fgt:v0.8.6 --rm=false --pull --network host -f=Dockerfile .
#
# Run:
# docker run --rm fgt:v0.8.6
FROM node:16-alpine as runtime
RUN apk --no-cache add ca-certificates git && \
    npm install -g node-gyp

COPY --from=base /fgt-workspace /fgt-workspace
WORKDIR /fgt-workspace

COPY startup-script.sh startup-script.sh
RUN chown node startup-script.sh && \
    chmod 0500 startup-script.sh
#checkov:skip=CKV_DOCKER_3: "Ensure that a user for the container has been created"
USER node

# APIHub
EXPOSE 8080/tcp
# FGT API
EXPOSE 8081/tcp
# Swagger
EXPOSE 3009/tcp

CMD /bin/sh startup-script.sh