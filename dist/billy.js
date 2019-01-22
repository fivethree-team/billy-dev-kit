"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const billy_core_1 = require("@fivethree/billy-core");
const application_1 = require("./generated/application");
let DevKit = class DevKit extends application_1.Application {
    release(context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.print('reading config file...⌛');
            const config = this.parseJSON(context.app.appDir + '/config/config.json');
            const status = {};
            status.core = yield this.gitClean(config.core);
            status.core_plugin = yield this.gitClean(config.core_plugin);
            status.cli = yield this.gitClean(config.cli);
            status.plugin = yield this.gitClean(config.plugin);
            status.app = yield this.gitClean(config.app);
            if (!(status.core && status.core_plugin && status.cli && status.plugin && status.app)) {
                this.print('git status not clean:');
                this.print(status);
                console.error('please push all your local changes before release!');
                return;
            }
            const coreC = this.parseJSON(config.core + '/package.json');
            const core_pluginC = this.parseJSON(config.core_plugin + '/package.json');
            const cliC = this.parseJSON(config.cli + '/package.json');
            const pluginC = this.parseJSON(config.plugin + '/package.json');
            const appC = this.parseJSON(config.app + '/package.json');
            const version = yield this.prompt(`enter version  | current: ${coreC.version}`);
            if (version) {
                this.print('starting release! 🚀');
                coreC.version = version;
                this.writeJSON(config.core + '/package.json', coreC);
                yield this.core(context);
                yield this.publish(context, version, 'core');
                core_pluginC.version = version;
                core_pluginC.devDependencies['@fivethree/billy-core'] = version;
                this.writeJSON(config.core_plugin + '/package.json', core_pluginC);
                yield this.core_plugin(context);
                yield this.publish(context, version, 'core_plugin');
                cliC.version = version;
                cliC.dependencies['@fivethree/billy-core'] = version;
                cliC.dependencies['@fivethree/billy-plugin-core'] = version;
                this.writeJSON(config.cli + '/package.json', cliC);
                yield this.cli(context);
                yield this.publish(context, version, 'cli');
                pluginC.version = version;
                pluginC.devDependencies['@fivethree/billy-core'] = version;
                this.writeJSON(config.plugin + '/package.json', pluginC);
                yield this.plugin(context);
                yield this.publish(context, version, 'plugin');
                appC.version = version;
                appC.dependencies['@fivethree/billy-core'] = version;
                appC.dependencies['@fivethree/billy-plugin-core'] = version;
                this.writeJSON(config.app + '/package.json', appC);
                yield this.exampleApp(context);
                yield this.publish(context, version, 'app');
                this.print(`Done publishing version ${version}! ✅`);
            }
            else {
                this.print('no version specified');
            }
        });
    }
    setup(context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.print('reading config file...⌛');
            const config = this.parseJSON(context.app.appDir + '/config/config.json');
            const core_pluginC = this.parseJSON(config.core_plugin + '/package.json');
            const cliC = this.parseJSON(config.cli + '/package.json');
            const pluginC = this.parseJSON(config.plugin + '/package.json');
            const appC = this.parseJSON(config.app + '/package.json');
            this.print('setup dependencies... ⏳');
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
            yield this.core(context);
            yield this.core_plugin(context);
            yield this.cli(context);
            yield this.plugin(context);
            yield this.exampleApp(context);
            this.print(`Setup done! ✅`);
        });
    }
    build(context, project) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('build project', project);
            const repo = project ? project : yield this.prompt('What do you want to build? [core, core_plugin, cli, plugin, app]');
            const config = this.parseJSON(context.app.appDir + '/config/config.json');
            this.print(`building ${repo} ... ⏳`);
            yield this.exec(`rm -rf ${config[repo]}/node_modules ${config[repo]}/package-lock.json`);
            yield this.exec(`npm install --prefix ${config[repo]}`);
            yield this.exec(`${config[repo]}/node_modules/.bin/tsc -p ${config[repo]}`);
            this.print(`successfully build ${repo}🎉`);
        });
    }
    publish(context, version, project) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = project ? project : yield this.prompt('What do you want to publish? [core, core_plugin, cli, plugin, app]');
            const config = this.parseJSON(context.app.appDir + '/config/config.json');
            yield this.exec(`npm publish ${config[repo]}`);
            yield this.bump(version, `publish and release ${version}`, config[repo]);
            yield this.push(config[repo], 'origin', 'master');
        });
    }
    core(context) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.build(context, 'core');
        });
    }
    core_plugin(context) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.build(context, 'core_plugin');
        });
    }
    cli(context) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.build(context, 'cli');
        });
    }
    exampleApp(context) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.build(context, 'app');
        });
    }
    plugin(context) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.build(context, 'plugin');
        });
    }
    schedule(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobs = yield context.app.schedule();
            this.print('scheduled jobs', JSON.stringify(jobs));
        });
    }
    test() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('test');
        });
    }
    afterAll() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('after all');
        });
    }
    beforeAll() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('before all');
        });
    }
    beforeEach() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('before each');
        });
    }
    afterEach() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('after each');
        });
    }
    onError(err, context) {
        console.error(`error happened in lane ${context.lane.name}`, err.message);
    }
    scheduledLane() {
        return __awaiter(this, void 0, void 0, function* () {
            this.print('scheduled lane!!!!!!');
            yield this.test();
        });
    }
};
__decorate([
    billy_core_1.Lane('release a billy version'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "release", null);
__decorate([
    billy_core_1.Lane('setup development environment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "setup", null);
__decorate([
    billy_core_1.Lane('build'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "build", null);
__decorate([
    billy_core_1.Lane('publish'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "publish", null);
__decorate([
    billy_core_1.Lane('rebuild core'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "core", null);
__decorate([
    billy_core_1.Lane('rebuild core plugin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "core_plugin", null);
__decorate([
    billy_core_1.Lane('rebuild cli'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "cli", null);
__decorate([
    billy_core_1.Lane('rebuild app'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "exampleApp", null);
__decorate([
    billy_core_1.Lane('rebuild plugin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "plugin", null);
__decorate([
    billy_core_1.Lane('schedule all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "schedule", null);
__decorate([
    billy_core_1.Lane('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "test", null);
__decorate([
    billy_core_1.Hook('AFTER_ALL'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "afterAll", null);
__decorate([
    billy_core_1.Hook('BEFORE_ALL'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "beforeAll", null);
__decorate([
    billy_core_1.Hook('BEFORE_EACH'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "beforeEach", null);
__decorate([
    billy_core_1.Hook('AFTER_EACH'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "afterEach", null);
__decorate([
    billy_core_1.Hook('ERROR'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Error, Object]),
    __metadata("design:returntype", void 0)
], DevKit.prototype, "onError", null);
__decorate([
    billy_core_1.Scheduled('*/1 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "scheduledLane", null);
DevKit = __decorate([
    billy_core_1.App()
], DevKit);
exports.DevKit = DevKit;
