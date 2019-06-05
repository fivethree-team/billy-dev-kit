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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
const billy_plugin_core_1 = require("@fivethree/billy-plugin-core");
const options_1 = require("./options");
let DevKit = class DevKit {
    release(context, dirty = false) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.print('reading config file...⌛');
            const config = yield this.parseJSON(context.directory + '/src/config/config.json');
            const status = {};
            status.core = yield this.git_porcelain(config.core);
            status.core_plugin = yield this.git_porcelain(config.core_plugin);
            status.cli = yield this.git_porcelain(config.cli);
            status.plugin = yield this.git_porcelain(config.plugin);
            status.app = yield this.git_porcelain(config.app);
            if (!dirty && !(status.core && status.core_plugin && status.cli && status.plugin && status.app)) {
                yield this.print('git status not clean:');
                yield this.print(status);
                console.error('please push all your local changes before release!');
                return;
            }
            const coreC = yield this.parseJSON(config.core + '/package.json');
            const core_pluginC = yield this.parseJSON(config.core_plugin + '/package.json');
            const cliC = yield this.parseJSON(config.cli + '/package.json');
            const pluginC = yield this.parseJSON(config.plugin + '/package.json');
            const appC = yield this.parseJSON(config.app + '/package.json');
            const version = yield this.prompt(`enter version  | current: ${coreC.version}`);
            if (version) {
                yield this.print('starting release! 🚀');
                coreC.version = version;
                yield this.writeJSON(config.core + '/package.json', coreC);
                yield this.core(context);
                yield this.publish(context, version, 'core');
                core_pluginC.version = version;
                core_pluginC.devDependencies['@fivethree/billy-core'] = version;
                yield this.writeJSON(config.core_plugin + '/package.json', core_pluginC);
                yield this.core_plugin(context);
                yield this.publish(context, version, 'core_plugin');
                cliC.version = version;
                cliC.dependencies['@fivethree/billy-core'] = version;
                cliC.dependencies['@fivethree/billy-plugin-core'] = version;
                yield this.writeJSON(config.cli + '/package.json', cliC);
                yield this.cli(context);
                yield this.publish(context, version, 'cli');
                pluginC.version = version;
                pluginC.devDependencies['@fivethree/billy-core'] = version;
                yield this.writeJSON(config.plugin + '/package.json', pluginC);
                yield this.plugin(context);
                yield this.publish(context, version, 'plugin');
                appC.version = version;
                appC.dependencies['@fivethree/billy-core'] = version;
                appC.dependencies['@fivethree/billy-plugin-core'] = version;
                yield this.writeJSON(config.app + '/package.json', appC);
                yield this.exampleApp(context);
                yield this.publish(context, version, 'app');
                yield this.print(`Done publishing version ${version}! ✅`);
            }
            else {
                yield this.print('no version specified');
            }
        });
    }
    commitAll(context) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.print('reading config file...⌛');
            const config = yield this.parseJSON(context.directory + '/src/config/config.json');
            const type = yield this.prompt('enter commit type | type(scope): message');
            const scope = yield this.prompt('enter commit scope | type(scope): message');
            const message = yield this.prompt('enter commit message | type(scope): message');
            yield this.git_commit(`${type}(${scope}): ${message}`, config.core);
            yield this.git_commit(`${type}(${scope}): ${message}`, config.core_plugin);
            yield this.git_commit(`${type}(${scope}): ${message}`, config.cli);
            yield this.git_commit(`${type}(${scope}): ${message}`, config.plugin);
            yield this.git_commit(`${type}(${scope}): ${message}`, config.app);
            yield this.print(`Done commiting`);
        });
    }
    pushAll(context) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.print('reading config file...⌛');
            const config = yield this.parseJSON(context.directory + '/src/config/config.json');
            console.log('CONFIG', config);
            yield this.git_push(config.core);
            yield this.git_push(config.core_plugin);
            yield this.git_push(config.cli);
            yield this.git_push(config.plugin);
            yield this.git_push(config.app);
        });
    }
    setup(context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.print('reading config file...⌛');
            const config = yield this.parseJSON(context.directory + '/src/config/config.json');
            const core_pluginC = yield this.parseJSON(config.core_plugin + '/package.json');
            const cliC = yield this.parseJSON(config.cli + '/package.json');
            const pluginC = yield this.parseJSON(config.plugin + '/package.json');
            const appC = yield this.parseJSON(config.app + '/package.json');
            this.print('setup dependencies... ⏳');
            core_pluginC.devDependencies['@fivethree/billy-core'] = `file:${config.core}`;
            cliC.dependencies['@fivethree/billy-core'] = `file:${config.core}`;
            cliC.dependencies['@fivethree/billy-plugin-core'] = `file:${config.core_plugin}`;
            pluginC.devDependencies['@fivethree/billy-core'] = `file:${config.core}`;
            appC.dependencies['@fivethree/billy-core'] = `file:${config.core}`;
            appC.dependencies['@fivethree/billy-plugin-core'] = `file:${config.core_plugin}`;
            yield this.writeJSON(config.core_plugin + '/package.json', core_pluginC);
            yield this.writeJSON(config.cli + '/package.json', cliC);
            yield this.writeJSON(config.plugin + '/package.json', pluginC);
            yield this.writeJSON(config.app + '/package.json', appC);
            yield this.core(context);
            yield this.core_plugin(context);
            yield this.cli(context);
            yield this.plugin(context);
            yield this.exampleApp(context);
            yield this.print(`Setup done! ✅`);
        });
    }
    build(context, project, dirty) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('build project', project);
            const config = yield this.parseJSON(context.directory + '/src/config/config.json');
            yield this.print(`building ${project} ... ⏳`);
            if (!dirty) {
                yield this.exec(`rm -rf ${config[project]}/node_modules ${config[project]}/package-lock.json`);
                yield this.exec(`npm install --prefix ${config[project]}`);
            }
            yield this.exec(`${config[project]}/node_modules/.bin/tsc -p ${config[project]}`);
            yield this.print(`successfully build ${project}🎉`);
        });
    }
    publish(context, version, project) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = yield this.parseJSON(context.directory + '/src/config/config.json');
            yield this.exec(`npm publish ${config[project]}`);
            yield this.bump(version, `publish and release ${version}`, config[project]);
            yield this.git_push(config[project], 'origin', 'master');
        });
    }
    core(context, dirty) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.build(context, 'core', dirty);
        });
    }
    core_plugin(context, dirty) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.build(context, 'core_plugin', dirty);
        });
    }
    cli(context, dirty) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.build(context, 'cli', dirty);
        });
    }
    exampleApp(context, dirty) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.build(context, 'app', dirty);
        });
    }
    plugin(context, dirty) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.build(context, 'plugin', dirty);
        });
    }
    hooks(context) {
        return __awaiter(this, void 0, void 0, function* () {
            context.api.printHistory();
        });
    }
    // @Hook(beforeEach)
    // @Hook(afterEach)
    // @Hook(beforeAll)
    // @Hook(onStart)
    hookTests(context) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(context.description);
        });
    }
    testlane(dirty) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
};
__decorate([
    billy_core_1.usesPlugins(billy_plugin_core_1.CorePlugin),
    billy_core_1.Command('release a billy version'),
    __param(0, billy_core_1.context()), __param(1, billy_core_1.param(options_1.dirtyOptions)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "release", null);
__decorate([
    billy_core_1.Command('build and commit local changes'),
    __param(0, billy_core_1.context()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "commitAll", null);
__decorate([
    billy_core_1.Command('build and commit local changes'),
    __param(0, billy_core_1.context()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "pushAll", null);
__decorate([
    billy_core_1.Command('setup development environment'),
    __param(0, billy_core_1.context()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "setup", null);
__decorate([
    billy_core_1.Command('build'),
    __param(0, billy_core_1.context()), __param(1, billy_core_1.param(options_1.projectOptions)), __param(2, billy_core_1.param(options_1.dirtyOptions)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Boolean]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "build", null);
__decorate([
    billy_core_1.Command('publish'),
    __param(0, billy_core_1.context()), __param(1, billy_core_1.param(options_1.versionOptions)), __param(2, billy_core_1.param(options_1.projectOptions)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "publish", null);
__decorate([
    billy_core_1.Command('rebuild core'),
    __param(0, billy_core_1.context()), __param(1, billy_core_1.param(options_1.dirtyOptions)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "core", null);
__decorate([
    billy_core_1.Command('rebuild core plugin'),
    __param(0, billy_core_1.context()), __param(1, billy_core_1.param(options_1.dirtyOptions)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "core_plugin", null);
__decorate([
    billy_core_1.Command('rebuild cli'),
    __param(0, billy_core_1.context()), __param(1, billy_core_1.param(options_1.dirtyOptions)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "cli", null);
__decorate([
    billy_core_1.Command('rebuild app'),
    __param(0, billy_core_1.context()), __param(1, billy_core_1.param(options_1.dirtyOptions)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "exampleApp", null);
__decorate([
    billy_core_1.Command('rebuild plugin'),
    __param(0, billy_core_1.context()), __param(1, billy_core_1.param(options_1.dirtyOptions)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "plugin", null);
__decorate([
    billy_core_1.Hook(billy_core_1.afterAll),
    __param(0, billy_core_1.context()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "hooks", null);
__decorate([
    __param(0, billy_core_1.context()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "hookTests", null);
__decorate([
    billy_core_1.Command({
        alias: 'test',
        description: 'testlane'
    }),
    billy_core_1.Job(billy_core_1.every(10).seconds),
    __param(0, billy_core_1.param(options_1.dirtyOptions)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean]),
    __metadata("design:returntype", Promise)
], DevKit.prototype, "testlane", null);
DevKit = __decorate([
    billy_core_1.App({
        allowUnknownOptions: false
    })
], DevKit);
exports.DevKit = DevKit;
