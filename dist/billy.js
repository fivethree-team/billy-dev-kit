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
let DevKit = class DevKit {
    release(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const { print, parseJSON, prompt, writeJSON, app, core, core_plugin, cli, exampleApp, plugin, publish, gitClean, bump, push_to_remote } = context;
            print('reading config file...⌛');
            const config = parseJSON(app.appDir + '/..' + '/config/config.json');
            const status = {};
            status.core = yield gitClean(config.core);
            status.core_plugin = yield gitClean(config.core_plugin);
            status.cli = yield gitClean(config.cli);
            status.plugin = yield gitClean(config.plugin);
            status.app = yield gitClean(config.app);
            if (!(status.core && status.core_plugin && status.cli && status.plugin && status.app)) {
                print('git status not clean:');
                print(status);
                console.error('please push all your local changes before release!');
                return;
            }
            const coreC = parseJSON(config.core + '/package.json');
            const core_pluginC = parseJSON(config.core_plugin + '/package.json');
            const cliC = parseJSON(config.cli + '/package.json');
            const pluginC = parseJSON(config.plugin + '/package.json');
            const appC = parseJSON(config.app + '/package.json');
            const version = yield prompt(`enter version  | current: ${coreC.version}`);
            if (version) {
                print('starting release! 🚀');
                coreC.version = version;
                writeJSON(config.core + '/package.json', coreC);
                yield core(context);
                yield publish(context, version, 'core');
                core_pluginC.version = version;
                core_pluginC.devDependencies['@fivethree/billy-core'] = version;
                writeJSON(config.core_plugin + '/package.json', core_pluginC);
                yield core_plugin(context);
                yield publish(context, version, 'core_plugin');
                cliC.version = version;
                cliC.dependencies['@fivethree/billy-core'] = version;
                cliC.dependencies['@fivethree/billy-plugin-core'] = version;
                writeJSON(config.cli + '/package.json', cliC);
                yield cli(context);
                yield publish(context, version, 'cli');
                pluginC.version = version;
                pluginC.devDependencies['@fivethree/billy-core'] = version;
                writeJSON(config.plugin + '/package.json', pluginC);
                yield plugin(context);
                yield publish(context, version, 'plugin');
                appC.version = version;
                appC.dependencies['@fivethree/billy-core'] = version;
                appC.dependencies['@fivethree/billy-plugin-core'] = version;
                writeJSON(config.app + '/package.json', appC);
                yield exampleApp(context);
                yield publish(context, version, 'app');
                print(`Done publishing version ${version}! ✅`);
            }
            else {
                print('no version specified');
            }
        });
    }
    setup(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const { print, parseJSON, writeJSON, app, core, core_plugin, exampleApp, cli, plugin } = context;
            print('reading config file...⌛');
            const config = parseJSON(app.appDir + '/..' + '/config/config.json');
            const core_pluginC = parseJSON(config.core_plugin + '/package.json');
            const cliC = parseJSON(config.cli + '/package.json');
            const pluginC = parseJSON(config.plugin + '/package.json');
            const appC = parseJSON(config.app + '/package.json');
            print('setup dependencies... ⏳');
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
            yield core(context);
            yield core_plugin(context);
            yield cli(context);
            yield plugin(context);
            yield exampleApp(context);
            print(`Setup done! ✅`);
        });
    }
    build({ print, exec, parseJSON, app, prompt }, project) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = project ? project : yield prompt('What do you want to build? [core, core_plugin, cli, plugin, app]');
            const config = parseJSON(app.appDir + '/..' + '/config/config.json');
            print(`building ${repo} ... ⏳`);
            yield exec(`rm -rf ${config[repo]}/node_modules ${config[repo]}/package-lock.json`);
            yield exec(`npm install --prefix ${config[repo]}`);
            yield exec(`${config[repo]}/node_modules/.bin/tsc -p ${config[repo]}`);
            print(`successfully build ${repo}🎉`);
        });
    }
    publish({ exec, parseJSON, app, prompt, bump, push_to_remote }, version, project) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = project ? project : yield prompt('What do you want to publish? [core, core_plugin, cli, plugin, app]');
            const config = parseJSON(app.appDir + '/..' + '/config/config.json');
            yield exec(`npm publish ${config[repo]}`);
            yield bump(version, `publish and release ${version}`, config[repo]);
            yield push_to_remote(config[repo], 'origin', 'master');
        });
    }
    core(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const { build } = context;
            yield build(context, 'core');
        });
    }
    core_plugin(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const { build } = context;
            yield build(context, 'core_plugin');
        });
    }
    cli(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const { build } = context;
            yield build(context, 'cli');
        });
    }
    exampleApp(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const { build } = context;
            yield build(context, 'app');
        });
    }
    plugin(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const { build } = context;
            yield build(context, 'plugin');
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
DevKit = __decorate([
    billy_core_1.App()
], DevKit);
exports.DevKit = DevKit;
