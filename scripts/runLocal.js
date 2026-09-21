import { spawn } from "child_process";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

dotenv.config({ path: resolve(projectRoot, ".env") });

const mongod = await MongoMemoryServer.create();
const mongoUri = mongod.getUri("student-performance");

process.env.MONGO_URI = mongoUri;
process.env.PORT = process.env.PORT || "5001";

console.log(`In-memory MongoDB: ${mongoUri}`);

const run = (command, args) =>
  new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: process.env,
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
      }
    });
  });

await run("node", ["scripts/seedAdmin.js"]);

const server = spawn("node", ["server.js"], {
  cwd: projectRoot,
  env: process.env,
  stdio: "inherit",
});

const shutdown = async () => {
  server.kill("SIGTERM");
  await mongod.stop();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.on("exit", async (code) => {
  await mongod.stop();
  process.exit(code ?? 0);
});
