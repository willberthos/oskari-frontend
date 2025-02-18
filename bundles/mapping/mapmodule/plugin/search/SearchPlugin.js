import '../../../../service/search/searchservice';
import '../../resources/scss/search.scss';

/**
 * @class Oskari.mapframework.bundle.mappublished.SearchPlugin
 * Provides a search functionality and result panel for published map.
 * Uses same backend as search bundle:
 * http://www.oskari.org/trac/wiki/DocumentationBundleSearchBackend
 */
Oskari.clazz.define(
    'Oskari.mapframework.bundle.mapmodule.plugin.SearchPlugin',
    /**
     * @method create called automatically on construction
     * @static
     * @param {Object} config
     *     JSON config with params needed to run the plugin
     */
    function (config) {
        var me = this;
        me._clazz =
            'Oskari.mapframework.bundle.mapmodule.plugin.SearchPlugin';
        me._defaultLocation = 'top left';
        me._index = 10;
        me._name = 'SearchPlugin';
        me._searchMarkerId = 'SEARCH_RESULT_MARKER';
    }, {

        /**
         * @private @method _initImpl
         * Interface method for the module protocol.
         * Initializes ui templates and search service.
         *
         *
         */
        _initImpl: function () {
            var me = this;

            me._loc = Oskari.getLocalization('MapModule', Oskari.getLang() || Oskari.getDefaultLanguage()).plugin.SearchPlugin;

            me.template = jQuery(
                '<div class="mapplugin search default-search-div">' +
                '  <div class="search-textarea-and-button">' +
                '    <input placeholder="' + me._loc.placeholder + '" type="text" /><input type="button" value="' + me._loc.search + '" name="search" />' +
                '  </div>'
            );

            me.resultsContainer = jQuery(
                '  <div class="results">' +
                '    <div class="content"></div>' +
                '  </div>' +
                '</div>'
            );

            // FIXME
            // - use only this template
            // - add header to results
            // - hide header when styled
            // - search-right is effectively the search button?
            me.styledTemplate = jQuery(
                '<div class="mapplugin search published-search-div">' +
                '  <div class="search-area-div search-textarea-and-button">' +
                '    <div class="search-left"></div>' +
                '    <div class="search-middle">' +
                '      <input class="search-input" placeholder="' + me._loc.placeholder + '" type="text" />' +
                '      <div class="close-results icon-close" title="' + me._loc.close + '"></div>' +
                '    </div>' +
                '    <div class="search-right"></div>' +
                '  </div>' +
                '  <div class="results published-search-results">' +
                '    <div class="content published-search-content"></div>' +
                '  </div>' +
                '</div>'
            );
            me.templateResultsTable = jQuery(
                '<table class="search-results">' +
                '  <thead>' +
                '    <tr>' +
                '      <th class="search-results-count" colspan="3"/>' +
                '    </tr>' +
                '    <tr>' +
                '      <th>' + me._loc.column_name + '</th>' +
                '      <th>' + me._loc.column_region + '</th>' +
                '      <th>' + me._loc.column_type + '</th>' +
                '    </tr>' +
                '  </thead>' +
                '  <tbody></tbody>' +
                '</table>'
            );

            me.templateResultsRow = jQuery(
                '<tr>' +
                '  <td><a href="JavaScript:void(0);""></a></td>' +
                '  <td></td>' +
                '  <td></td>' +
                '</tr>'
            );
            me.toolStyles = {
                'default': {
                    val: null
                },
                'rounded-dark': {
                    val: 'rounded-dark',
                    widthLeft: 17,
                    widthRight: 32
                },
                'rounded-light': {
                    val: 'rounded-light',
                    widthLeft: 17,
                    widthRight: 32
                },
                'sharp-dark': {
                    val: 'sharp-dark',
                    widthLeft: 5,
                    widthRight: 30
                },
                'sharp-light': {
                    val: 'sharp-light',
                    widthLeft: 5,
                    widthRight: 30
                },
                '3d-dark': {
                    val: '3d-dark',
                    widthLeft: 5,
                    widthRight: 44
                },
                '3d-light': {
                    val: '3d-light',
                    widthLeft: 5,
                    widthRight: 44
                }
            };

            me.service = Oskari.clazz.create(
                'Oskari.service.search.SearchService', me.getSandbox(), me.getConfig().url);
        },

        _setLayerToolsEditModeImpl: function () {
            var me = this,
                el = me.getElement(),
                overlay;
            if (!el) {
                return;
            }
            if (me.inLayerToolsEditMode()) {
                me._inputField.prop('disabled', true);
                me._searchButton.prop('disabled', true);

                overlay = jQuery('<div class="search-editmode-overlay">');
                me.getElement().find('.search-textarea-and-button')
                    .css({
                        'position': 'relative'
                    })
                    .append(overlay);
                overlay.on('mousedown', function (e) {
                    e.preventDefault();
                });
            } else {
                me._inputField.prop('disabled', false);
                me._searchButton.prop('disabled', false);
                me.getElement().find('.search-editmode-overlay').remove();
            }
        },

        /**
         * @private @method _createControlElement
         * Creates UI for search functionality and places it on the maps
         * div where this plugin registered.
         *
         *
         */
        _createControlElement: function () {
            var me = this,
                conf = me.getConfig(),
                el;
            if (conf && !conf.toolStyle) {
                conf.toolStyle = me.getToolStyleFromMapModule();
            }
            if (conf && conf.toolStyle) {
                el = me.styledTemplate.clone();
                me._inputField = el.find('input[type=text]');
                me._searchButton = el.find('input[type=button]');
                me._element = el;
                me.changeToolStyle(conf.toolStyle, el);
            } else {
                el = me.template.clone();
                me._inputField = el.find('input[type=text]');
                me._searchButton = el.find('input[type=button]');
                me._element = el;
            }

            // bind events
            me._bindUIEvents(el);
            return el;
        },

        _bindUIEvents: function (el) {
            var me = this,
                reqBuilder,
                sandbox = me.getSandbox(),
                content = el || me.getElement();

            // Toggle map keyboard controls so the user can use arrowkeys in the search...
            me._inputField.on('focus', function () {
                reqBuilder = Oskari.requestBuilder(
                    'DisableMapKeyboardMovementRequest'
                );
                if (reqBuilder) {
                    sandbox.request(me.getName(), reqBuilder());
                }
                // me._checkForKeywordClear();
            });
            me._inputField.on('blur', function () {
                reqBuilder = Oskari.requestBuilder(
                    'EnableMapKeyboardMovementRequest'
                );
                if (reqBuilder) {
                    sandbox.request(me.getName(), reqBuilder());
                }
                // me._checkForKeywordInsert();
            });

            me._inputField.on('keypress', function (event) {
                if (!me.isInLayerToolsEditMode) {
                    me._checkForEnter(event);
                }
            });

            // FIXME these are the same thing now...
            // to search button
            me._searchButton.on('click', function (event) {
                if (!me.isInLayerToolsEditMode) {
                    me._doSearch();
                }
            });
            content.find('div.search-right').on('click', function (event) {
                if (!me.isInLayerToolsEditMode) {
                    me._doSearch();
                }
            });

            // to close button
            content.find('div.close').on('click', function (event) {
                if (!me.isInLayerToolsEditMode) {
                    me._hideSearch();
                    me._inputField.val('');
                    // TODO: this should also unbind the TR tag click listeners?
                }
            });
            content.find('div.close-results').on('click', function (event) {
                if (!me.isInLayerToolsEditMode) {
                    me._hideSearch();
                    me._inputField.val('');
                }
            });
            content.find('div.results').hide();

            if (me.getConfig() && me.getConfig().toolStyle) {
                // Hide the results if esc was pressed or if the field is empty.
                me._inputField.keyup(function (e) {
                    if (e.keyCode === 27 || (e.keyCode === 8 && !jQuery(this).val())) {
                        me._hideSearch();
                    }
                });
            }
        },

        refresh: function () {
            var me = this,
                conf = me.getConfig(),
                element = me.getElement();

            if (conf) {
                if (conf.toolStyle) {
                    me.changeToolStyle(conf.toolStyle, element);
                } else {
                    var toolStyle = me.getToolStyleFromMapModule();
                    if (toolStyle !== null && toolStyle !== undefined) {
                        me.changeToolStyle(me.toolStyles[toolStyle], element);
                    }
                }

                if (conf.font) {
                    me.changeFont(conf.font, element);
                } else {
                    var font = me.getToolFontFromMapModule();
                    if (font !== null && font !== undefined) {
                        me.changeFont(font, element);
                    }
                }
            }
        },

        /**
         * @method _checkForEnter
         * @private
         * @param {Object} event
         *      keypress event object from browser
         * Detects if <enter> key was pressed and calls #_doSearch if it was
         */
        _checkForEnter: function (event) {
            if (event.keyCode === 13) {
                this._doSearch();
            }
        },

        /**
         * @private @method _doSearch
         * Uses SearchService to make the actual search and calls  #_showResults
         *
         *
         */
        _doSearch: function () {
            if (this._searchInProgess) {
                return;
            }
            this._hideSearch();
            this._searchInProgess = true;
            const inputField = this.getElement().find('input[type=text]');
            inputField.addClass('search-loading');
            const searchText = inputField.val();
            this.service.doSearch(searchText, results => this._showResults(results), () => this._enableSearch());
        },

        _setMarker: function (result) {
            var me = this,
                reqBuilder,
                sandbox = me.getSandbox(),
                lat = typeof result.lat !== 'number' ? parseFloat(result.lat) : result.lat,
                lon = typeof result.lon !== 'number' ? parseFloat(result.lon) : result.lon;

            // Add new marker
            reqBuilder = Oskari.requestBuilder(
                'MapModulePlugin.AddMarkerRequest'
            );
            if (reqBuilder) {
                sandbox.request(
                    me.getName(),
                    reqBuilder({
                        color: 'ffde00',
                        msg: result.name,
                        shape: 2,
                        size: 3,
                        x: lon,
                        y: lat
                    }, me._searchMarkerId)
                );
            }
        },

        _showResults: function (results) {
            const me = this;
            const { totalCount, error, hasMore, locations } = results;
            const resultsContainer = me.resultsContainer.clone();
            const content = resultsContainer.find('div.content');
            const mapmodule = me.getMapModule();
            const popupService = me.getSandbox().getService('Oskari.userinterface.component.PopupService');

            /* clear the existing search results */
            this._enableSearch();
            if (me.popup) {
                me.popup.close();
                me.popup = null;
            }
            me.popup = popupService.createPopup();
            if (error) {
                content.html(error);
            } else {
                // success
                if (totalCount === 0) {
                    content.html(this._loc.noresults);
                } else if (totalCount === 1) {
                    // only one result, show it immediately
                    this._resultClicked(locations[0]);
                    return;
                } else {
                    // many results, show all
                    const table = me.templateResultsTable.clone();
                    const tableBody = table.find('tbody');
                    const msgKey = hasMore ? 'searchMoreResults' : 'searchResultCount';
                    const resultMsg = Oskari.getMsg('MapModule', 'plugin.SearchPlugin.' + msgKey, { count: totalCount });
                    table.find('.search-results-count').html(resultMsg);

                    locations.forEach((result, i) => {
                        const { type, region, name } = result;
                        const row = me.templateResultsRow.clone();
                        const cells = row.find('td');
                        const xref = jQuery(cells[0]).find('a');
                        row.attr('data-location', i);
                        xref.attr('data-location', i);
                        xref.attr('title', name);
                        xref.append(name);
                        xref.on('click', () => this._resultClicked(result));
                        jQuery(cells[1]).attr('title', region).append(region);
                        jQuery(cells[2]).attr('title', type).append(type);

                        tableBody.append(row);
                    });

                    if (!(me.getConfig() && me.getConfig().toolStyle)) {
                        tableBody.find(':odd').addClass('odd');
                    }

                    content.html(table);

                    // Change the font of the rendered table as well
                    var conf = me.getConfig();
                    if (conf) {
                        if (conf.font) {
                            me.changeFont(conf.font, content);
                        }
                        if (conf.toolStyle) {
                            me.changeResultListStyle(
                                conf.toolStyle,
                                resultsContainer
                            );
                        }
                    }
                }
            }

            var popupContent = resultsContainer;
            if (Oskari.util.isMobile()) {
                // get the sticky buttons into their initial state and kill all popups
                me.getSandbox().postRequestByName('Toolbar.SelectToolButtonRequest', [null, 'mobileToolbar-mobile-toolbar']);
                popupService.closeAllPopups(true);
            }

            me.popup.show(me._loc.title, popupContent);
            me.popup.createCloseIcon();
            const { backgroundColour, textColour } = mapmodule.getThemeColours();
            const popupCloseIcon = (mapmodule.getTheme() === 'dark') ? 'icon-close-white' : undefined;
            me.popup.setColourScheme({
                'bgColour': backgroundColour,
                'titleColour': textColour,
                'iconCls': popupCloseIcon
            });

            if (!Oskari.util.isMobile()) {
                me.popup.addClass('searchresult');
                me.popup.moveTo(me.getElement(), 'bottom', true);
            } else {
                me.popup.addClass('mobile-popup');
                me.popup.moveTo(me.getElement(), 'bottom', true, mapmodule.getMobileDiv());
                me.popup.getJqueryContent().parent().parent().css('left', 0);
            }
        },

        /**
         * @private @method _resultClicked
         * Click event handler for search result HTML table rows.
         * Parses paramStr and sends out Oskari.mapframework.request.common.MapMoveRequest
         *
         * @param {Object} result
         */
        _resultClicked: function (result) {
            var zoom = result.zoomLevel;
            if (result.zoomScale) {
                zoom = { scale: result.zoomScale };
            }
            this.getSandbox().request(
                this.getName(),
                Oskari.requestBuilder(
                    'MapMoveRequest'
                )(result.lon, result.lat, zoom)
            );
            this._setMarker(result);
        },

        /**
         * @method _enableSearch
         * Resets the 'search in progress' flag and removes the loading icon
         * @private
         */
        _enableSearch: function () {
            this._searchInProgess = false;
            jQuery('#search-string').removeClass('search-loading');
        },

        /**
         * @private @method _hideSearch
         * Hides the search result and sends out MapModulePlugin.RemoveMarkersRequest
         */
        _hideSearch: function () {
            var me = this;
            me.getElement().find('div.results').hide();
            // Send hide marker request
            // This is done just so the user can get rid of the marker somehow...
            var requestBuilder = Oskari.requestBuilder('MapModulePlugin.RemoveMarkersRequest');
            if (!requestBuilder) {
                return;
            }
            me.getSandbox().request(
                me.getName(),
                requestBuilder(me._searchMarkerId)
            );
        },
        /**
         * Changes the tool style of the plugin
         *
         * @method changeToolStyle
         * @param {Object} style
         * @param {jQuery} div
         */
        changeToolStyle: function (style, div) {
            var me = this;
            div = div || me.getElement();
            if (!div) {
                return;
            }

            if (!style) {
                style = this.toolStyles['default'];
            } if (!style.hasOwnProperty('widthLeft')) {
                style = this.toolStyles[style] ? this.toolStyles[style] : this.toolStyles['default'];
            }

            // Set the correct template for the style... ugly.
            // FIXME use the same HTML for both of these so we don't have to muck about with the DOM
            if (style.val === null) {
                // hackhack
                var conf = me.getConfig();
                conf.toolStyle = null;
                me._config = conf;
                div.removeClass('published-search-div').addClass(
                    'default-search-div'
                );

                div.empty();
                me.template.children().clone().appendTo(div);
                me._inputField = div.find('input[type=text]');
                me._searchButton = div.find('input[type=button]');
                me._bindUIEvents(div);
                me._setLayerToolsEditMode(
                    me.getMapModule().isInLayerToolsEditMode()
                );

                return;
            }

            // Remove the old unstyled search box and create a new one.
            if (div.hasClass('default-search-div')) {
                // hand replace with styled version so we don't destroy this.element
                div.removeClass('default-search-div').addClass(
                    'published-search-div'
                );

                div.empty();
                me.styledTemplate.children().clone().appendTo(div);
                me._inputField = div.find('input[type=text]');
                me._searchButton = div.find('input[type=button]');
                me._bindUIEvents(div);
            }

            var styleName = style.val,
                bgLeft = this.getMapModule().getImageUrl('search-tool-' + styleName + '_01.png'),
                bgMiddle = this.getMapModule().getImageUrl('search-tool-' + styleName + '_02.png'),
                bgRight = this.getMapModule().getImageUrl('search-tool-' + styleName + '_03.png'),
                left = div.find('div.search-left'),
                middle = div.find('div.search-middle'),
                right = div.find('div.search-right'),
                closeResults = middle.find('div.close-results'),
                inputField = div.find('input.search-input');

            left.css({
                'background-image': 'url("' + bgLeft + '")',
                'width': style.widthLeft + 'px'
            });
            right.css({
                'background-image': 'url("' + bgRight + '")',
                'width': style.widthRight + 'px'
            });
            // calculate the width for the middle container of the search
            var middleWidth = parseInt(jQuery('.search-area-div').css('width')) - style.widthLeft - style.widthRight;
            middle.css({
                'background-image': 'url("' + bgMiddle + '")',
                'background-repeat': 'repeat-x',
                'width': middleWidth + 'px'
            });
            jQuery('.search-area-div').css('width', parseInt(left.outerWidth() + middleWidth + right.outerWidth()) + 'px');
            closeResults.removeClass('icon-close icon-close-white');

            // Change the font colour to whitish and the close icon to white
            // if the style is dark themed
            if (/dark/.test(styleName)) {
                closeResults.addClass('icon-close-white');
                closeResults.css({
                    'margin-top': '10px'
                });
                inputField.css({
                    'color': '#ddd'
                });
            } else {
                closeResults.addClass('icon-close');
                closeResults.css({
                    'margin-top': '10px'
                });
                inputField.css({
                    'color': ''
                });
            }

            me._setLayerToolsEditMode(
                me.getMapModule().isInLayerToolsEditMode()
            );
        },

        /**
         * @method changeFont
         * Changes the font used by plugin by adding a CSS class to its DOM elements.
         *
         * @param {String} fontId
         * @param {jQuery} div
         *
         */
        changeFont: function (fontId, div) {
            div = div || this.getElement();

            if (!div || !fontId) {
                return;
            }

            // The elements where the font style should be applied to.
            var elements = [];
            elements.push(div.find('table.search-results'));
            elements.push(div.find('input'));

            var classToAdd = 'oskari-publisher-font-' + fontId,
                testRegex = /oskari-publisher-font-/;
            this.changeCssClasses(classToAdd, testRegex, elements);
        },

        /**
         * @method changeResultListStyle
         * Changes the style of the search result list.
         *
         * @param  {Object} toolStyle
         * @param  {jQuery} div
         *
         * @return {undefined}
         */
        changeResultListStyle: function (toolStyle, div) {
            var cssClass = 'oskari-publisher-search-results-' + toolStyle.val,
                testRegex = /oskari-publisher-search-results-/;

            this.changeCssClasses(cssClass, testRegex, [div]);
        },

        teardownUI: function () {
            if (this.popup) {
                this.popup.close();
            }
        },
        /**
        * @method _stopPluginImpl
        * Interface method for the plugin protocol.
        * Should unregisters requesthandlers and
        * eventlisteners.
        *
        *
        */
        _stopPluginImpl: function (sandbox) {
            var me = this;
            // Remove search results
            if (me.popup) {
                me.popup.close();
                me.popup = null;
            }
            this.removeFromPluginContainer(this.getElement());
        },
        /**
         * Handle plugin UI and change it when desktop / mobile mode
         * @method  @public redrawUI
         * @param {Boolean} mapInMobileMode is map in mobile mode
         * @param {Boolean} modeChanged is the ui mode changed (mobile/desktop)
         */
        redrawUI: function (mapInMobileMode, modeChanged) {
            var isMobile = mapInMobileMode || Oskari.util.isMobile();
            if (!this.isVisible()) {
                // no point in drawing the ui if we are not visible
                return;
            }
            var me = this;
            if (!me.getElement()) {
                me._element = me._createControlElement();
            }

            // remove old element
            this.teardownUI();

            if (isMobile) {
                // remove old element
                this.removeFromPluginContainer(this.getElement(), true);

                var mobileDivElement = me.getMapModule().getMobileDiv();
                me._element.addClass('mobilesearch');
                // FIXME is index is not first then this fails
                mobileDivElement.prepend(me._element[0]);
                me._uiMode = 'mobile';
                me.changeToolStyle('rounded-light', me._element);
                me._element.find('div.close-results').remove();
                me._element.find('input.search-input').css({
                    'height': '26px',
                    'margin': 'auto'
                });
            } else {
                me._element.removeClass('mobilesearch');

                var conf = me.getConfig();
                if (conf) {
                    if (conf.toolStyle) {
                        me.changeToolStyle(conf.toolStyle, me._element);
                    } else {
                        var toolStyle = me.getToolStyleFromMapModule();
                        if (toolStyle !== null && toolStyle !== undefined) {
                            me.changeToolStyle(me.toolStyles[toolStyle], me._element);
                        } else {
                            me.changeToolStyle(me.toolStyles['default'], me._element);
                        }
                    }
                }

                this.addToPluginContainer(me._element);
                me.refresh();
            }
        }
    }, {
        'extend': ['Oskari.mapping.mapmodule.plugin.BasicMapModulePlugin'],
        /**
         * @static @property {string[]} protocol array of superclasses
         */
        'protocol': [
            'Oskari.mapframework.module.Module',
            'Oskari.mapframework.ui.module.common.mapmodule.Plugin'
        ]
    });
