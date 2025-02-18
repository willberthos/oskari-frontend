import { VectorStyle } from '../../mapmodule/domain/VectorStyle';

export class Tiles3DModelBuilder {
    parseLayerData (layer, mapLayerJson, maplayerService) {
        const { options = {}, style } = mapLayerJson;
        const { styles = {}, externalStyles = {} } = options;
        Object.keys(styles).forEach(name => {
            const style = new VectorStyle(name, null, 'normal', styles[name]);
            layer.addStyle(style);
        });
        // Remove styles from options to be sure that VectorStyle is used
        delete options.styles;

        Object.keys(externalStyles).forEach(name => {
            // Use name as title
            const style = new VectorStyle(name, name, 'external', styles[name]);
            layer.addStyle(style);
        });
        // Remove externalStyles from options to be sure that VectorStyle is used
        delete options.externalStyles;
        if (style) {
            layer.selectStyle(style);
        }
    }
}
