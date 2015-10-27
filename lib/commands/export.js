"use strict";

import co from 'co';
import fs from 'mz/fs';
import debugLib from 'debug';
import { parseProject, parseAWSM } from './parser';

var debug = debugLib('JAWS-Swagger:commands:export');

export function exportProject( projectPath = '.', targetPath = 'swagger.json' ){
    return co(function*(){
        let json = yield parseProject( projectPath );
        yield fs.writeFile( targetPath , JSON.stringify(json, null, '  '), 'utf8');
    });
}

export function exportAWSM( awsmPath = '.', targetPath = 'swagger.json' ){
    return co(function*(){
        let json = yield parseAWSM( awsmPath );
        yield fs.writeFile( targetPath , JSON.stringify(json, null, '  '), 'utf8');
    });
}
