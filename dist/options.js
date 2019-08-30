"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const billy_core_1 = require("@fivethree/billy-core");
exports.projectOptions = {
    name: "project",
    description: "What do you want to build? [core, core_plugin, cli, plugin, app]"
};
exports.versionOptions = {
    name: "version",
    description: "Please enter the version [XXX.XXX.XXX]"
};
exports.messageOptions = {
    name: "message",
    description: "Please enter commit message.",
    validators: [billy_core_1.isString]
};
exports.dirtyOptions = {
    name: "dirty",
    description: "",
    optional: true,
    validators: [billy_core_1.isBoolean]
};
