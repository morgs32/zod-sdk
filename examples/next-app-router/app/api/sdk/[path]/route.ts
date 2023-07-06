import { NextResponse } from 'next/server'
import * as foo from 'okrpc'

console.log('foo', foo)
// const router = createServerRouter(routes)

export async function GET(req: Request) {
  return NextResponse.json(foo)
};
