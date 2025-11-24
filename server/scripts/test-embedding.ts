import { embeddingService } from "../src/service/embedding-service.js";
import readline from "node:readline";


async function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    }),
  );
}

async function main() {
  try {
    const input: string =
      process.argv.slice(2).join(" ") ||
      (await ask("Enter text to embed: "));

    console.log("\nEmbedding text:", `"${input}"`);
    console.log("Calling Titan...");

    const vector: number[] = await embeddingService.embed(input);

    console.log("\nEmbedding (length", vector.length + "):");
    console.log("First 10 values:", vector.slice(0, 10));
    console.log("Full vector:", vector);
    console.log();
  } catch (err) {
    // try to detect common AWS access errors and output helpful guidance
    console.error("❌ Error:", err);

    try {
      // some AWS SDK errors include $fault / $metadata etc. Check for 403 / explicit deny hints
      const e = err as any;

      const code = e?.name || e?.Code || e?.code;
      const message = e?.message || e?.Message || String(e);
      const status = e?.$metadata?.httpStatusCode || e?.statusCode;

      if (status === 403 || /AccessDenied|AccessDeniedException/i.test(code) || /explicit deny/i.test(message)) {
        console.error("\nIt looks like a permissions error (AccessDenied / explicit deny).");
        console.error("This is commonly caused by an AWS Organizations Service Control Policy (SCP) or an IAM permission/permission boundary that explicitly denies the 'bedrock:InvokeModel' action.");
      }
    } catch (inner) {
      // silence any diagnostic failure — continue to propagate the original error data
      /* noop */
    }
  }
}

main();
