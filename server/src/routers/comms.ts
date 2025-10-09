import { procedure, router } from "../trpc/trpc.js";
import log from "../utils/logger.js";

export const commsRouter = router({
  ping: procedure.query(() => {
    log.info("ping");
    return "pong from comms";
  }),
});
