/* eslint-disable new-cap */
import { getStyleFunction, useStyleFunction, wrapClusterStyleFunction, geometryTypeToStyleType } from '../../../../mapmodule/oskariStyle/generator.ol';

const defaults = {
    style: {
        fill: {
            color: '#FAEBD7'
        },
        stroke: {
            color: '#000000',
            width: 1,
            area: {
                color: '#000000',
                width: 1
            }
        },
        image: {
            shape: 5,
            size: 3,
            fill: {
                color: '#FAEBD7'
            }
        }
    },
    hover: {
        inherit: true,
        effect: 'auto minor'
    }
};
export const DEFAULT_STYLES = { ...defaults };

const isClusteredLayer = (mapmodule, layer) => {
    // mvt rendering isn't supported in 3D, no need to check layer's render mode
    return !mapmodule.getSupports3D() && typeof layer.getClusteringDistance() !== 'undefined';
};

const defaultStyleGenerator = (mapmodule, layer) => {
    return useStyleFunction(layer) ? getDefaultStyleFunction(mapmodule, layer) : getTypedStyle(mapmodule, layer);
};

const defaultTypedStyles = {}; // cached default ol styles for point, line and area
const getTypedStyle = (mapmodule, layer) => {
    const geometryType = layer.getGeometryType();
    const styleType = geometryTypeToStyleType(geometryType);
    let style = defaultTypedStyles[styleType];
    if (!style) {
        style = mapmodule.getStyle(DEFAULT_STYLES.style, styleType);
        defaultTypedStyles[styleType] = style;
    }
    return style;
};

let defaultStyleFunction;
let clusteredFunction;
const getDefaultStyleFunction = (mapmodule, layer) => {
    const isClustered = isClusteredLayer(mapmodule, layer);
    if (!isClustered && defaultStyleFunction) {
        return defaultStyleFunction;
    }
    if (isClustered && clusteredFunction) {
        return clusteredFunction;
    }
    const styles = {
        typed: mapmodule.getGeomTypedStyles(DEFAULT_STYLES.style),
        optional: []
    };
    defaultStyleFunction = getStyleFunction(styles);
    if (isClustered) {
        clusteredFunction = wrapClusterStyleFunction(defaultStyleFunction);
        return clusteredFunction;
    }
    return defaultStyleFunction;
};

export const styleGenerator = (mapmodule, layer) => {
    if (!layer) {
        return getDefaultStyleFunction(mapmodule);
    }
    const style = layer.getCurrentStyle();
    if (!style || !style.hasDefinitions()) {
        return defaultStyleGenerator(mapmodule, layer);
    }
    const styleFunction = mapmodule.getStyleForLayer(layer);
    if (isClusteredLayer(mapmodule, layer)) {
        return wrapClusterStyleFunction(styleFunction);
    }
    return styleFunction;
};
