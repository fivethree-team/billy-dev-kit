#!/usr/bin/env node
import {
    App, Command, Context, param, context, usesPlugins,
    Hook, afterAll, Job, every
} from "@fivethree/billy-core";
import { CorePlugin } from '@fivethree/billy-plugin-core';
import { dirtyOptions, projectOptions, versionOptions } from "./options";


export interface DevKit extends CorePlugin { }

@App({
    allowUnknownOptions: false
})
export class DevKit {
    @usesPlugins(CorePlugin)

    @Command('release a billy version')
    async release(@context() context: Context, @param(dirtyOptions) dirty: boolean = false) {
        await this.print('reading config file...⌛')
        const config = await this.parseJSON(context.directory + '/src/config/config.json');

        const status: any = {};
        status.core = await this.git_porcelain(config.core);
        status.core_plugin = await this.git_porcelain(config.core_plugin);
        status.cli = await this.git_porcelain(config.cli);
        status.plugin = await this.git_porcelain(config.plugin);
        status.app = await this.git_porcelain(config.app);

        if (!dirty && !(status.core && status.core_plugin && status.cli && status.plugin && status.app)) {
            await this.print('git status not clean:')
            await this.print(status);
            console.error('please push all your local changes before release!')
            return;
        }
        const coreC = await this.parseJSON(config.core + '/package.json');
        const core_pluginC = await this.parseJSON(config.core_plugin + '/package.json');
        const cliC = await this.parseJSON(config.cli + '/package.json');
        const pluginC = await this.parseJSON(config.plugin + '/package.json');
        const appC = await this.parseJSON(config.app + '/package.json');

        const version = await this.prompt(`enter version  | current: ${coreC.version}`);
        if (version) {
            await this.print('starting release! 🚀')

            coreC.version = version;
            await this.writeJSON(config.core + '/package.json', coreC);
            await this.core(context);
            await this.publish(context, version, 'core');

            core_pluginC.version = version;
            core_pluginC.devDependencies['@fivethree/billy-core'] = version;
            await this.writeJSON(config.core_plugin + '/package.json', core_pluginC);
            await this.core_plugin(context);
            await this.publish(context, version, 'core_plugin');

            cliC.version = version;
            cliC.dependencies['@fivethree/billy-core'] = version;
            cliC.dependencies['@fivethree/billy-plugin-core'] = version;
            await this.writeJSON(config.cli + '/package.json', cliC);
            await this.cli(context);
            await this.publish(context, version, 'cli');

            pluginC.version = version;
            pluginC.devDependencies['@fivethree/billy-core'] = version;
            await this.writeJSON(config.plugin + '/package.json', pluginC);
            await this.plugin(context);
            await this.publish(context, version, 'plugin');

            appC.version = version;
            appC.dependencies['@fivethree/billy-core'] = version;
            appC.dependencies['@fivethree/billy-plugin-core'] = version;
            await this.writeJSON(config.app + '/package.json', appC);
            await this.exampleApp(context);
            await this.publish(context, version, 'app');

            await this.print(`Done publishing version ${version}! ✅`)


        } else {
            await this.print('no version specified');
        }
    }

    @Command('build and commit local changes')
    async commitAll(@context() context: Context) {

        await this.print('reading config file...⌛')
        const config = await this.parseJSON(context.directory + '/src/config/config.json');

        const type = await this.prompt('enter commit type | type(scope): message');
        const scope = await this.prompt('enter commit scope | type(scope): message');
        const message = await this.prompt('enter commit message | type(scope): message');
        await this.git_commit(`${type}(${scope}): ${message}`, config.core);
        await this.git_commit(`${type}(${scope}): ${message}`, config.core_plugin);
        await this.git_commit(`${type}(${scope}): ${message}`, config.cli);
        await this.git_commit(`${type}(${scope}): ${message}`, config.plugin);
        await this.git_commit(`${type}(${scope}): ${message}`, config.app);

        await this.print(`Done commiting`);

    }

    @Command('build and commit local changes')
    async pushAll(@context() context: Context) {

        await this.print('reading config file...⌛')
        const config = await this.parseJSON(context.directory + '/src/config/config.json');
        console.log('CONFIG', config);
        await this.git_push(config.core);
        await this.git_push(config.core_plugin);
        await this.git_push(config.cli);
        await this.git_push(config.plugin);
        await this.git_push(config.app);

    }

