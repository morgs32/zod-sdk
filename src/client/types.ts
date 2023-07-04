
import { SWRConfiguration } from 'swr'
import { IHandler, IRoutes } from '../server/types'

export type IRequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}

export type INextFunction = () => Promise<any>

export type IClientSDK<R extends IRoutes> = {
  [K in keyof R]: R[K] extends IHandler<infer F> 
    ? F 
    : R[K] extends (...args: any[]) => any
      ? R[K]
      : R[K] extends IRoutes 
        ? IClientSDK<R[K]> 
        : never;
}

export type IClientSDKInternal = IClientSDK<any> & {
  _baseUrl: () => string;
  _swrConfig: () => SWRConfiguration | undefined;
}

export interface IRemoteProcedureCall {
  path: string[];
  input: unknown[];
}
