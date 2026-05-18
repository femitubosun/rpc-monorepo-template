const { readFile, writeFile, rm } = require("fs/promises");
const { join } = require("path");
const glob = require("glob");

// Use __dirname to get the correct package directory
const currentDir = __dirname;

const names = [
  "InputJsonValueSchema",
  "JsonNullValueFilterSchema",
  "JsonNullValueInputSchema",
  "JsonValueSchema",
  "NullableJsonNullValueInputSchema",
];

async function handleFile(filePath) {
  // If the file name matches one of the names we want to remove, then delete the file
  if (names.some((name) => filePath.includes(name))) {
    await rm(filePath);
    return;
  }

  const fileContents = await readFile(filePath, "utf-8");

  const lines = fileContents.split("\n");

  const blocking = false;

  const newLines = [];

  for (const line of lines) {
    let push = true;
    // If a line includes one of the names, skip it
    if (names.some((name) => line.includes(name))) {
      push = false;
    }
    if (push && !blocking) {
      newLines.push(line);
    }
  }

  let text = newLines.join("\n");

  // replace all z.string().cuid() with z.string()
  text = text.replace(/z\.string\(\)\.cuid\(\)/g, "z.string()");

  // replace all jsonSchema references with z.any()
  text = text.replace(/jsonSchema/g, "z.any()");

  // zod v4: z.record() requires 2 args (keyType, valueType)
  // Replace z.record(z.any()) with z.record(z.string(), z.any())
  text = text.replace(/z\.record\(z\.any\(\)\)/g, "z.record(z.string(), z.any())");

  // Replace { Model }ModelSchema with { Model }Schema(remove "Model" suffix)
  text = text.replace(/(\w+)ModelSchema/g, "$1Schema");

  // Replace file contents with new lines
  await writeFile(filePath, text);
}

async function exportAllTypes() {
  // prisma-zod-generator creates its own index files, so we don't need to generate them
  // The new structure uses schemas/ and helpers/ directories
}

async function generateMainIndex() {
  // Generate the main index.ts file with sorted exports
  // Export from the new prisma-zod-generator structure
  const exports = [
    `export * from './schemas/models';`
  ].sort();

  const indexPath = join(currentDir, "src/index.ts");
  await writeFile(indexPath, exports.join("\n") + "\n");
}

async function main() {
  // Get every file in the src directory (recursively)
  const files = glob.sync(join(currentDir, "src", "**/*.ts"));

  // Handle each file
  for (const file of files) {
    await handleFile(file);
  }

  exportAllTypes();
  generateMainIndex();

  console.log(
    "✅ Processed and organized all prisma-defs files (formatting skipped for generated files)",
  );
}

main();
