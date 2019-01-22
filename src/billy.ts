import { App, Lane, LaneContext, Hook, Scheduled, Webhook } from "@fivethree/billy-core";
import { Application } from "./generated/application";

@App()
export class DevKit extends Application {

    @Lane('release a billy version')
    async release(context: LaneContext) {

        this.print('reading config file...⌛')
        const config = this.parseJSON(context.app.appDir + '/config/config.json');

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

    @Lane('setup development environment')
    async setup(context: LaneContext) {
        this.print('reading config file...⌛')
        const config = this.parseJSON(context.app.appDir + '/config/config.json');
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
    async build(context: LaneContext, project?: string) {
        console.log('build project', project);
        const repo = project ? project : await this.prompt('What do you want to build? [core, core_plugin, cli, plugin, app]')
        const config = this.parseJSON(context.app.appDir + '/config/config.json');

        this.print(`building ${repo} ... ⏳`)
        await this.exec(`rm -rf ${config[repo]}/node_modules ${config[repo]}/package-lock.json`)
        await this.exec(`npm install --prefix ${config[repo]}`)
        await this.exec(`${config[repo]}/node_modules/.bin/tsc -p ${config[repo]}`)
        this.print(`successfully build ${repo}🎉`)
    }

    @Lane('publish')
    async publish(context: LaneContext, version: string, project?: string) {
        const repo = project ? project : await this.prompt('What do you want to publish? [core, core_plugin, cli, plugin, app]')
        const config = this.parseJSON(context.app.appDir + '/config/config.json');
        await this.exec(`npm publish ${config[repo]}`);
        await this.bump(version, `publish and release ${version}`, config[repo]);
        await this.push(config[repo], 'origin', 'master');
    }

    @Lane('rebuild core')
    async core(context: LaneContext) {

        await this.build(context, 'core');
    }

    @Lane('rebuild core plugin')
    async core_plugin(context) {
        await this.build(context, 'core_plugin');
    }

    @Lane('rebuild cli')
    async cli(context) {
        await this.build(context, 'cli');
    }

    @Lane('rebuild app')
    async exampleApp(context) {
        await this.build(context, 'app');
    }

    @Lane('rebuild plugin')
    async plugin(context) {
        await this.build(context, 'plugin');
    }

    @Lane('schedule all')
    async schedule(context: LaneContext) {
        const jobs = await context.app.schedule();
        this.print('scheduled jobs', JSON.stringify(jobs));
    }

    @Lane('test')
    async test(context: LaneContext) {
        context.app.startWebhooks();
        const url = await this.tunnel();
        const res = await this.updateGithubWebhook(url, 'fivethree-team', 'billy-dev-kit', 80641659);
        console.log(res, url);
    }

    @Webhook('/push')
    @Lane('cool webhook lane')
    async webhookTest(context: LaneContext, body) {
        console.log('successfully run webhook', body);
    }

    @Hook('AFTER_ALL')
    async afterAll() {
        console.log('after all');
    }

    @Hook('BEFORE_ALL')
    async beforeAll() {
        console.log('before all');
    }

    @Hook('BEFORE_EACH')
    async beforeEach() {
        console.log('before each');
    }

    @Hook('AFTER_EACH')
    async afterEach() {
        console.log('after each');
    }

    @Hook('ERROR')
    onError(err: Error, context: LaneContext) {
        console.error(`error happened in lane ${context.lane.name}`, err.message);
    }

    @Scheduled('*/1 * * * *')
    async scheduledLane() {
        this.print('scheduled lane!!!!!!');
    }
}
