import { getFormatter } from './ValueFormatters';
const ID_SKIP_LABEL = '$SKIP$__';
/* ****************************************
 * Helpers
 */
const isEmpty = (value) => (typeof value === 'string' && value.trim() === '');

const isDataShown = (value, formatterOpts = {}) => {
    if (typeof value === 'undefined' || formatterOpts.type === 'hidden') {
        return false;
    }
    if (formatterOpts.skipEmpty === true) {
        return !isEmpty(value);
    }
    return true;
};
/**
 * Removes properties that are not referenced in the second parameter (if second parameter has an array of prop names)
 * @param {Object} properties vector feature properties
 * @param {String[]} selectedPropNames list of property names to include for the result object
 * @returns filtered properties object or original if no selection is provided
 */
const filterProperties = (properties = {}, selectedPropNames) => {
    if (!selectedPropNames || !Array.isArray(selectedPropNames) || !selectedPropNames.length) {
        return properties;
    }
    return selectedPropNames.reduce((result, prop) => {
        result[prop] = properties[prop];
        return result;
    }, {});
};

const jsonFormatter = (pValue, pluginLocale = {}) => {
    if (!pValue) {
        return;
    }
    const value = jQuery('<span></span>');
    // if value is an array -> format it first
    // TODO: maybe some nicer formatting?
    if (Array.isArray(pValue)) {
        const innerValues = pValue.map(arrayItem => jsonFormatter(arrayItem, pluginLocale));
        innerValues.forEach(itemValue => {
            value.append(itemValue);
            value.append('<br class="innerValueBr" />');
        });
    } else if (typeof pValue === 'object') {
        Object.keys(pValue).forEach(subAttrName => {
            const innerValue = jsonFormatter(pValue[subAttrName], pluginLocale);
            if (innerValue) {
                value.append(pluginLocale[subAttrName] || subAttrName + ': ');
                value.append(innerValue);
                value.append('<br class="innerValueBr" />');
            }
        });
    } else if (pValue.indexOf && pValue.indexOf('://') > 0 && pValue.indexOf('://') < 7) {
        var link = jQuery('<a target="_blank" rel="noopener"></a>');
        link.attr('href', pValue);
        link.text(pValue);
        value.append(link);
    } else {
        value.text(pValue);
    }
    return value;
};
/*
 * /Helpers
 **************************************** */

