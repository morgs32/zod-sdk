import { parseSchema } from '../src'

describe('eval', () => {
  it('is usable I guess', () => {
    const zodSchema = parseSchema({ type: 'string' })
    expect(zodSchema.safeParse('Please just use Ajv instead')).toStrictEqual({
      success: true,
      data: 'Please just use Ajv instead',
    })
  })
})
