FROM node:14.16-buster

RUN npm install -g node-gyp

ENV TARGET_FOLDER_NAME="fgt-workspace"
RUN git clone https://github.com/PharmaLedger-IMI/fgt-workspace.git $TARGET_FOLDER_NAME

RUN cd $TARGET_FOLDER_NAME && \
    npm install --unsafe-perm \

# Copy the API HUB Configs (BDNS, domains, etc)
COPY config/ $TARGET_FOLDER_NAME/apihub-root/external-volume/config/

# Start the server, run build-all, run the ROLE specific API and run the swagger instance<
RUN cd $TARGET_FOLDER_NAME && \
    echo 'npm run server & \n sleep 5s \n npm run build-all \n cd fgt-api && npm run boot-api & \n tail -f /dev/null' >> startup-script.sh
RUN cd $TARGET_FOLDER_NAME && cat startup-script.sh

EXPOSE 8080/tcp
EXPOSE 8081/tcp
EXPOSE 3009/tcp

CMD cd $TARGET_FOLDER_NAME && \
    bash startup-script.sh
