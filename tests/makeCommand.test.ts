import { z } from 'zod'
import { server } from 'zod-sdk/server'
import { makeServer } from './listen'

export const ZCurveDefinitionId = z.enum([
  'henryHubNymexLd',
  'wtiNymexApo',

  // ICE
  'brentIceCma',

  // OPIS
  'montBelvieuEthaneCma',
  'conwayButaneCma',
  'montBelvieuIsobutaneCma',
  'montBelvieuNaturalGasolineCma',
  'montBelvieuNaturalGasolineNonTetCma',

  // ??
  'llsArgusCma',
  'wtiFormulaBasisArgusTma',
  'wtiMidlandArgusTma',
  'socalCitygateCma',
  'socalBorderCma',
])

export type ICurveDefinitionId = z.infer<typeof ZCurveDefinitionId>

interface IProps {
  discriminator: ICurveDefinitionId
}

async function findMany(props?: IProps) {
  return props
}

findMany.parameters = z.tuple([
  z
    .object({
      discriminator: ZCurveDefinitionId,
    })
    .optional(),
])

const router = server.makeRouter({
  widgets: {
    findMany: server.makeCommand(findMany),
  },
})

describe('makeCommand', () => {
  it('server.makeCommand', async () => {
    await makeServer(router, async (url) => {
      const sdk = server.makeInterface<typeof router.routes>({
        baseUrl: url,
      })
      const result = await server.call(sdk.widgets.findMany, (procedure) =>
        procedure.command({
          discriminator: 'socalBorderCma',
        })
      )
      // Check the type on result
      expect(result).toMatchInlineSnapshot(`
        {
          "discriminator": "socalBorderCma",
        }
      `)
    })
  })
})
