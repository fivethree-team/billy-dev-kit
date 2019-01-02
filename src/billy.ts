import { App, Lane, LaneContext } from "@fivethree/billy-core";

@App()
export class DevKit {

    @Lane('release a billy version')
    async release(context: LaneContext) {
        const { print, parseJSON, prompt, writeJSON, app, core,
            core_plugin, cli, exampleApp, plugin, publish,
            gitClean, bump, push_to_remote } = context;
        print('reading config file...⌛')
        const config = parseJSON(app.appDir + '/..' + '/config/config.json');

        const status: any = {};
        status.core = await gitClean(config.core);
        status.core_plugin = await gitClean(config.core_plugin);
        status.cli = await gitClean(config.cli);
        status.plugin = await gitClean(config.plugin);
        status.app = await gitClean(config.app);

        if (!(status.core && status.core_plugin && status.cli && status.plugin && status.app)) {
            print('git status not clean:')
            print(status);
            console.error('please push all your local changes before release!')
            return;
        }
        const coreC = parseJSON(config.core + '/package.json');
        const core_pluginC = parseJSON(config.core_plugin + '/package.json');
        const cliC = parseJSON(config.cli + '/package.json');
        const pluginC = parseJSON(config.plugin + '/package.json');
        const appC = parseJSON(config.app + '/package.json');

        const version = await prompt(`enter version  | current: ${coreC.version}`);
        if (version) {
            print('starting release! 🚀')

            coreC.version = version;
            writeJSON(config.core + '/package.json', coreC);
            await core(context);
            await publish(context, version, 'core');

            core_pluginC.version = version;
            core_pluginC.devDependencies['@fivethree/billy-core'] = version;
            writeJSON(config.core_plugin + '/package.json', core_pluginC);
            await core_plugin(context);
            await publish(context, version, 'core_plugin');

            cliC.version = version;
            cliC.dependencies['@fivethree/billy-core'] = version;
            cliC.dependencies['@fivethree/billy-plugin-core'] = version;
            writeJSON(config.cli + '/package.json', cliC);
            await cli(context);
            await publish(context, version, 'cli');

            pluginC.version = version;
            pluginC.devDependencies['@fivethree/billy-core'] = version;
            writeJSON(config.plugin + '/package.json', pluginC);
            await plugin(context);
            await publish(context, version, 'plugin');

            appC.version = version;
            appC.dependencies['@fivethree/billy-core'] = version;
            appC.dependencies['@fivethree/billy-plugin-core'] = version;
            writeJSON(config.app + '/package.json', appC);
            await exampleApp(context);
            await publish(context, version, 'app');

            print(`Done publishing version ${version}! ✅`)


        } else {
            print('no version specified');
        }
    }

    @Lane('setup development environment')
    async setup(context: LaneContext) {
        const { print, parseJSON, writeJSON, app, core, core_plugin, exampleApp, cli, plugin } = context;
        print('reading config file...⌛')
        const config = parseJSON(app.appDir + '/..' + '/config/config.json');

        const core_pluginC = parseJSON(config.core_plugin + '/package.json');
        const cliC = parseJSON(config.cli + '/package.json');
        const pluginC = parseJSON(config.plugin + '/package.json');
        const appC = parseJSON(config.app + '/package.json');

        print('setup dependencies... ⏳')
        core_pluginC.devDependencies['@fivethree/billy-core'] = `file:${config.core}`;
        cliC.dependencies['@fivethree/billy-core'] = `file:${config.core}`;
        cliC.dependencies['@fivethree/billy-plugin-core'] = `file:${config.core_plugin}`;
        pluginC.devDependencies['@fivethree/billy-core'] = `file:${config.core}`;
        appC.dependencies['@fivethree/billy-core'] = `file:${config.core}`;
        appC.dependencies['@fivethree/billy-plugin-core'] = `file:${config.core_plugin}`;
        writeJSON(config.core_plugin + '/package.json', core_pluginC);
        writeJSON(config.cli + '/package.json', cliC);
        writeJSON(config.plugin + '/package.json', pluginC);
        writeJSON(config.app + '/package.json', appC);

        await core(context)

        await core_plugin(context)

        await cli(context)

        await plugin(context)

        await exampleApp(context)

        print(`Setup done! ✅`)
    }

    @Lane('build')
    async build({ print, exec, parseJSON, app, prompt }, project?: string) {
        const repo = project ? project : await prompt('What do you want to build? [core, core_plugin, cli, plugin, app]')
        const config = parseJSON(app.appDir + '/..' + '/config/config.json');

        print(`building ${repo} ... ⏳`)
        await exec(`rm -rf ${config[repo]}/node_modules ${config[repo]}/package-lock.json`)
        await exec(`npm install --prefix ${config[repo]}`)
        await exec(`${config[repo]}/node_modules/.bin/tsc -p ${config[repo]}`)
        print(`successfully build ${repo}🎉`)
    }

    @Lane('publish')
    async publish({ exec, parseJSON, app, prompt, bump, push_to_remote }, version: string, project?: string) {
        const repo = project ? project : await prompt('What do you want to publish? [core, core_plugin, cli, plugin, app]')
        const config = parseJSON(app.appDir + '/..' + '/config/config.json');
        await exec(`npm publish ${config[repo]}`);
        await bump(version, `publish and release ${version}`, config[repo]);
        await push_to_remote(config[repo], 'origin', 'master');
    }

    @Lane('rebuild core')
    async core(context) {
        const { build } = context;
        await build(context, 'core');
    }

    @Lane('rebuild core plugin')
    async core_plugin(context) {
        const { build } = context;
        await build(context, 'core_plugin');
    }

    @Lane('rebuild cli')
    async cli(context) {
        const { build } = context;
        await build(context, 'cli');
    }

    @Lane('rebuild app')
    async exampleApp(context) {
        const { build } = context;
        await build(context, 'app');
    }

    @Lane('rebuild plugin')
    async plugin(context) {
        const { build } = context;
        await build(context, 'plugin');
    }
}
