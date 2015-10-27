"use strict";

import fs from 'mz/fs';
import path from 'path';
import glob from 'glob';
import co from 'co';
import extend from 'extend';
import debugLib from 'debug';

var debug = debugLib('JAWS-Swagger:helpers:swagger-export');

function maybe( fn ){
    return function( obj, ...args ){
        if( !Object.keys( obj || {} ).length ) return undefined;
        else return fn( obj, ...args );
    };
}

export var rootObj = function( schema ){
    return {
        swagger: '2.0',
        info: infoObj(),
        //host: '' // Need to get from jaws-framework
        //basePath: '/' // Need to get from the jaws-framework
        schemes: ['https'], // API Gateway only supports https
        //definitions: {},
        //parameters: {},
        //responses: {},
        //securityDefinitions: {}
        //security
        //tags
        //externalDocs
    }; 
};

export var infoObj = function( schema ){
    return {
        title: "JAWS API",
        //description:  
        //termsOfService 
        //contact: contactObj( schema ),
        //licence: licenceObj( schema ),
        version: '0.1' // TODO
    };
};

export var contactObj = maybe( function( schema ){
    return {
        //name:
        //url:
    };
});

export var licenceObj = maybe( function( schema ){
    return {
        //name:
        //url:
        //email:
    };
});

export var pathObj = maybe( function( schema ){
    return {
        [`/${schema.Path}`]: pathItemObj( schema )
    };
});

export var pathItemObj = maybe( function( schema ){
    return {
        [schema.Method.toLowerCase()]: operationObj( schema )
    };
});

export var operationObj = maybe( function( schema ){
    return {
        //tags
        //summary
        //description
        //externalDocs
        //operationId: '' //Need to get the lambda name
        //consumes
        //produces
        parameters: parameterObjArray( schema ),
        responses: responsesObj( schema.Responses )
        //schemes
        //deprecated
        //security
    };
});

export var parameterObjArray = function( schema ){
    // Path 
    return [].concat(
        pathParamterObjs( schema ),
        requestQueryParameterObjs( schema )
    );

};

export var pathParamterObjs = function( schema ){
    //Extract all path parameters from the path   
    var regexp = /\{\s*([\w-]*)\s*\}/g;
    let returnArray = [];

    var match = regexp.exec( schema.Path );
    while ( match ) {
        returnArray.push({
            name: match[1],
            in: 'path',
            required: true,
            type: 'string'
        });

        match = regexp.exec( schema.Path );
    }

    return returnArray;
};

export var requestQueryParameterObjs = function(){
   return []; 
};

export var responsesObj = maybe( function( responseSchema = {}){
    var response = {};

    for (let prop in responseSchema) {
        let model = responseSchema[prop];

        if( prop !== 'default' ){
            debug(model);
            prop = model.statusCode;
        }

        response[ prop ] = { 
            description: `${prop} response`,
            schema: undefined,
            headers: headersObj( model.responseParameters),
            examples: undefined
        };
    }

    return response;
});

export var headersObj = maybe( function( responseParameters = {} ){
    let returnHeaderObj = {};

    for (let prop in responseParameters) {
        let model = responseParameters[prop];
    
        let header = prop.replace('method.response.header.', '');

        if( typeof model === 'string' ){
            model = {
                type: 'string',
                default: model
            };
        }

        returnHeaderObj[ header ] = model;
    }


    return returnHeaderObj;
});

