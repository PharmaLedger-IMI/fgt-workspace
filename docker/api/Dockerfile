FROM node:14.16-buster
ARG ROLE=mah
ARG CREDENTIALS_FILE=mah-roche.json
ARG SWAGGER_SERVER=http://api.mah-roche.localhost:8080/traceability

ENV ROLE "$ROLE"
RUN echo "Environment ROLE recognized as $ROLE"

ENV CREDENTIALS_FILE "$CREDENTIALS_FILE"
RUN echo "Environment CREDENTIALS recognized as $CREDENTIALS_FILE"

ENV SWAGGER_SERVER "$SWAGGER_SERVER"
RUN echo "Environment SWAGGER_SERVER recognized as $SWAGGER_SERVER"

RUN npm install -g node-gyp

ENV TARGET_FOLDER_NAME="fgt-workspace"
RUN git clone https://github.com/PharmaLedger-IMI/fgt-workspace.git $TARGET_FOLDER_NAME

# Copy the API HUB Configs (BDNS, domains, etc)
COPY config/ $TARGET_FOLDER_NAME/apihub-root/external-volume/config/

# Copy the desired credentials to the ROLE specific folder
COPY env/$CREDENTIALS_FILE $TARGET_FOLDER_NAME/fgt-api/config/fgt-${ROLE}-wallet/credentials.json

RUN cd $TARGET_FOLDER_NAME && \
    npm install --unsafe-perm

# Start the server, run build-all, run the ROLE specific API and run the swagger instance<
RUN cd $TARGET_FOLDER_NAME && \
    echo 'npm run server & \n sleep 5s \n npm run build-all \n cd fgt-api && npm run run-$ROLE & \n sleep 5s \n cd fgt-api && npm run run-swagger -- --participant=$ROLE --server=$SWAGGER_SERVER & \n tail -f /dev/null' >> startup-script.sh
RUN cd $TARGET_FOLDER_NAME && cat startup-script.sh

EXPOSE 8080/tcp

CMD cd $TARGET_FOLDER_NAME && \
    bash startup-script.sh
