FROM node:14.16-buster

RUN npm install -g node-gyp

ENV TARGET_FOLDER_NAME="fgt-workspace"
RUN git clone https://github.com/PharmaLedger-IMI/fgt-workspace.git $TARGET_FOLDER_NAME

RUN cd $TARGET_FOLDER_NAME && \
    npm install --unsafe-perm \

COPY config/ $TARGET_FOLDER_NAME/apihub-root/external-volume/config/

RUN cd $TARGET_FOLDER_NAME && \
    echo 'npm run server & sleep 5s \n npm run run-mah \n tail -f /dev/null' >> startup-script.sh
RUN cd $TARGET_FOLDER_NAME && cat startup-script.sh

EXPOSE 8080/tcp

CMD cd $TARGET_FOLDER_NAME && \
    bash startup-script.sh
