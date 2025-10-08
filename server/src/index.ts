import { publicProcedure, router } from './trpc.js';
import { createHTTPServer } from '@trpc/server/adapters/standalone';

const appRouter = router({
  userList: publicProcedure
    .query(async () => { 
    const result = "Hello World";
      return result;
    }),
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  router: appRouter,
});
 
server.listen(3000);