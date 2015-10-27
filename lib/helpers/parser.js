"use strict";

import co from 'co';
import fs from 'mz/fs';
import path from 'path';
import glob from 'glob';
import extend from 'extend';
import debugLib from 'debug';
import { rootObj, pathObj } from './swagger-export';

var debug = debugLib('JAWS-Swagger:helpers:parser');

export function parseProject(  projectRoot = '.' ){
    return co(function*(){
        debug(`Building swagger.json for project ${projectRoot}`);

        let awsmFiles = yield new Promise( (resolve, reject) => {
            glob( path.join( projectRoot, "aws_modules/*/*/awsm.json"), (err, files) => {
                if( err ) reject( err);
                else resolve( files );
            });
        });

        debug('Found files:', awsmFiles);

        let rootSwaggerObj = yield rootObj();
        let parsedDefinitions = yield awsmFiles.map( parseAWSM );

        let json = extend(true, rootSwaggerObj, ...parsedDefinitions);
        debug('Generated JSON', JSON.stringify( json ));

        return json;
    });
}

export function parseAWSM( awsmJSONPath = './awsm.json' ) {
   return co( function*(){
        debug('Preparsing', awsmJSONPath );

        let json = JSON.parse( yield fs.readFile( awsmJSONPath ) );

        if( ! json.apiGateway ){
            debug(`Skipping ${awsmJSONPath}. Reason: No apiGateway config.`);
            return null;
        }

        debug(`Parsing ${awsmJSONPath}`);
        json = pathObj( json.apiGateway.cloudFormation );

        debug('Finished', awsmJSONPath,  JSON.stringify( json ));
        return json;
    }).catch( (err) => {
        debug(`Error while parsing AWSM file ${awsmJSONPath}:`, err);
        throw err;
    });
}
