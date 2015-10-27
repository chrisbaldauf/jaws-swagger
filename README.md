# jaws-swagger

A Swagger.io plugin for the JAWS Framework

## Initalizing a New JAWS Project

    $ ./bin/jaws-swagger init swagger.json

## Project Structure

This plugin is opinionated about the layout of the JAWS project that it creates
in order to play nicely with the jaws dash command, keep the source code organized,
and make the resulting application "rest-y".

### Input
```
swagger: '2.0'
...
paths:
  /customers:
    post:
      ...
  /customers/{id}:
    delete:
      ...
    get:
      ...
    put:
      ...
```

### Generated Output
```
aws_modules/
  customers/
    post/
      awsm.json # apiGateway.cloudFormation.method: POST
      event.json
      handler.js
      index.js
  customers-id/
    delete/
      awsm.json # apiGateway.cloudFormation.method: DELETE
      event.json
      handler.js
      index.js
    get/
      awsm.json # apiGateway.cloudFormation.method: GET
      event.json
      handler.js
      index.js
    put/
      awsm.json # apiGateway.cloudFormation.method: PUT
      event.json
      handler.js
      index.js
```

## TODO / Known Issues
* $ref: handling
* Properly handling input file path
* `-v` DEBUG output doesn't appear to work, but `DEBUG=jaws-swagger:*` does.
* Using bundled jaws-framework from fork. Need to get changes merged into jaws-framework proper
