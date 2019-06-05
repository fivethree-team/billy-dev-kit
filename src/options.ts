import { ParamOptions } from "@fivethree/billy-core";

export const projectOptions: ParamOptions = {
    name: 'project',
    description: 'What do you want to build? [core, core_plugin, cli, plugin, app]',
}
export const versionOptions: ParamOptions = {
    name: 'version',
    description: 'Please enter the version [XXX.XXX.XXX]'
}

export const dirtyOptions: ParamOptions = {
    name: 'dirty',
    description: '',
    optional: true
}