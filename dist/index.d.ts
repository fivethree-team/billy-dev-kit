#!/usr/bin/env node
import { Context } from "@fivethree/billy-core";
import { CorePlugin } from "@fivethree/billy-plugin-core";
export interface DevKit extends CorePlugin {
}
export declare class DevKit {
    release(context: Context, dirty: boolean, message: any): Promise<void>;
    commitAll(context: Context): Promise<void>;
    pushAll(context: Context): Promise<void>;
    setup(context: Context, dirty: boolean): Promise<void>;
    build(context: Context, project: string, dirty: boolean): Promise<void>;
    publish(context: Context, version: string, project: string, message: string): Promise<void>;
    core(context: Context, dirty?: boolean): Promise<void>;
    core_plugin(context: Context, dirty?: boolean): Promise<void>;
    cli(context: Context, dirty?: boolean): Promise<void>;
    exampleApp(context: Context, dirty?: boolean): Promise<void>;
    plugin(context: Context, dirty?: boolean): Promise<void>;
    hooks(context: Context): Promise<void>;
    hookTests(context: Context): Promise<void>;
    testlane(): Promise<void>;
    onStart(n: string): Promise<void>;
}
