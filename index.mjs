import { createClientSDK, useRPC } from './dist/client';

// eslint-disable-next-line no-eval
const async_hooks = eval('typeof window === \'undefined\' && require(\'async_hooks\')');

const {
  createProcedure,
  createServerRouter
} = async_hooks 
  ? require('./dist/server')
  : () => {
    throw new Error('createServerRouter can only be called on the server');
  }

export {
  createClientSDK,
  useRPC,
  createProcedure,
  createServerRouter,
}