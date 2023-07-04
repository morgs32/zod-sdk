import { IRemoteProcedureCall, IRequestOptions } from './types';
import SuperJSON from 'superjson';

interface IProps {
  baseUrl: string;
  rpc: IRemoteProcedureCall;
  requestOptions?: IRequestOptions;
}

export function makeFetchArgs(props: IProps): [string, IRequestOptions] {

  const {
    baseUrl,
    rpc,
    requestOptions,
  } = props;

  const routePath = rpc.path.join('.');

  if (routePath.match(/\.(query|queries)\./)) {
    return [
      `${baseUrl}/${routePath + (
        rpc.input !== undefined
          ? `?input=${SuperJSON.stringify(rpc.input)}`
          : ''
      )}`,
      {
        ...requestOptions,
        method: 'GET',
      }
    ];
  }
  else if (routePath.match(/\.(commands?|mutate|mutations?)\./)) {
    return [
      `${baseUrl}/${routePath}`,
      {
        ...requestOptions,
        method: 'POST',
        body: rpc.input !== undefined 
          ? `{"input":"${SuperJSON.stringify(rpc.input)}}"`
          : undefined,
      }
    ];
  }
  else {
    throw new Error(`Invalid route path: ${routePath}`);
  }

}
