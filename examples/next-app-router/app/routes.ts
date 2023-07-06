
export const routes = {
  queries: {
    hello: async () => ({
      hello: 'world',
      on: new Date(),
    }),
  }
}

export type IRoutes = typeof routes