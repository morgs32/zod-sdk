import { IBaseRPC } from 'zod-sdk/server'

export function isRPC(v: unknown): v is IBaseRPC {
  return typeof v === 'object' && v !== null && 'input' in v
}
