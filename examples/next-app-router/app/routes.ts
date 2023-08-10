export const routes = {
  queries: {
    hello: async (date: Date) => ({
      hello: 'world',
      on: new Date(),
    }),
  },
}

export type IRoutes = typeof routes
