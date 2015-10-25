"use strict";

import fs from 'mz/fs';
import path from 'path';
import glob from 'glob';
import co from 'co';
import extend from 'extend';
import debugLib from 'debug';

var debug = debugLib('JAWS-Swagger:helper:swagger');

var rootSwaggerObj = {
    "swagger": "2.0",
};

export function exportJSON(  projectRoot = '.' ){
    return co(function*(){
        debug(`Building swagger.json for project ${projectRoot}`);

        let awsmFiles = yield new Promise( (resolve, reject) => {
            glob( path.join( projectRoot, "aws_modules/*/*/awsm.json"), (err, files) => {
                if( err ) reject( err);
                else resolve( files );
            });
        });

        debug('Found files:', awsmFiles);

        let parsedDefinitions = yield awsmFiles.map( parseAWSM );

        return extend.apply(null, [true, {}, rootSwaggerObj].concat(parsedDefinitions));
    });
}

export function parseAWSM( file ) {
   return co( function*(){
        debug('Preparsing', file);

        let json = JSON.parse( yield fs.readFile( file ) );

        if( ! json.apiGateway ){
            debug(`Skipping ${file}. Reason: No apiGateway config.`);
            return null;
        }

        json = {
            path: {
                [`/${json.apiGateway.cloudFormation.Path}`]: {
                    [`/${json.apiGateway.cloudFormation.Method.toLowerCase()}`]: {
                        parameters: mapExportRequest( json.apiGateway.cloudFormation.RequestModel),
                        responses: mapExportResponse( json.apiGateway.cloudFormation.Responses)
                    }
                }
            },
        };

        debug('Finished', file,  JSON.stringify( json, null, '  ' ));
        return json;
    }).catch( (err) => {
        debug(`Error while parsing AWSM file ${file}:`, err);
        throw err;
    });
}

function mapExportRequest( request ){

}

function mapExportResponse( response ){

}