    @Command('setup development environment')
    async setup(@context() context: Context) {
        this.print('reading config file...⌛')
        const config = await this.parseJSON(context.directory + '/src/config/config.json');
        const core_pluginC = await this.parseJSON(config.core_plugin + '/package.json');
        const cliC = await this.parseJSON(config.cli + '/package.json');
        const pluginC = await this.parseJSON(config.plugin + '/package.json');
        const appC = await this.parseJSON(config.app + '/package.json');

        this.print('setup dependencies... ⏳')
        core_pluginC.devDependencies['@fivethree/billy-core'] = `file:${config.core}`;
        cliC.dependencies['@fivethree/billy-core'] = `file:${config.core}`;
        cliC.dependencies['@fivethree/billy-plugin-core'] = `file:${config.core_plugin}`;
        pluginC.devDependencies['@fivethree/billy-core'] = `file:${config.core}`;
        appC.dependencies['@fivethree/billy-core'] = `file:${config.core}`;
        appC.dependencies['@fivethree/billy-plugin-core'] = `file:${config.core_plugin}`;
        await this.writeJSON(config.core_plugin + '/package.json', core_pluginC);
        await this.writeJSON(config.cli + '/package.json', cliC);
        await this.writeJSON(config.plugin + '/package.json', pluginC);
        await this.writeJSON(config.app + '/package.json', appC);

        await this.core(context)

        await this.core_plugin(context)

        await this.cli(context)

        await this.plugin(context)

        await this.exampleApp(context)

        await this.print(`Setup done! ✅`)
    }

    @Command('build')
    async build(@context() context: Context, @param(projectOptions) project: string, @param(dirtyOptions) dirty: boolean) {
        console.log('build project', project);
        const config = await this.parseJSON(context.directory + '/src/config/config.json');

        await this.print(`building ${project} ... ⏳`)
        if (!dirty) {
            await this.exec(`rm -rf ${config[project]}/node_modules ${config[project]}/package-lock.json`)
            await this.exec(`npm install --prefix ${config[project]}`)
        }
        await this.exec(`${config[project]}/node_modules/.bin/tsc -p ${config[project]}`)
        await this.print(`successfully build ${project}🎉`)
    }

    @Command('publish')
    async publish(@context() context: Context, @param(versionOptions) version: string, @param(projectOptions) project: string) {
        const config = await this.parseJSON(context.directory + '/src/config/config.json');
        await this.exec(`npm publish ${config[project]}`);
        await this.bump(version, `publish and release ${version}`, config[project]);
        await this.git_push(config[project], 'origin', 'master');
    }

    @Command('rebuild core')
    async core(@context() context: Context, @param(dirtyOptions) dirty?: boolean) {

        await this.build(context, 'core', dirty);
    }

    @Command('rebuild core plugin')
    async core_plugin(@context() context: Context, @param(dirtyOptions) dirty?: boolean) {
        await this.build(context, 'core_plugin', dirty);
    }

    @Command('rebuild cli')
    async cli(@context() context: Context, @param(dirtyOptions) dirty?: boolean) {
        await this.build(context, 'cli', dirty);
    }

    @Command('rebuild app')
    async exampleApp(@context() context: Context, @param(dirtyOptions) dirty?: boolean) {
        await this.build(context, 'app', dirty);
    }

    @Command('rebuild plugin')
    async plugin(@context() context: Context, @param(dirtyOptions) dirty?: boolean) {
        await this.build(context, 'plugin', dirty);
    }

    @Hook(afterAll)
    async hooks(@context() context: Context) {
        context.api.printHistory();
    }

    // @Hook(beforeEach)
    // @Hook(afterEach)
    // @Hook(beforeAll)
    // @Hook(onStart)
    async hookTests(@context() context: Context) {
        console.log(context.description);
    }

    @Command({
        alias: 'test',
        description: 'testlane'
    })
    @Job(every(10).seconds)
    async testlane(@param(dirtyOptions) dirty?: boolean) {
    }

}
