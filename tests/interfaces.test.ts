import { CheckJson } from 'server/src/makeProcedure'

export interface IFindManyOrganizationsWhere {
  counterpartyId?: string
  legalEntityId?: string
  counterpartyToHedgerId?: string
}

interface IProps {
  // where?: IFindManyOrganizationsWhere
  userId?: string
}

async function findMany(props: IProps) {
  return props
}

describe('makeQuery', () => {
  it('server.makeQuery', async () => {
    let a: CheckJson<typeof findMany>
    a = 1
    expect(a).toBe(1)
  })
})
