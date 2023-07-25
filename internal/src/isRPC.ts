import { IBaseRPC } from '.';

export function isRPC(v: unknown): v is IBaseRPC {
  return typeof v === 'object' && v !== null && 'input' in v;
}
