import { App, Lane, LaneContext, param, context, ParamOptions } from "@fivethree/billy-core";
import { Application } from "./generated/application";

const projectOptions: ParamOptions = {
    name: 'project',
    description: 'What do you want to build? [core, core_plugin, cli, plugin, app]',
}
const versionOptions: ParamOptions = {
    name: 'versionCode',
    description: 'Please enter the version [XXX.XXX.XXX]'
}

@App()
export class DevKit extends Application {

    @Lane('release a billy version')
    async release(@context() context: LaneContext) {

        this.print('reading config file...⌛')
        const config = this.parseJSON(context.directory + '/config/config.json');

        const status: any = {};
        status.core = await this.gitClean(config.core);
        status.core_plugin = await this.gitClean(config.core_plugin);
        status.cli = await this.gitClean(config.cli);
        status.plugin = await this.gitClean(config.plugin);
        status.app = await this.gitClean(config.app);

        if (!(status.core && status.core_plugin && status.cli && status.plugin && status.app)) {
            this.print('git status not clean:')
            this.print(status);
            console.error('please push all your local changes before release!')
            return;
        }
        const coreC = this.parseJSON(config.core + '/package.json');
        const core_pluginC = this.parseJSON(config.core_plugin + '/package.json');
        const cliC = this.parseJSON(config.cli + '/package.json');
        const pluginC = this.parseJSON(config.plugin + '/package.json');
        const appC = this.parseJSON(config.app + '/package.json');

        const version = await this.prompt(`enter version  | current: ${coreC.version}`);
        if (version) {
            this.print('starting release! 🚀')

            coreC.version = version;
            this.writeJSON(config.core + '/package.json', coreC);
            await this.core(context);
            await this.publish(context, version, 'core');

            core_pluginC.version = version;
            core_pluginC.devDependencies['@fivethree/billy-core'] = version;
            this.writeJSON(config.core_plugin + '/package.json', core_pluginC);
            await this.core_plugin(context);
            await this.publish(context, version, 'core_plugin');

            cliC.version = version;
            cliC.dependencies['@fivethree/billy-core'] = version;
            cliC.dependencies['@fivethree/billy-plugin-core'] = version;
            this.writeJSON(config.cli + '/package.json', cliC);
            await this.cli(context);
            await this.publish(context, version, 'cli');

            pluginC.version = version;
            pluginC.devDependencies['@fivethree/billy-core'] = version;
            this.writeJSON(config.plugin + '/package.json', pluginC);
            await this.plugin(context);
            await this.publish(context, version, 'plugin');

            appC.version = version;
            appC.dependencies['@fivethree/billy-core'] = version;
            appC.dependencies['@fivethree/billy-plugin-core'] = version;
            this.writeJSON(config.app + '/package.json', appC);
            await this.exampleApp(context);
            await this.publish(context, version, 'app');

            this.print(`Done publishing version ${version}! ✅`)


        } else {
            this.print('no version specified');
        }
    }

    @Lane('build and commit local changes')
    async commitAll(@context() context: LaneContext) {

        this.print('reading config file...⌛')
        const config = this.parseJSON(context.directory + '/config/config.json');

        const type = await this.prompt('enter commit type | type(scope): message');
        const scope = await this.prompt('enter commit scope | type(scope): message');
        const message = await this.prompt('enter commit message | type(scope): message');
        await this.commit(type, scope, message, config.core);
        await this.commit(type, scope, message, config.core_plugin);
        await this.commit(type, scope, message, config.cli);
        await this.commit(type, scope, message, config.plugin);
        await this.commit(type, scope, message, config.app);

        this.print(`Done commiting`);

    }

    @Lane('build and commit local changes')
    async pushAll(@context() context: LaneContext) {

        this.print('reading config file...⌛')
        const config = this.parseJSON(context.directory + '/config/config.json');

        this.push(config.core);
        this.push(config.core_plugin);
        this.push(config.cli);
        this.push(config.plugin);
        this.push(config.app);

    }

    @Lane('setup development environment')
    async setup(@context() context: LaneContext) {
        this.print('reading config file...⌛')
        const config = this.parseJSON(context.directory + '/config/config.json');
        const core_pluginC = this.parseJSON(config.core_plugin + '/package.json');
        const cliC = this.parseJSON(config.cli + '/package.json');
        const pluginC = this.parseJSON(config.plugin + '/package.json');
        const appC = this.parseJSON(config.app + '/package.json');

        this.print('setup dependencies... ⏳')
        core_pluginC.devDependencies['@fivethree/billy-core'] = `file:${config.core}`;
        cliC.dependencies['@fivethree/billy-core'] = `file:${config.core}`;
        cliC.dependencies['@fivethree/billy-plugin-core'] = `file:${config.core_plugin}`;
        pluginC.devDependencies['@fivethree/billy-core'] = `file:${config.core}`;
        appC.dependencies['@fivethree/billy-core'] = `file:${config.core}`;
        appC.dependencies['@fivethree/billy-plugin-core'] = `file:${config.core_plugin}`;
        this.writeJSON(config.core_plugin + '/package.json', core_pluginC);
        this.writeJSON(config.cli + '/package.json', cliC);
        this.writeJSON(config.plugin + '/package.json', pluginC);
        this.writeJSON(config.app + '/package.json', appC);

        await this.core(context)

        await this.core_plugin(context)

        await this.cli(context)

        await this.plugin(context)

        await this.exampleApp(context)

        this.print(`Setup done! ✅`)
    }

    @Lane('build')
    async build(@context() context: LaneContext, @param(projectOptions) project: string) {
        console.log('build project', project);
        const config = this.parseJSON(context.directory + '/config/config.json');

        this.print(`building ${project} ... ⏳`)
        await this.exec(`rm -rf ${config[project]}/node_modules ${config[project]}/package-lock.json`)
        await this.exec(`npm install --prefix ${config[project]}`)
        await this.exec(`${config[project]}/node_modules/.bin/tsc -p ${config[project]}`)
        this.print(`successfully build ${project}🎉`)
    }

    @Lane('publish')
    async publish(@context() context: LaneContext, @param(versionOptions) version: string, @param(projectOptions) project: string) {
        const config = this.parseJSON(context.directory + '/config/config.json');
        await this.exec(`npm publish ${config[project]}`);
        await this.bump(version, `publish and release ${version}`, config[project]);
        await this.push(config[project], 'origin', 'master');
    }

    @Lane('rebuild core')
    async core(@context() context: LaneContext) {

        await this.build(context, 'core');
    }

    @Lane('rebuild core plugin')
    async core_plugin(@context() context: LaneContext) {
        await this.build(context, 'core_plugin');
    }

    @Lane('rebuild cli')
    async cli(@context() context: LaneContext) {
        await this.build(context, 'cli');
    }

    @Lane('rebuild app')
    async exampleApp(@context() context: LaneContext) {
        await this.build(context, 'app');
    }

    @Lane('rebuild plugin')
    async plugin(@context() context: LaneContext) {
        await this.build(context, 'plugin');
    }
}
