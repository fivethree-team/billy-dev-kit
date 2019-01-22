import { LaneContext } from "@fivethree/billy-core";
import { Application } from "./generated/application";
export declare class DevKit extends Application {
    release(context: LaneContext): Promise<void>;
    setup(context: LaneContext): Promise<void>;
    build(context: LaneContext, project?: string): Promise<void>;
    publish(context: LaneContext, version: string, project?: string): Promise<void>;
    core(context: LaneContext): Promise<void>;
    core_plugin(context: any): Promise<void>;
    cli(context: any): Promise<void>;
    exampleApp(context: any): Promise<void>;
    plugin(context: any): Promise<void>;
    schedule(context: LaneContext): Promise<void>;
    test(context: LaneContext): Promise<void>;
    webhookTest(context: LaneContext, body: any): Promise<void>;
    afterAll(): Promise<void>;
    beforeAll(): Promise<void>;
    beforeEach(): Promise<void>;
    afterEach(): Promise<void>;
    onError(err: Error, context: LaneContext): void;
    scheduledLane(): Promise<void>;
}
