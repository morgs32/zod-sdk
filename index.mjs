import { createClientSDK } from './src/client/createClientSDK';
import { createProcedure } from './src/server/createProcedure';

// eslint-disable-next-line no-eval
const async_hooks = eval('typeof window === \'undefined\' && require(\'async_hooks\')');

const _createServerRouter = async_hooks 
  ? require('createServerRouter').createServerRouter 
  : () => {
    throw new Error('createServerRouter can only be called on the server');
  }

export {
  createClientSDK,
  createProcedure,
  _createServerRouter as createServerRouter,
}