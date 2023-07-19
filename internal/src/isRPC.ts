import { IRemoteProcedureCall } from 'zod-sdk/internal';

export function isRPC(v: unknown): v is IRemoteProcedureCall {
  return typeof v === 'object' && v !== null && 'input' in v;
}
