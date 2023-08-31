import { z } from 'zod'
import { coerceAllDates } from 'server/src/coerceAllDates'

describe('coerceAllDates', () => {
  it('z.date()', async () => {
    const schema = z.date()
    const coerced = coerceAllDates(schema)
    expect(() => schema.parse('2020-01-01'))
      .toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          \\"code\\": \\"invalid_type\\",
          \\"expected\\": \\"date\\",
          \\"received\\": \\"string\\",
          \\"path\\": [],
          \\"message\\": \\"Expected date, received string\\"
        }
      ]"
    `)
    expect(coerced.parse('2020-01-01')).toEqual(new Date('2020-01-01'))
    expect(schema._def).toMatchInlineSnapshot(`
      {
        "checks": [],
        "coerce": false,
        "typeName": "ZodDate",
      }
    `)
    expect(coerced._def).toMatchInlineSnapshot(`
      {
        "checks": [],
        "coerce": true,
        "description": undefined,
        "errorMap": [Function],
        "typeName": "ZodDate",
      }
    `)
  })

  it('z.union()', async () => {
    const schema = z.union([z.date(), z.string()])
    expect(schema.options[0]._def).toMatchInlineSnapshot(`
      {
        "checks": [],
        "coerce": false,
        "typeName": "ZodDate",
      }
    `)
    // @ts-ignore
    expect(coerceAllDates(schema).options[0]._def).toMatchInlineSnapshot(`
      {
        "checks": [],
        "coerce": true,
        "description": undefined,
        "errorMap": [Function],
        "typeName": "ZodDate",
      }
    `)
  })
})
