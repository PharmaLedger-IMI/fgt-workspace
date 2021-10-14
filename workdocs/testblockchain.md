### Deploy and test with a local blockchain

- (optional) clean 'fake' blockchain: ```npm run clean```
- stop the server;
- run ```npm run deploy-test-chain```. This will build a local blockchain infrastrucure and point the tracebility
  domain anchoring to that blockchain;
- run ```npm run server``` to load the server with the new settings;
- run ```npm run build-all``` to build the environment in the 'real' blockchain;
- follow up with whatever environment build required