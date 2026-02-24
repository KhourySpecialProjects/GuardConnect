import type { db } from "./sql.js";

export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
