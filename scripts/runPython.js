import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

import { getPythonBin } from "../utils/pythonBin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const script = process.argv[2];

if (!script) {
  console.error("Usage: node scripts/runPython.js <script>");
  process.exit(1);
}

const child = spawn(getPythonBin(), [path.resolve(projectRoot, script)], {
  cwd: projectRoot,
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
