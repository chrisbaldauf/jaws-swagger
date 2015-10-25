"use strict";

import co from 'co';
import fs from 'mz/fs';
import fse from 'fs-extra';
import path from 'path';
import debugLib from 'debug';
import { exportJSON } from '../helpers/swagger-export';
import { uploadDir } from '../helpers/aws';

var debug = debugLib('JAWS-Swagger:documentation');

export function create( projectRootPath = '.' ){
    return co(function*(){
        // Get the absolute path
        projectRootPath = path.resolve( projectRootPath );
        debug(`Project root path ${projectRootPath}`);

        let swaggerUITemplatePath = path.dirname( require.resolve('swagger-ui' ) );
        debug(`SwaggerUI template path ${swaggerUITemplatePath}`);

        let distPath = path.join( projectRootPath, 'swagger-ui');

        let previousDist = yield fs.stat( distPath ).catch( () => null );

        if( !previousDist ){

            debug(`Copying swagger-ui from ${swaggerUITemplatePath} to ${distPath}`);
            yield new Promise( (resolve, reject) => {
                fse.copy( swaggerUITemplatePath, distPath, (err) => {
                    if( err ) reject( err );
                    resolve();
                });
            });

            debug('Replacing index.html with updated swagger.json url');
            let indexContents = yield fs.readFile(path.join( swaggerUITemplatePath, 'index.html'), 'utf8');
            indexContents = indexContents.replace(/http:\/\/petstore.swagger.io\/v2\/swagger.json/g, '/swagger.json');
            yield fs.writeFile( path.join( distPath, 'index.html' ), indexContents, 'utf8');

        } else {
            debug('Found previous swagger-ui dist folder, skipping copy step');
        }
            
        debug(`Retrieving swagger JSON from ${projectRootPath}`);
        let json = yield exportJSON( projectRootPath );

        debug(`Writing JSON to ${path.join(distPath, 'swagger.json')}`);
        yield fs.writeFile( path.join(distPath, 'swagger.json'), JSON.stringify(json, null, '  ') );

        debug('Uploading SwaggerUI Dist to S3');
        yield uploadDir( swaggerUITemplatePath );

    }).catch( (err) => console.log(err) );
}
