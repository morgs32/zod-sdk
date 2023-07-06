
exports.createClientSDK = require('./dist/client/createClientSDK').createClientSDK;
exports.createProcedure = require('./dist/client/createClientSDK').createProcedure

// eslint-disable-next-line no-eval
var async_hooks = eval('typeof window === \'undefined\' && require(\'async_hooks\')');

var _createServerRouter = async_hooks 
  ? require('createServerRouter').createServerRouter 
  : () => {
    throw new Error('createServerRouter can only be called on the server');
  }

exports.createServerRouter = _createServerRouter;