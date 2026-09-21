import { spawnSync } from "child_process";

let cached;

const resolvePythonBin = () => {
  if (process.env.PYTHON) {
    return process.env.PYTHON;
  }

  for (const command of ["python3", "python"]) {
    const result = spawnSync(command, ["--version"], { encoding: "utf8" });
    if (result.status === 0) {
      return command;
    }
  }

  return "python3";
};

export const getPythonBin = () => {
  if (!cached) {
    cached = resolvePythonBin();
  }
  return cached;
};
