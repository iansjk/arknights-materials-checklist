/* eslint-disable import/prefer-default-export */
import path from "path";
import { promises as fs } from "fs";
import slugify from "slugify";

const ACESHIP_BASEDIR = path.join(__dirname, "../aceship");
const ARKNIGHTS_DATA_BASEDIR = path.join(__dirname, "../ArknightsData");
const PUBLIC_IMAGE_DIR = path.join(__dirname, "..", "public", "images");

async function getCharacterNames(): Promise<Record<string, string>> {
  const characterData = await import(
    path.join(
      ARKNIGHTS_DATA_BASEDIR,
      "en-US",
      "gamedata",
      "excel",
      "character_table.json"
    )
  );
  return Object.fromEntries(
    Object.keys(characterData).map((id) => [id, characterData[id].name])
  );
}
const skillIconFilenameRegex = /skill_icon_(?<skillId>[^.]+)\.png/;
function newSkillIconFilename(oldFilename: string): string | null {
  const match = oldFilename.match(skillIconFilenameRegex);
  if (!match?.groups?.skillId) {
    return null;
  }
  return `${match.groups.skillId}.png`;
}

(async () => {
  const operatorLookup = await getCharacterNames();
  const avatarFilenameRegex = /(?<internalName>char_\d{3}_[a-z]+)(?:_(?<eliteLevel>[12])\+?)?\.png/;
  function newOperatorImageFilename(oldFilename: string): string | null {
    const match = oldFilename.match(avatarFilenameRegex);
    if (
      !match?.groups?.internalName ||
      !operatorLookup[match.groups.internalName]
    ) {
      return null;
    }
    const { eliteLevel } = match.groups;
    const operatorName = operatorLookup[match.groups.internalName];
    const newFilename = slugify(
      eliteLevel
        ? `${operatorName} elite ${eliteLevel}.png`
        : `${operatorName}.png`,
      { lower: true }
    );
    return newFilename;
  }

  const operatorImageTask = {
    sourceDir: path.join(ACESHIP_BASEDIR, "img", "avatars"),
    destinationDir: path.join(PUBLIC_IMAGE_DIR, "operators"),
    renameFn: newOperatorImageFilename,
  };
  const skillIconTask = {
    sourceDir: path.join(ACESHIP_BASEDIR, "img", "skills"),
    destinationDir: path.join(PUBLIC_IMAGE_DIR, "skills"),
    renameFn: newSkillIconFilename,
  };

  const tasks = [operatorImageTask, skillIconTask].map(async (task) => {
    const files = await fs.readdir(task.sourceDir);
    return Promise.all(
      files.map(async (filename) => {
        const newFilename = task.renameFn(filename);
        if (newFilename) {
          // use readFile, writeFile instead of copyFile to guarantee byte-by-byte equality
          // (otherwise git will think files will change on every script run)
          const buf = await fs.readFile(path.join(task.sourceDir, filename));
          fs.writeFile(path.join(task.destinationDir, newFilename), buf);
        }
      })
    );
  });
  await Promise.all(tasks);
})();