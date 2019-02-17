import { LaneContext } from "@fivethree/billy-core";
import { Application } from "./generated/application";
export declare class DevKit extends Application {
    release(context: LaneContext): Promise<void>;
    commitAll(context: LaneContext): Promise<void>;
    pushAll(context: LaneContext): Promise<void>;
    setup(context: LaneContext): Promise<void>;
    build(context: LaneContext, project: string): Promise<void>;
    publish(context: LaneContext, version: string, project: string): Promise<void>;
    core(context: LaneContext): Promise<void>;
    core_plugin(context: LaneContext): Promise<void>;
    cli(context: LaneContext): Promise<void>;
    exampleApp(context: LaneContext): Promise<void>;
    plugin(context: LaneContext): Promise<void>;
}
