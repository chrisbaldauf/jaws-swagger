'use strict';

var path = require('path')
  , exec = require('child_process').exec
  , debug = require('debug')('jaws-swagger:init');

function _getQueryParams(method) {
  return method.parameters
    .filter(function(param) {
      return param.in === 'query';
    }).map (function(param) {
      return param.name;
    });
}

function _processPaths(paths, basePath) {
  debug('basePath: %s', basePath);
  for (var pathString in paths) {
    _processPath(pathString, paths[pathString], basePath);
  }
}

function _processPath(pathString, path, basePath) {
  debug('pathString: %s', pathString);
  for (var method in path) {
    _processMethod(method, path[method], pathString, basePath);
  }
}

function _processMethod(methodString, method, pathString, basePath) {
  debug('methodString: %s', methodString);
  var command = [];
  if (pathString[0] === '/') {
    pathString = pathString.substring(1);
  }
  var moduleName = pathString.split('/').join('-');
  // Temporary until we get the real changes merged into jaws-framework/JAWS
  command.push('./node_modules/.bin/jaws');
  command.push('module create');
  command.push(moduleName);
  command.push(methodString.toLowerCase());
  command.push('--method');
  command.push(methodString.toUpperCase());
  command.push('--path');
  command.push(path.join(basePath, pathString));
  var queryParams = _getQueryParams(method);
  if (queryParams.length) {
    command.push('--query-params');
    command.push(queryParams.join(','));
  }

  var commandString = command.join(' ');
  debug(commandString);
  exec(commandString, function(error, stdout, stderr) {
    if (error) {
      if (stderr.indexOf("already exists") >= 0) {
        console.log("JAWS-swagger: " + moduleName + "/" + methodString.toLowerCase() + " already exists. Skipping...")
      } else {
        console.log("Error running command " + commandString);
        throw stderr;
      }
    } else {
      console.log(stdout);
    }
  });
}

module.exports.run = function(file, options) {
  console.log('Initializing jaws project from ' + file);
  try {
    var appDir = path.dirname(require.main.filename);
    var swagger = require(appDir + '/../' + file);
    debug('Loading swagger json file from %s', swagger);
    _processPaths(swagger.paths, swagger.basePath);
  } catch (ex) {
    console.error('Unable to load swagger file from ' + file);
  }
}
