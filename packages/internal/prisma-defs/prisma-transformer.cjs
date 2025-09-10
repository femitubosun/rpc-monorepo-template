const { readFile, writeFile, rm } = require("fs/promises");
const { join } = require("path");
const glob = require("glob");

// Use __dirname to get the correct package directory
const currentDir = __dirname;

// Individual file formatting removed - we'll format all files at once at the end
function formatWithBiome(filePath) {
  // No-op - formatting handled in bulk at the end
}

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

  // Replace file contents with new lines
  await writeFile(filePath, text);
  formatWithBiome(filePath);
}

async function exportAllTypes() {
  // Generate index.ts for inputTypeSchemas
  const inputFiles = glob.sync(
    join(currentDir, "src/inputTypeSchemas", "*.ts"),
  );
  const inputLines = [];

  for (const file of inputFiles) {
    if (file.includes("index.ts")) continue;

    const fileName = file.split("/").pop().split(".")[0];
    inputLines.push(`export * from './${fileName}';`);
  }

  inputLines.sort();
  const inputIndexPath = join(currentDir, "src/inputTypeSchemas/index.ts");
  await writeFile(inputIndexPath, inputLines.join("\n") + "\n");
  formatWithBiome(inputIndexPath);

  // Generate index.ts for modelSchema
  const modelFiles = glob.sync(join(currentDir, "src/modelSchema", "*.ts"));
  const modelLines = [];

  for (const file of modelFiles) {
    if (file.includes("index.ts")) continue;

    const fileName = file.split("/").pop().split(".")[0];
    modelLines.push(`export * from './${fileName}';`);
  }

  modelLines.sort();
  const modelIndexPath = join(currentDir, "src/modelSchema/index.ts");
  await writeFile(modelIndexPath, modelLines.join("\n") + "\n");
  formatWithBiome(modelIndexPath);
}

async function generateMainIndex() {
  // Generate the main index.ts file with sorted exports
  const exports = [
    `export * from './inputTypeSchemas';`,
    `export * from './modelSchema';`,
  ].sort();

  const indexPath = join(currentDir, "src/index.ts");
  await writeFile(indexPath, exports.join("\n") + "\n");
  formatWithBiome(indexPath);
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
