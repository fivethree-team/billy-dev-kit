import { ParamOptions, isString, isBoolean } from "@fivethree/billy-core";

export const projectOptions: ParamOptions = {
  name: "project",
  description:
    "What do you want to build? [core, core_plugin, cli, plugin, app]"
};
export const versionOptions: ParamOptions = {
  name: "version",
  description: "Please enter the version [XXX.XXX.XXX]"
};
export const messageOptions: ParamOptions = {
  name: "message",
  description: "Please enter commit message.",
  validators: [isString]
};

export const dirtyOptions: ParamOptions = {
  name: "dirty",
  description: "",
  optional: true,
  validators: [isBoolean]
};
