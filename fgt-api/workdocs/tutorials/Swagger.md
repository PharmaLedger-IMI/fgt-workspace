# Swagger API DOC

## Running server
On `fgt-api` folder, run `npm run run-swagger`. Navigate to http://localhost:3009.

### Command Line Arguments
#### port
    swagger server listening port
    - argument: port
    - env variable name: SWAGGER_PORT
    - default: 3009

#### participant
    .yml file name
    - argument: participant
    - env variable name: SWAGGER_PARTICIPANT
    - default: MAH

#### path
    folder path to .yml file to load swagger UI
    - argument: path
    - env variable name: SWAGGER_PATH
    - default: ./docs

#### server
    API url that swagger requests will be done
    - argument: server
    - env variable name: SWAGGER_SERVER
    - default: http://localhost:8081/traceability

## Example
    npm run run-swagger -- --port=3030 --participant=PHA