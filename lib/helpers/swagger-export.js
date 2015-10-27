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

export var rootObj = function(){
    return {
        swagger: '2.0',
        //info: {}
        //host: '' // Need to get from jaws-framework
        //basePath: '/' // Need to get from the jaws-framework
        schemes: 'https', // API Gateway only supports https
        //definitions: {},
        //parameters: {},
        //responses: {},
        //securityDefinitions: {}
        //security
        //tags
        //externalDocs
    }; 
};

export var pathObj = maybe( function( schema ){
    return {
        path: pathItemObj( schema )
    };
});

export var pathItemObj = maybe( function( schema ){
    return {
        [`/${schema.Path}`]: operationObj( schema )
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

export var parameterObjArray = maybe( function( schema ){
    return {};
    //return {
        //name: '',
        //in: ''
        //description:  ''
        //required:''
    //};
});

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

