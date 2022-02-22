FROM node:14.16-buster

RUN npm install -g node-gyp

ENV TARGET_FOLDER_NAME="fgt-workspace"
RUN git clone https://github.com/PharmaLedger-IMI/fgt-workspace.git $TARGET_FOLDER_NAME

RUN cd $TARGET_FOLDER_NAME && \
    npm install --unsafe-perm

COPY config/ $TARGET_FOLDER_NAME/apihub-root/external-volume/config/

RUN cd $TARGET_FOLDER_NAME && \
    echo 'npm run server & \n sleep 5s \n npm run build-all \n tail -f /dev/null' >> startup-script.sh
RUN cd $TARGET_FOLDER_NAME && cat startup-script.sh

# #30 alternative startup script with ethAdapter
RUN cd $TARGET_FOLDER_NAME && \
    echo 'npm run switch-to-test-chain ; source startup-script.sh' >> startup-eth-script.sh

EXPOSE 8080/tcp

CMD cd $TARGET_FOLDER_NAME && \
    bash startup-script.sh
