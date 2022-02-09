#### Deployment

##### Test Environment

Go to ```./docker/api``` and run 

```shell
docker-compose build --no-cache 
```
This will build all the necessary images (and will take some time)

Followed by
```shell
docker-compose up
```

After this command executes you can go to your browser and:
 - localhost:8080/dashboard/ - Here you can see all the routing rules necessary to simulate the environment
 - localhost:8080/ - Here you'll find Pharmaledger's Traceability Use Case Entry Page with access to the dossier Explorer (and the possibility to create new instances of the (deprecated) UI based wallets)
 - For each participant, under ${ParticipantId}.fgt.pharmaledger.pdmfc.com:
   - .../ - The participants Entry Page (Should be the same as the Use Case's);
   - .../api/** - The route to the Participant's REST API;
   - .../swagger - The Participant's Swagger Dashboard, to replace the ERP's and allow partners to interact with the REST API;
   - .../dashboard - A Graphical interface to consume the api and display relevant information/metrics