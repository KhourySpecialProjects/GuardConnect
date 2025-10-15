import { config } from "dotenv";

// load the env first
config({ path: "../.env", quiet: true });
config({ path: ".env", quiet: true });

// then start the rest of the server startup
await import("./index.js");
