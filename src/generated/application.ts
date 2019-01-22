import { CorePlugin } from '@fivethree/billy-plugin-core';
import { NgrokPlugin } from '@fivethree/billy-plugin-ngrok';
import { usesPlugins } from '@fivethree/billy-core';

export interface Application extends CorePlugin, NgrokPlugin {

}

export class Application {
    @usesPlugins(CorePlugin, NgrokPlugin) this;
}