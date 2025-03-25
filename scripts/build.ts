#!/usr/bin/env bun
/**
 * Script to combine prompt files and generate .clinerules
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const RULES_DIR = join(__dirname, "../.cline/rules");
const ROO_MODES_DIR = join(__dirname, "../.cline/roomodes");
const OUTPUT_FILE = join(__dirname, "../.clinerules");

function parseFrontMatter(content: string): [Record<string, unknown>, string] {
  const frontMatter = content.match(/^---\n([\s\S]+?)\n---\n/);
  if (!frontMatter || !frontMatter[1]) {
    return [{}, content];
  }
  const parsed = yaml.load(frontMatter[1]) as Record<string, unknown>;
  return [parsed, content.replace(frontMatter[0], "")];
}

type RooMode = {
  slug: string;
  name: string;
  roleDefinition: string;
  groups: string[];
};

async function main() {
  const roomodes: { customModes: Array<RooMode> } = {
    customModes: [],
  };

  if (existsSync(ROO_MODES_DIR)) {
    const modeFiles = readdirSync(ROO_MODES_DIR);

    for (const file of modeFiles) {
      const content = readFileSync(join(ROO_MODES_DIR, file), "utf-8");
      const slug = file.replace(".md", "");
      const [frontMatter, body] = parseFrontMatter(content);
      const results: RooMode = {
        ...(frontMatter as Record<string, unknown>),
        slug,
        name: (frontMatter.name as string) || slug,
        roleDefinition: body,
        groups: (frontMatter.groups as string[]) || [],
      };
      roomodes.customModes.push(results);
    }
  }

  try {
    // Load prompt files
    const files: string[] = [];
    const entries = readdirSync(RULES_DIR);
    for (const entry of entries) {
      const stat = statSync(join(RULES_DIR, entry));
      if (stat.isFile() && entry.endsWith(".md") && !entry.startsWith("_")) {
        files.push(entry);
      }
    }

    // Sort by filename
    files.sort();

    // Combine contents of each file
    const contents: string[] = [];
    for (const file of files) {
      const content = readFileSync(`${RULES_DIR}/${file}`, "utf-8");
      contents.push(content);
    }

    // Write to .clinerules
    const result = contents.join("\n\n");
    writeFileSync(join(__dirname, "../.roomodes"), JSON.stringify(roomodes, null, 2));
    console.log(`Generated .roomodes from ${roomodes.customModes.length} mode files`);

    writeFileSync(OUTPUT_FILE, result);
    console.log(`Generated ${OUTPUT_FILE} from ${files.length} prompt files`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
    process.exit(1);
  }
}

// Run the main function
main();
