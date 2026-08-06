#!/usr/bin/env node
/**
 * Levanta los 3 servicios de MercAldas en local.
 * Uso: node dev-all.js   (o: ./dev-all.js en bash)   —  Ctrl+C detiene todo.
 */
const { spawn } = require("node:child_process");
const path = require("node:path");

const ROOT = __dirname;

const SERVICES = [
  { name: "BACKEND", dir: "backend", url: "http://localhost:3000" },
  { name: "WEB", dir: "Interfaz web", url: "http://localhost:5173" },
  { name: "ADMIN", dir: "Interfaz admin web", url: "http://localhost:8443" },
];

const COLORS = {
  BACKEND: "\x1b[31m",
  WEB: "\x1b[32m",
  ADMIN: "\x1b[34m",
  RESET: "\x1b[0m",
};

const children = [];

function start(name, dir, url) {
  const cwd = path.join(ROOT, dir);
  const color = COLORS[name] || "";
  console.log(`${color}[${name}]${COLORS.RESET} ▶ ${url}  (cwd: ${cwd})`);

  const child = spawn("yarn", ["dev"], {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
    detached: process.platform !== "win32",
  });

  const prefix = `${color}[${name}]${COLORS.RESET} `;
  const pipe = (stream, out) => {
    stream.on("data", (chunk) => {
      chunk
        .toString()
        .split("\n")
        .forEach((line) => {
          if (line.trim()) out.write(prefix + line + "\n");
        });
    });
  };
  if (child.stdout) pipe(child.stdout, process.stdout);
  if (child.stderr) pipe(child.stderr, process.stderr);

  child.on("exit", (code, signal) => {
    console.log(`${prefix}terminó (${signal || code})`);
  });

  children.push(child);
}

SERVICES.forEach((s) => start(s.name, s.dir, s.url));
console.log("🌱 3 servicios levantados. Pulsa Ctrl+C para detener todos.");

function killAll() {
  console.log("\n⏹  Deteniendo servicios...");
  for (const child of children) {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
    } else {
      try {
        process.kill(-child.pid, "SIGTERM");
      } catch {
        try {
          child.kill("SIGTERM");
        } catch {
          /* ya terminó */
        }
      }
    }
  }
}

process.on("SIGINT", () => {
  killAll();
  process.exit(0);
});
process.on("SIGTERM", () => {
  killAll();
  process.exit(0);
});
