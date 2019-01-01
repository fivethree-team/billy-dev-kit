import { LaneContext } from "@fivethree/billy-core";
export declare class DevKit {
    release(context: LaneContext): Promise<void>;
    setup(context: LaneContext): Promise<void>;
    build({ print, exec, parseJSON, app, prompt }: {
        print: any;
        exec: any;
        parseJSON: any;
        app: any;
        prompt: any;
    }, project?: string): Promise<void>;
    publish({ exec, parseJSON, app, prompt }: {
        exec: any;
        parseJSON: any;
        app: any;
        prompt: any;
    }, project?: string): Promise<void>;
    core(context: any): Promise<void>;
    core_plugin(context: any): Promise<void>;
    cli(context: any): Promise<void>;
    exampleApp(context: any): Promise<void>;
    plugin(context: any): Promise<void>;
}
