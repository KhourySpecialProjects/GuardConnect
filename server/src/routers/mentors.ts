import { procedure, router } from "../trpc/trpc.js";
import log from "../utils/logger.js";

export const mentorRouter = router({
  getMentors: procedure.query(() => {
    log.info("getMentors");
    return ["Alice", "Bob"];
  }),
});
