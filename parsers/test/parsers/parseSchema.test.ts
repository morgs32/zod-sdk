import { parseSchema } from '../../src';

describe('parseSchema', () => {
  
  describe('parseString', () => {
    
    it('string', () => {
      const schema = parseSchema({ type: 'string' })
      expect(schema._def).toMatchInlineSnapshot(`
        {
          "checks": [],
          "coerce": false,
          "typeName": "ZodString",
        }
      `);
      expect(schema.parse('foo')).toEqual('foo')
    })

    
    it('parseDate', () => {
      const schema = parseSchema({ 
        type: 'string',
        format: 'date-time'
      })
      expect(schema._def).toMatchInlineSnapshot(`
        {
          "checks": [],
          "coerce": true,
          "description": undefined,
          "errorMap": [Function],
          "typeName": "ZodDate",
        }
      `);
      expect(schema.parse('2021-10-10')).toEqual(new Date('2021-10-10'))

    });

    it('parseObject', () => {
      const schema = parseSchema({
        type: 'object',
        properties: {
          foo: {
            type: 'string',
            format: 'date-time'
          },
          bar: {
            type: 'number',
          }
        }
      })

      expect(schema._def).toMatchInlineSnapshot(`
        {
          "catchall": ZodNever {
            "_def": {
              "typeName": "ZodNever",
            },
            "and": [Function],
            "array": [Function],
            "brand": [Function],
            "catch": [Function],
            "default": [Function],
            "describe": [Function],
            "isNullable": [Function],
            "isOptional": [Function],
            "nullable": [Function],
            "nullish": [Function],
            "optional": [Function],
            "or": [Function],
            "parse": [Function],
            "parseAsync": [Function],
            "pipe": [Function],
            "promise": [Function],
            "refine": [Function],
            "refinement": [Function],
            "safeParse": [Function],
            "safeParseAsync": [Function],
            "spa": [Function],
            "superRefine": [Function],
            "transform": [Function],
          },
          "shape": [Function],
          "typeName": "ZodObject",
          "unknownKeys": "strip",
        }
      `);
      expect(schema.parse({
        foo: '2021-10-10',
        bar: '5'
      })).toEqual({
        foo: new Date('2021-10-10'),
        bar: 5
      })
      
    });

  });

  
  it('parseArray', () => {
    const schema = parseSchema({
      type: 'array',
      items: [
        {
          type: 'string',
          format: 'date-time'
        },
        {
          type: 'number',
        }
      ]
    })
      
    expect(schema._def).toMatchInlineSnapshot(`
      {
        "items": [
          ZodDate {
            "_def": {
              "checks": [],
              "coerce": true,
              "description": undefined,
              "errorMap": [Function],
              "typeName": "ZodDate",
            },
            "and": [Function],
            "array": [Function],
            "brand": [Function],
            "catch": [Function],
            "default": [Function],
            "describe": [Function],
            "isNullable": [Function],
            "isOptional": [Function],
            "nullable": [Function],
            "nullish": [Function],
            "optional": [Function],
            "or": [Function],
            "parse": [Function],
            "parseAsync": [Function],
            "pipe": [Function],
            "promise": [Function],
            "refine": [Function],
            "refinement": [Function],
            "safeParse": [Function],
            "safeParseAsync": [Function],
            "spa": [Function],
            "superRefine": [Function],
            "transform": [Function],
          },
          ZodNumber {
            "_def": {
              "checks": [],
              "coerce": true,
              "description": undefined,
              "errorMap": [Function],
              "typeName": "ZodNumber",
            },
            "and": [Function],
            "array": [Function],
            "brand": [Function],
            "catch": [Function],
            "default": [Function],
            "describe": [Function],
            "isNullable": [Function],
            "isOptional": [Function],
            "max": [Function],
            "min": [Function],
            "nullable": [Function],
            "nullish": [Function],
            "optional": [Function],
            "or": [Function],
            "parse": [Function],
            "parseAsync": [Function],
            "pipe": [Function],
            "promise": [Function],
            "refine": [Function],
            "refinement": [Function],
            "safeParse": [Function],
            "safeParseAsync": [Function],
            "spa": [Function],
            "step": [Function],
            "superRefine": [Function],
            "transform": [Function],
          },
        ],
        "rest": null,
        "typeName": "ZodTuple",
      }
    `);
    expect(schema.parse([
      '2021-10-10',
      '5'
    ])).toEqual([
      new Date('2021-10-10'),
      5
    ])
      
  });

  


});
