import { commsRouter } from "../routers/comms.js";
import { filesRouter } from "../routers/files.js";
import { mentorRouter } from "../routers/mentors.js";
import { menteeRouter } from "../routers/mentees.js";
import { reportsRouter } from "../routers/reports.js";
import { searchRouter } from "../routers/search.js";
import { userRouter } from "../routers/users.js";
import { router } from "./trpc.js";

export const appRouter = router({
  comms: commsRouter,
  mentor: mentorRouter,
  mentee: menteeRouter,
  reports: reportsRouter,
  user: userRouter,
  files: filesRouter,
  search: searchRouter,
});

export type AppRouter = typeof appRouter;
