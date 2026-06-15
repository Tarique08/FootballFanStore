import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDirectory = path.join(process.cwd(), "data");

async function ensureDirectory() {
  await mkdir(dataDirectory, { recursive: true });
}

export async function readJsonFile<T>(fileName: string, fallback: T): Promise<T> {
  await ensureDirectory();
  const filePath = path.join(dataDirectory, fileName);

  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    await writeJsonFile(fileName, fallback);
    return fallback;
  }
}

export async function writeJsonFile<T>(fileName: string, value: T): Promise<void> {
  await ensureDirectory();
  const filePath = path.join(dataDirectory, fileName);
  await writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}
