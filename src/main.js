import chalk from "chalk";
import fs from "fs";
import ncp from "ncp";
import { promisify } from "util";
import execa from "execa";
import Listr from "listr";
import path from "path";

const access = promisify(fs.access);
const copy = promisify(ncp);

const copyTemplateFiles = async (options) => {
  const createDirectory = await execa("mkdir", [options.name], {
    cwd: options.targetDirectory,
  });
  if (createDirectory.failed) {
    return Promise.reject(new Error("Failed to Create"));
  }
  await copy(
    options.templateDirectory,
    options.targetDirectory + "/" + options.name,
    {
      clobber: false,
    }
  );
  fs.rename(
    path.resolve(
      options.targetDirectory +
        "/" +
        options.name +
        "/" +
        options.selectedTemplate +
        ".cpp"
    ),
    path.resolve(
      options.targetDirectory +
        "/" +
        options.name +
        "/" +
        options.fileName +
        ".cpp"
    ),
    (err) => {
      if (err) console.log(chalk.red(err));
    }
  );
  return;
};

const initGit = async (options) => {
  const result = await execa("git", ["init"], {
    cwd: options.targetDirectory,
  });
  if (result.failed) {
    return Promise.reject(new Error("Failed to initialize Git"));
  }
  return;
};

export const createProject = async (options) => {
  options = {
    ...options,
    targetDirectory: process.cwd(),
  };

  const currentFileUrl = import.meta.url;

  const selectedTemplate =
    options.template.toLowerCase() ||
    (options.basic ? "basic" : options.college ? "college" : "competitive");
  options = {
    ...options,
    selectedTemplate,
  };

  const templateDir = decodeURI(
    path.resolve(__dirname, "../templates", selectedTemplate)
  );
  options.templateDirectory = templateDir;

  try {
    await access(templateDir, fs.constants.R_OK);
  } catch (err) {
    console.error(err, chalk.red.bold("ERROR"));
    process.exit(1);
  }

  const tasks = new Listr([
    {
      title: "Copy project files",
      task: () => copyTemplateFiles(options),
    },
    {
      title: "Initialize git",
      task: () => initGit(options),
      enabled: () => options.git,
    },
  ]);

  await tasks.run();

  console.log(`\n${chalk.cyanBright.bold("Success!")} Created template!`);

  console.log("\nWe suggest that you begin by typing:\n");
  console.log(`\t${chalk.cyan("cd")} ${options.name}`);
  console.log("\nHappy Hacking!");
  return true;
};
