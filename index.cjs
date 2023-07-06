exports.createClientSDK = require('./dist/client/index.cjs').createClientSDK;
exports.useRPC = require('./dist/client/index.cjs').useRPC;

// eslint-disable-next-line no-eval
var async_hooks = eval('typeof window === \'undefined\' && require(\'async_hooks\')');

exports.createServerRouter = async_hooks 
  ? require('./dist/server/index.cjs').createServerRouter 
  : () => {
    throw new Error('createServerRouter can only be called on the server');
  }