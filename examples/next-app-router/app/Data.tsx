'use client'
import styles from './page.module.css'
import { useQuery, sdk } from 'zod-sdk/client'
import { IRoutes } from './routes'

const client = sdk.makeClient<IRoutes>({
  baseUrl: 'http://localhost:3000/api/sdk',
})

const date = new Date()

export function Data() {
  const { data } = useQuery(client.queries.hello, {
    fn: (hello) => hello(date),
  })

  return (
    <pre>
      <code className={styles.code}>{JSON.stringify(data, null, 2)}</code>
    </pre>
  )
}
