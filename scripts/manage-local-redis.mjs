import { spawnSync } from "node:child_process";

const command = process.argv[2] ?? "start";
const containerName = "gym-redis";
const image = "redis:7-alpine";
const port = "6379:6379";

function runDocker(args, options = {}) {
  return spawnSync("docker", args, {
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
  });
}

function ensureDockerAvailable() {
  const result = runDocker(["version"], { capture: true });

  if (result.error || result.status !== 0) {
    const details =
      result.error?.message ??
      result.stderr?.trim() ??
      "Docker Desktop no esta disponible en esta terminal.";
    throw new Error(details);
  }
}

function inspectContainer() {
  const result = runDocker(["container", "inspect", containerName], { capture: true });

  if (result.status !== 0) {
    return { exists: false, running: false };
  }

  const payload = JSON.parse(result.stdout);
  const firstContainer = Array.isArray(payload) ? payload[0] : null;

  return {
    exists: true,
    running: Boolean(firstContainer?.State?.Running),
  };
}

function createContainer() {
  const result = runDocker(["run", "-d", "--name", containerName, "-p", port, image]);

  if (result.status !== 0) {
    throw new Error("No se pudo crear el contenedor local de Redis.");
  }
}

function startContainer() {
  const result = runDocker(["start", containerName]);

  if (result.status !== 0) {
    throw new Error("No se pudo arrancar el contenedor local de Redis.");
  }
}

function removeContainer() {
  const result = runDocker(["rm", "-f", containerName]);

  if (result.status !== 0) {
    throw new Error("No se pudo eliminar el contenedor local de Redis.");
  }
}

function printStatus() {
  const status = inspectContainer();

  if (!status.exists) {
    console.log(`Redis local no existe. Crea uno con: npm run dev:redis`);
    return;
  }

  console.log(
    status.running
      ? `Redis local esta corriendo en localhost:6379`
      : `Redis local existe pero esta parado. Arrancalo con: npm run dev:redis`,
  );
}

try {
  ensureDockerAvailable();

  if (command === "status") {
    printStatus();
    process.exit(0);
  }

  if (command === "reset") {
    const current = inspectContainer();

    if (current.exists) {
      removeContainer();
    }

    createContainer();
    console.log(`Redis local recreado en localhost:6379`);
    process.exit(0);
  }

  if (command === "start") {
    const current = inspectContainer();

    if (!current.exists) {
      createContainer();
      console.log(`Redis local creado y arrancado en localhost:6379`);
      process.exit(0);
    }

    if (!current.running) {
      startContainer();
      console.log(`Redis local arrancado en localhost:6379`);
      process.exit(0);
    }

    console.log(`Redis local ya estaba corriendo en localhost:6379`);
    process.exit(0);
  }

  throw new Error(`Comando no soportado: ${command}`);
} catch (error) {
  const message = error instanceof Error ? error.message : "Error desconocido.";
  console.error(`Redis local: ${message}`);
  process.exit(1);
}
