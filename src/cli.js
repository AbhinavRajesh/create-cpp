import arg from "arg";
import inquirer from "inquirer";
import { createProject } from "./main";

const parseArgumentsIntoOptions = (rawArgs) => {
  const args = arg(
    {
      "--basic": Boolean,
      "--comp": Boolean,
      "--college": Boolean,
      "--git": Boolean,
      "-b": "--basic",
      "-cp": "--comp",
      "-c": "--college",
      "-g": "--git",
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    basic: args["--basic"] || false,
    comp: args["--comp"] || false,
    college: args["--college"] || false,
    git: args["--git"] || false,
    name: args._[0],
  };
};

const promptForMissingOptions = async (options) => {
  const defaultTemplate = "basic";
  const questions = [];
  if (!options.basic && !options.college && !options.comp) {
    questions.push({
      type: "list",
      name: "template",
      message: "Please choose which project template to use",
      choices: ["Basic", "College", "Competitive"],
      default: defaultTemplate,
    });
  }

  if (!options.git) {
    questions.push({
      type: "confirm",
      name: "git",
      message: "Initialize a git repository?",
      default: false,
    });
  }

  if (
    [options.college, options.comp, options.basic].filter(Boolean).length > 1
  ) {
    questions.push({
      type: "list",
      name: "template",
      message: "Please choose only one template to use",
      choices: ["Basic", "College", "Competitive"],
      default: defaultTemplate,
    });
  }

  questions.push({
    type: "input",
    name: "fileName",
    message: "Enter the name of the program file",
  });

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    template: options.template || answers.template,
    fileName: answers.fileName,
    git: options.git || answers.git,
  };
};

export const cli = async (args) => {
  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  await createProject(options);
};
