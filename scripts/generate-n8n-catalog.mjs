#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function isJsonFile(filePath) {
  return filePath.toLowerCase().endsWith(".json");
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }
    if (entry.isFile() && isJsonFile(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

function safeReadJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function extractIdFromFilename(filename) {
  const base = path.basename(filename, ".json");
  const m = base.match(/^(\d+)[_.-]/);
  if (m?.[1]) return m[1];
  const digits = base.match(/^(\d+)$/);
  if (digits?.[1]) return digits[1];
  return base;
}

function extractTriggers(workflowJson) {
  const nodes = Array.isArray(workflowJson?.nodes) ? workflowJson.nodes : [];
  const triggers = [];

  for (const node of nodes) {
    const type = typeof node?.type === "string" ? node.type : "";
    if (!type) continue;

    const typeLower = type.toLowerCase();
    const isTrigger =
      typeLower.includes("trigger") ||
      typeLower.includes("webhook") ||
      typeLower.includes("cron") ||
      typeLower.includes("schedule");

    if (!isTrigger) continue;

    triggers.push({
      name: typeof node?.name === "string" ? node.name : null,
      type,
      typeVersion: typeof node?.typeVersion === "number" ? node.typeVersion : null,
      parameters: node?.parameters && typeof node.parameters === "object" ? node.parameters : {},
    });
  }

  return triggers;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

const [workflowsRootArg, catalogRootArg] = process.argv.slice(2);
if (!workflowsRootArg || !catalogRootArg) {
  console.error("Usage: node generate-n8n-catalog.mjs <workflowsRoot> <catalogRoot>");
  process.exit(1);
}

const workflowsRoot = path.resolve(process.cwd(), workflowsRootArg);
const catalogRoot = path.resolve(process.cwd(), catalogRootArg);

if (!fs.existsSync(workflowsRoot)) {
  console.error(`Workflows root not found: ${workflowsRoot}`);
  process.exit(1);
}

const workflowFiles = walk(workflowsRoot);
const entries = [];

for (const filePath of workflowFiles) {
  const relPath = path.relative(process.cwd(), filePath).split(path.sep).join("/");
  const category = path.relative(workflowsRoot, filePath).split(path.sep)[0] || "unknown";
  const workflowJson = safeReadJson(filePath);

  const id = extractIdFromFilename(filePath);
  const titleFromJson = typeof workflowJson?.name === "string" ? workflowJson.name : null;
  const title = titleFromJson || path.basename(filePath, ".json");

  entries.push({
    id,
    title,
    category,
    triggers: workflowJson ? extractTriggers(workflowJson) : [],
    jsonPath: relPath,
  });
}

entries.sort((a, b) => {
  const ai = String(a.id);
  const bi = String(b.id);
  if (ai === bi) return a.jsonPath.localeCompare(b.jsonPath);
  return ai.localeCompare(bi);
});

const byCategory = new Map();
for (const e of entries) {
  const list = byCategory.get(e.category) ?? [];
  list.push(e);
  byCategory.set(e.category, list);
}

const index = {
  generatedAt: new Date().toISOString(),
  count: entries.length,
  workflows: entries,
};

writeJson(path.join(catalogRoot, "index.json"), index);

for (const [category, list] of byCategory.entries()) {
  writeJson(path.join(catalogRoot, "by-category", `${category}.json`), {
    generatedAt: index.generatedAt,
    category,
    count: list.length,
    workflows: list,
  });
}
