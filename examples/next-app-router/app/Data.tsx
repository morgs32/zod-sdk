'use client';
import styles from './page.module.css'
import { createClientSDK, useRPC } from 'zod-sdk'
import { IRoutes } from './routes'

const sdk = createClientSDK<IRoutes>({
  baseUrl: 'http://localhost:3000/api/sdk',
})

interface IProps {
  
}

export function Data(props: IProps) {

  const { data } = useRPC(sdk, {
    fn: sdk => sdk.queries.hello()
  })

  return (
    <pre>
      <code className={styles.code}>
        {JSON.stringify(data, null, 2)}
      </code>
    </pre>
  )

}