import { z } from 'zod'
import { zutils } from 'zod-utils'

describe('coerceAllDates', () => {
  it('z.date()', async () => {
    const schema = z.date()
    const coerced = zutils.coerceAllDates(schema)
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
    expect(zutils.coerceAllDates(schema).options[0]._def)
      .toMatchInlineSnapshot(`
      {
        "checks": [],
        "coerce": true,
        "description": undefined,
        "errorMap": [Function],
        "typeName": "ZodDate",
      }
    `)
  })

  it('z.optional()', async () => {
    const schema = z.tuple([
      z.union([
        z.object({
          asOfDate: z.date().optional(),
          string: z.string(),
        }),
        z.object({
          asOfDate: z.date().optional(),
          number: z.number(),
        }),
      ]),
    ])

    const coerced = zutils.coerceAllDates(schema) as typeof schema
    expect(coerced.items[0].options[1].shape.asOfDate._def.innerType._def)
      .toMatchInlineSnapshot(`
        {
          "checks": [],
          "coerce": true,
          "description": undefined,
          "errorMap": [Function],
          "typeName": "ZodDate",
        }
      `)
    expect(() =>
      coerced.parse([
        {
          asOfDate: '2023-08-31T00:00:00.000Z',
          string: 'wtiNymexApo',
        },
      ])
    ).not.toThrow()
  })
})
