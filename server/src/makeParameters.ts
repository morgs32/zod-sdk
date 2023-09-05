import { z } from 'zod'

export const makeParameters = <
  F extends (...args: any[]) => any, // Weird but we can't use IFunc here
  S extends z.ZodType<Parameters<F>>,
>(
  _: F,
  schema: S
): S => schema