Oskari.clazz.category('Oskari.mapframework.mapmodule.GetInfoPlugin', 'formatter', {
    __templates: {
        wrapper: '<div></div>',
        getinfoResultTable: '<table class="getinforesult_table"></table>',
        tableRow: '<tr></tr>',
        tableCell: '<td></td>',
        header: '<div class="getinforesult_header"><div class="icon-bubble-left"></div>',
        headerTitle: '<div class="getinforesult_header_title"></div>',
        linkOutside: '<a target="_blank" rel="noopener"></a>'
    },
    layerFormatters: [],
    formatters: {
        html: function (datumContent) {
            // html has to be put inside a container so jquery behaves
            var parsedHTML = jQuery('<div></div>').append(datumContent);
            // Remove stuff from head etc. that we don't need/want
            parsedHTML.find('link, meta, script, style, title').remove();
            // Add getinforesult class etc. so the table is styled properly
            parsedHTML.find('table').addClass('getinforesult_table');
            // FIXME this is unnecessary, we can do this with a css selector.
            parsedHTML.find('tr').removeClass('odd');
            parsedHTML.find('tr:even').addClass('odd');
            return parsedHTML;
        },
        /**
         * @method json
         * @private
         * Formats a GFI response value to a jQuery object
         * @param {pValue} datum response data to format
         * @return {jQuery} formatted HMTL
         */
        json: function (pValue, pluginLocale) {
            let myLoc = pluginLocale;
            if (!myLoc) {
                // Get localized name for attribute
                // TODO this should only apply to omat tasot?
                const pluginLoc = this.getMapModule().getLocalization('plugin', true) || {};
                myLoc = pluginLoc[this._name] || {};
            }
            return jsonFormatter(pValue, myLoc);
        },
        /**
         * Checks if the given string is a html document
         *
         * @method _isHTML
         * @private
         * @param datumContent
         * @return true if includes HTML tag
         */
        isHTML: function (datumContent) {
            if (typeof datumContent === 'string') {
                return datumContent.toLowerCase().indexOf('<html') !== -1;
            }
            return false;
        }
    },
    /**
     * Wraps the html feature fragments into a container.
     *
     * @method _renderFragments
     * @private
     * @param  {Object[]} fragments
     * @return {jQuery}
     */
    _renderFragments: function (fragments) {
        var me = this;

        const baseDiv = me.template.wrapper.clone();
        fragments
            .map(fragment => {
                var fragmentTitle = fragment.layerName;
                var fragmentMarkup = fragment.markup;
                const contentWrapper = me.template.wrapper.clone();
                var headerWrapper = me.template.header.clone();
                var titleWrapper = me.template.headerTitle.clone();

                titleWrapper.text(fragmentTitle);
                titleWrapper.attr('title', fragmentTitle);
                headerWrapper.append(titleWrapper);
                contentWrapper.append(headerWrapper);

                if (fragmentMarkup) {
                    contentWrapper.append(fragmentMarkup);
                }
                return contentWrapper;
            })
            .filter(frag => typeof frag !== 'undefined')
            .forEach(frag => baseDiv.append(frag));
        return baseDiv;
    },

    /**
     * Add a custom formatter
     *
     * A custom format should expose two methods:
     *  enable: takes layer GFI response data and return a boolean value that
     *      indicates if the formatter is enabled for the given layer
     *  format: takes layer GFI response data and format it
     *
     * @param {Object} formatter A formatter instance
     */
    addLayerFormatter: function (formatter) {
        if (typeof formatter.enabled === 'function' && typeof formatter.format === 'function') {
            this.layerFormatters.push(formatter);
        }
    },

    /**
     * Parses and formats a GFI response
     *
     * @method _parseGfiResponse
     * @private
     * @param {Object} resp response data to format
     * @return {Object} object { fragments: coll, title: title } where
     *  fragments is an array of JSON { markup: '<html-markup>', layerName:
     * 'nameforlayer', layerId: idforlayer }
     */
    _parseGfiResponse: function (data) {
        if (data.layerCount === 0) {
            return;
        }
        const me = this;
        const sandbox = this.getSandbox();

        const coll = data.features
            .map(function (datum) {
                const formats = me.layerFormatters
                    .filter((formatter) => formatter.enabled(datum))
                    .map((formatter) => formatter.format(datum));
                let pretty;
                if (formats.length > 0) {
                    pretty = formats.join('');
                } else {
                    pretty = me._formatGfiDatum(datum);
                }
                if (pretty === null) {
                    // if formatter returned null we should skip this result
                    return null;
                }

                const layer = sandbox.findMapLayerFromSelectedMapLayers(datum.layerId);
                const layerName = layer ? layer.getName() : '';
                const layerIdString = datum.layerId + '';

                return {
                    markup: pretty,
                    layerId: layerIdString,
                    layerName: layerName,
                    type: datum.type,
                    isMyPlace: !!layerIdString.match('myplaces_')
                };
            })
            .filter(feature => !!feature);

        return coll || [];
    },

    /**
     * Formats a GFI HTML or JSON object to result HTML
     *
     * @method _formatGfiDatum
     * @private
     * @param {Object} datum response data to format
     * @return {jQuery} formatted HMTL
     */
    _formatGfiDatum: function (datum, pluginLocale) {
        // FIXME this function is too complicated, chop it to pieces
        if (!datum.presentationType) {
            return null;
        }

        const me = this;
        let response = me.template.wrapper.clone();
        let myLoc = pluginLocale;
        if (!myLoc) {
            // Get localized name for attribute
            // TODO this should only apply to omat tasot?
            const pluginLoc = this.getMapModule().getLocalization('plugin', true) || {};
            myLoc = pluginLoc[this._name] || {};
        }

        if (datum.presentationType === 'JSON' || (datum.content && datum.content.parsed)) {
            var even = false,
                rawJsonData = datum.content.parsed,
                dataArray = [],
                i,
                attr,
                jsonData,
                table,
                value,
                row,
                labelCell,
                localizedAttr,
                valueCell;

            if (Object.prototype.toString.call(rawJsonData) === '[object Array]') {
                dataArray = rawJsonData;
            } else {
                dataArray.push(rawJsonData);
            }

            for (i = 0; i < dataArray.length; i += 1) {
                jsonData = dataArray[i];
                table = me.template.getinfoResultTable.clone();
                for (attr in jsonData) {
                    if (!jsonData.hasOwnProperty(attr)) {
                        continue;
                    }
                    value = me.formatters.json(jsonData[attr], myLoc);
                    if (!value) {
                        continue;
                    }
                    row = me.template.tableRow.clone();
                    // FIXME this is unnecessary, we can do this with a css selector.
                    if (!even) {
                        row.addClass('odd');
                    }
                    even = !even;

                    labelCell = me.template.tableCell.clone();
                    // Get localized name for attribute
                    localizedAttr = myLoc[attr];
                    labelCell.append(localizedAttr || attr);
                    row.append(labelCell);
                    valueCell = me.template.tableCell.clone();
                    valueCell.append(value);
                    row.append(valueCell);
                    table.append(row);
                }
                response.append(table);
            }
        } else if (datum.content === '') {
            // no content
            return null;
        } else if (me.formatters.isHTML(datum.content)) {
            var parsedHTML = me.formatters.html(datum.content);
            if (jQuery.trim(parsedHTML.html()) === '') {
                return null;
            }
            response.append(parsedHTML.html());
        } else {
            response.append(datum.content);
        }
        // custom "footer"
        if (datum.gfiContent) {
            var trimmed = datum.gfiContent.trim();
            if (trimmed.length) {
                response.append(trimmed);
            }
        }
        return response;
    },

    /**
     * @method _formatWFSFeaturesForInfoBox
     */
    _formatWFSFeaturesForInfoBox: function (data) {
        var me = this;
        const { layerId, features } = data;
        if (typeof layerId === 'undefined' || typeof features === 'undefined') {
            return;
        }
        const layer = this.getSandbox().findMapLayerFromSelectedMapLayers(layerId);
        if (features === 'empty' || !layer) {
            return;
        }
        // TODO: cleanup the my places references where they can be cleaned. Not sure if the boolean isMyPlace is used by the callers of this method
        const isMyPlace = layer.isLayerOfType('myplaces');
        const noDataResult = `<table><tr><td>${this._loc.noAttributeData}</td></tr></table>`;
        // use localized labels for properties when available instead of property names
        const localeMapping = layer.getPropertyLabels() || {};
        const processEntry = ([prop, value]) => {
            let uiLabel = localeMapping[prop] || prop;
            let formatterOpts = {};
            if (typeof layer.getFieldFormatMetadata === 'function') {
                formatterOpts = layer.getFieldFormatMetadata(prop);
            }
            if (isDataShown(value, formatterOpts)) {
                const formatter = getFormatter(formatterOpts.type);
                if (formatterOpts.noLabel === true) {
                    uiLabel = ID_SKIP_LABEL + uiLabel;
                }
                return [uiLabel, formatter(value, formatterOpts.params)];
            }
            return null;
        };
        const formattersForLayerFeatureData = this.layerFormatters.filter((formatter) => formatter.enabled(data));
        const visiblePropertiesSelection = layer.getPropertySelection();
        const result = features.map(properties => {
            let markup = noDataResult;
            const formattedData = formattersForLayerFeatureData.map((formatter) => formatter.format(properties, layerId));
            if (formattedData.length > 0) {
                // layerFormatter was used - overriding the default WFS feature data formatting
                markup = formattedData.join('');
            } else {
                const filteredProps = filterProperties(properties, visiblePropertiesSelection);
                // map feature property values by running configured property formatters per property (links/images markup wrapping etc)
                const featureProps = Object.fromEntries(
                    Object.entries(filteredProps)
                        .map(processEntry)
                        .filter(entry => !!entry));
                if (Object.keys(featureProps).length > 0) {
                    markup = me._json2html(featureProps);
                }
            }
            return {
                markup,
                layerId,
                layerName: layer.getName(),
                type: 'wfslayer',
                isMyPlace
            };
        });
        return result;
    },

    /**
     * @method _json2html
     * @private
     * Parses and formats a WFS layers JSON GFI response
     * @param {Object} node response data to format
     * @return {String} formatted HMTL
     */
    _json2html: function (node) {
        // FIXME this function is too complicated, chop it to pieces
        if (node === null || node === undefined) {
            return '';
        }
        var even = true,
            html = this.template.getinfoResultTable.clone(),
            row = null,
            keyColumn = null,
            valColumn = null,
            arrayObject = {},
            key,
            value,
            vType,
            valpres,
            valueDiv,
            innerTable,
            i;
        for (key in node) {
            if (!node.hasOwnProperty(key)) {
                continue;
            }
            value = node[key];

            if (value === null || value === undefined ||
                    key === null || key === undefined) {
                continue;
            }
            vType = (typeof value).toLowerCase();
            valpres = '';
            switch (vType) {
            case 'string':
                if (value.indexOf('http://') === 0 || value.indexOf('https://') === 0) {
                    valpres = this.template.linkOutside.clone();
                    valpres.attr('href', value);
                    valpres.append(value);
                } else {
                    valpres = value;
                }
                break;
            case 'undefined':
                valpres = 'n/a';
                break;
            case 'boolean':
                valpres = (value ? 'true' : 'false');
                break;
            case 'number':
                valpres = '' + value;
                break;
            case 'function':
                valpres = '?';
                break;
            case 'object':
                // format array
                if (jQuery.isArray(value)) {
                    valueDiv = this.template.wrapper.clone();
                    if (value.length > 0) {
                        if ((typeof value[0]).toLowerCase() === 'object') {
                            for (i = 0; i < value.length; i += 1) {
                                innerTable = this._json2html(value[i]);
                                valueDiv.append(innerTable);
                            }
                            valpres = valueDiv;
                        } else {
                            // Create object for array values
                            for (i = 0; i < value.length; i += 1) {
                                arrayObject[key + '.' + i] = value[i];
                            }
                            valpres = this._json2html(arrayObject);
                        }
                    }
                } else {
                    valpres = this._json2html(value);
                }
                break;
            default:
                valpres = '';
            }
            even = !even;

            row = this.template.tableRow.clone();
            const skipLabel = key.startsWith(ID_SKIP_LABEL);
            if (!skipLabel && !even) {
                row.addClass('odd');
            }
            if (!skipLabel) {
                keyColumn = this.template.tableCell.clone();
                keyColumn.append(key);
                row.append(keyColumn);
            }

            valColumn = this.template.tableCell.clone();
            if (skipLabel) {
                valColumn.attr('colspan', 2);
            }
            valColumn.append(valpres);
            row.append(valColumn);

            html.append(row);
        }
        return html;
    }
});
