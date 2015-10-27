"use strict";

import co from 'co';
import fs from 'mz/fs';
import debugLib from 'debug';
import yaml from 'yamljs';
import swaggerParser from 'swagger-parser';
import { parseProject, parseAWSM } from '../helpers/parser';

var debug = debugLib('JAWS-Swagger:commands:export');

export function exportProject( projectPath = '.', targetPath = 'swagger.json', format = 'json' ){
    return co(function*(){
        let output = yield parseProject( projectPath );
        yield swaggerParser.validate( output );
        yield writeFile( targetPath, output, format );
    });
}

export function exportAWSM( awsmPath = '.', targetPath = 'swagger.json', format = 'json' ){
    return co(function*(){
        let output = yield parseAWSM( awsmPath );
        yield writeFile( targetPath, output, format );
    });
}

function writeFile( targetPath, output, format ){
    if( format === 'yaml' ){
        output = yaml.stringify( output, 4 );
    }
    else if ( format === 'json' ){
        output = JSON.stringify( output, null, '  ');
    }
    else {
        throw "Invalid export format. Valid options 'json' or 'yaml'";
    }

    return fs.writeFile( targetPath , output, 'utf8');
}
