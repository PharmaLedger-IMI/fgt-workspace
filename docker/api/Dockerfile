#
# Docker image build for Finished Goods Traceability (FGT)
#
# docker build --build-arg GIT_BRANCH=v0.9.7 -t fgt:v0.9.7 --rm=false --pull --network host -f=Dockerfile .
#
FROM node:16.14.2-alpine

# The tag, branch or commit hash to clone.
ARG GIT_BRANCH
ENV GIT_BRANCH=${GIT_BRANCH:-master}

RUN apk --no-cache add git curl && apk add --no-cache --upgrade bash

RUN npm install -g node-gyp 

# create folder fgt-workspace and change its owner to pre-existing user 'node'
RUN mkdir -p /fgt-workspace

#checkov:skip=CKV_DOCKER_3: "Ensure that a user for the container has been created"
WORKDIR /fgt-workspace

# Build the software - Note: Clone by specific tag or branch
RUN git clone -b ${GIT_BRANCH} --single-branch --depth 1 https://github.com/PharmaLedger-IMI/fgt-workspace.git . && \
    npm install --unsafe-perm

# Remove all Git related files and directories - see https://gist.github.com/facelordgists/80e868ff5e315878ecd6
RUN find . \( -name ".git" -o -name ".gitignore" -o -name ".gitmodules" -o -name ".gitattributes" \) -exec rm -rf -- {} +

# Save some space by removing directories not needed in production
RUN rm -rf docs workdocs

# git no longer needed for runtime
RUN apk del git

RUN chown -R node /fgt-workspace

USER node

CMD ["npm", "run", "server"]
# The command above starts the apihub server, and never returns.
# tracebility must additionally execute "npm run build-all".
# participants must additionally execute "npm run build-all ; cd fgt-api && npm run boot-api " (or npm run boot-api-helm).
# That needs to be perfomed by external tool.

# APIHub & Dashboard - traceability only has apihub.
EXPOSE 8080/tcp
# FGT API - different for Wholesaler & Pharmacy
EXPOSE 8081/tcp
# Swagger
EXPOSE 3009/tcp

