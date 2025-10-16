import { TRPCError } from "@trpc/server";
import { policyEngine } from "../service/policy-engine.js";

export function requirePermission(permission: string) {
  return async ({ ctx, next }: { ctx: any; next: any }) => {
    if(permission.length == 0) {
      return next();
    }
    const userId = ctx?.user?.id ?? ctx?.userId;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "No user in context" });
    }

    const allowed = await policyEngine.validate(userId, permission) ?? false;
    if (!allowed) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permission" });
    }
    return next();
  };
}