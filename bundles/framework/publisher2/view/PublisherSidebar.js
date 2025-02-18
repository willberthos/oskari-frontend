const hasSizeUpdateFn = panel => typeof panel.updateMapSize === 'function';
/**
 * @class Oskari.mapframework.bundle.publisher2.view.PublisherSidebar
 * Renders the publishers "publish mode" sidebar view where the user can make
 * selections regarading the map to publish.
 */
Oskari.clazz.define('Oskari.mapframework.bundle.publisher2.view.PublisherSidebar',

    /**
     * @static @method create called automatically on construction
     *
     * @param {Oskari.mapframework.bundle.publisher2.PublisherBundleInstance} instance
     * Reference to component that created this view
     * @param {Object} localization
     * Localization data in JSON format
     *
     */
    function (instance, localization, data) {
        var me = this;
        me.data = data;
        me.panels = [];
        me.instance = instance;
        me.template = jQuery(
            '<div class="basic_publisher">' +
            '  <div class="header">' +
            '    <div class="icon-close">' +
            '    </div>' +
            '    <h3></h3>' +
            '  </div>' +
            '  <div class="content">' +
            '  </div>' +
            '</div>');

        me.templates = {
            publishedGridTemplate: '<div class="publishedgrid"></div>'
        };

        me.templateButtonsDiv = jQuery('<div class="buttons"></div>');
        me.templateHelp = jQuery('<div class="help icon-info"></div>');
        me.templateData = jQuery(
            '<div class="data ">' +
            '  <input class="show-grid" type="checkbox"/>' +
            '  <label class="show-grid-label"></label>' + '<br />' +
            '  <input class="allow-classification" type="checkbox"/>' +
            '  <label class="allow-classification-label"></label>' +
            '</div>');

        me.normalMapPlugins = [];
        // additional bundles (=not map plugins) that were stopped when entering publisher
        me.stoppedBundles = [];

        me.loc = localization;
        me.accordion = null;

        me.maplayerPanel = null;
        me.mainPanel = null;

        me.latestGFI = null;

        me.progressSpinner = Oskari.clazz.create('Oskari.userinterface.component.ProgressSpinner');
    }, {
        /**
         * @method render
         * Renders view to given DOM element
         * @param {jQuery} container reference to DOM element this component will be
         * rendered to
         */
        render: function (container) {
            var me = this,
                content = me.template.clone();
            me.mainPanel = content;

            me.progressSpinner.insertTo(content);

            container.append(content);
            var contentDiv = content.find('div.content'),
                accordion = Oskari.clazz.create(
                    'Oskari.userinterface.component.Accordion'
                );
            me.accordion = accordion;

            // setup title based on new/edit
            var sidebarTitle = content.find('div.header h3');

            if (me.data.uuid) {
                sidebarTitle.append(me.loc.titleEdit);
            } else {
                sidebarTitle.append(me.loc.title);
            }
            // bind close from header (X)
            container.find('div.header div.icon-close').on(
                'click',
                function () {
                    me.cancel();
                }
            );

            // -- create panels --
            var genericInfoPanel = me._createGeneralInfoPanel();
            genericInfoPanel.getPanel().addClass('t_generalInfo');
            me.panels.push(genericInfoPanel);
            accordion.addPanel(genericInfoPanel.getPanel());

            var publisherTools = me._createToolGroupings(accordion);

            var mapPreviewPanel = me._createMapPreviewPanel(publisherTools.tools);
            mapPreviewPanel.getPanel().addClass('t_size');
            me.panels.push(mapPreviewPanel);
            accordion.addPanel(mapPreviewPanel.getPanel());

            var mapLayersPanel = me._createMapLayersPanel();
            mapLayersPanel.getPanel().addClass('t_layers');
            me.panels.push(mapLayersPanel);
            accordion.addPanel(mapLayersPanel.getPanel());

            // create panel for each tool group
            Object.keys(publisherTools.groups).forEach(group => {
                const tools = publisherTools.groups[group];
                const toolPanel = Oskari.clazz.create('Oskari.mapframework.bundle.publisher2.view.PanelMapTools',
                    group, tools, me.instance, me.loc
                );
                toolPanel.init(me.data);
                me.panels.push(toolPanel);
                const panel = toolPanel.getPanel();
                panel.addClass('t_tools');
                panel.addClass('t_' + group);
                accordion.addPanel(panel);
            });
            var toolLayoutPanel = me._createToolLayoutPanel(publisherTools.tools);
            toolLayoutPanel.getPanel().addClass('t_toollayout');
            me.panels.push(toolLayoutPanel);
            accordion.addPanel(toolLayoutPanel.getPanel());

            var layoutPanel = me._createLayoutPanel();
            layoutPanel.getPanel().addClass('t_style');
            me.panels.push(layoutPanel);
            accordion.addPanel(layoutPanel.getPanel());

            // -- render to UI and setup buttons --
            accordion.insertTo(contentDiv);
            contentDiv.append(me._getButtons());

            // disable keyboard map moving whenever a text-input is focused element
            var inputs = me.mainPanel.find('input[type=text]');
            inputs.on('focus', function () {
                me.instance.sandbox.postRequestByName(
                    'DisableMapKeyboardMovementRequest'
                );
            });
            inputs.on('blur', function () {
                me.instance.sandbox.postRequestByName(
                    'EnableMapKeyboardMovementRequest'
                );
            });
        },

        /**
        * Handles panels update map size changes
        * @method @private _handleMapSizeChange
        */
        _handleMapSizeChange: function () {
            this.panels
                .filter(hasSizeUpdateFn)
                .forEach(panel => panel.updateMapSize());
        },
        /**
         * @private @method _createGeneralInfoPanel
         * Creates the Location panel of publisher
         */
        _createGeneralInfoPanel: function () {
            var me = this;
            var sandbox = this.instance.getSandbox();
            var form = Oskari.clazz.create(
                'Oskari.mapframework.bundle.publisher2.view.PanelGeneralInfo',
                sandbox, me.loc
            );

            // initialize form (restore data when editing)
            form.init(me.data);

            // open generic info by default
            form.getPanel().open();
            return form;
        },

        /**
         * @private @method _createMapSizePanel
         * Creates the Map Sizes panel of publisher
         */
        _createMapPreviewPanel: function (publisherTools) {
            var me = this,
                sandbox = this.instance.getSandbox(),
                mapModule = sandbox.findRegisteredModuleInstance('MainMapModule'),
                form = Oskari.clazz.create('Oskari.mapframework.bundle.publisher2.view.PanelMapPreview',
                    sandbox, mapModule, me.loc, me.instance, publisherTools
                );

            // initialize form (restore data when editing)
            form.init(me.data, function (value) {});

            return form;
        },

        /**
         * @private @method _createMapLayersPanel
         * Creates the Maplayers panel of publisher
         */
        _createMapLayersPanel: function () {
            var me = this,
                sandbox = this.instance.getSandbox(),
                mapModule = sandbox.findRegisteredModuleInstance('MainMapModule'),
                form = Oskari.clazz.create('Oskari.mapframework.bundle.publisher2.view.PanelMapLayers',
                    sandbox, mapModule, me.loc, me.instance
                );

            // initialize form (restore data when editing)
            form.init(me.data, function (value) {});

            return form;
        },
        /**
         * @private @method _createToolLayoutPanel
         * Creates the tool layout panel of publisher
         * @param {Oskari.mapframework.publisher.tool.Tool[]} tools
         */
        _createToolLayoutPanel: function (tools) {
            var me = this,
                sandbox = this.instance.getSandbox(),
                mapModule = sandbox.findRegisteredModuleInstance('MainMapModule'),
                form = Oskari.clazz.create('Oskari.mapframework.bundle.publisher2.view.PanelToolLayout',
                    tools, sandbox, mapModule, me.loc, me.instance
                );

            // initialize form (restore data when editing)
            form.init(me.data, function (value) {});

            return form;
        },
        /**
         * @private @method _createLayoutPanel
         * Creates the layout panel of publisher
         */
        _createLayoutPanel: function () {
            var me = this,
                sandbox = this.instance.getSandbox(),
                mapModule = sandbox.findRegisteredModuleInstance('MainMapModule'),
                form = Oskari.clazz.create('Oskari.mapframework.bundle.publisher2.view.PanelLayout',
                    sandbox, mapModule, me.loc, me.instance
                );

            // initialize form (restore data when editing)
            form.init(me.data, function (value) {});

            return form;
        },
        /**
        * Get panel/tool handlers
        * @method getHandlers
        * @public
        */
        getHandlers: function () {
            var me = this;
            return {
                'MapSizeChanged': function () {
                    me._handleMapSizeChange();
                }
            };
        },

        /**
         * @private @method _createToolGroupings
         * Finds classes annotated as 'Oskari.mapframework.publisher.Tool'.
         * Determines tool groups from tools and creates tool panels for each group. Returns an object containing a list of panels and their tools as well as a list of
         * all tools, even those that aren't displayed in the tools' panels.
         *
         * @return {Object} Containing {Oskari.mapframework.bundle.publisher2.view.PanelMapTools[]} list of panels
         * and {Oskari.mapframework.publisher.tool.Tool[]} tools not displayed in panel
         */
        _createToolGroupings: function () {
            var me = this;
            var sandbox = this.instance.getSandbox();
            var mapmodule = sandbox.findRegisteredModuleInstance('MainMapModule');
            var definedTools = Oskari.clazz.protocol('Oskari.mapframework.publisher.Tool');
            var grouping = {};
            var allTools = [];
            // group tools per tool-group
            definedTools.forEach(toolname => {
                var tool = Oskari.clazz.create(toolname, sandbox, mapmodule, me.loc, me.instance, me.getHandlers());
                if (tool.isDisplayed(me.data) === true && tool.isShownInToolsPanel()) {
                    var group = tool.getGroup();
                    if (!grouping[group]) {
                        grouping[group] = [];
                    }
                    me._addToolConfig(tool);
                    grouping[group].push(tool);
                }

                if (tool.isDisplayed(me.data) === true) {
                    allTools.push(tool);
                }
            });
            return {
                groups: grouping,
                tools: allTools
            };
        },
        _addToolConfig: function (tool) {
            var conf = this.instance.conf || {};
            if (!conf.toolsConfig || !tool.bundleName) {
                return;
            }
            tool.toolConfig = conf.toolsConfig[tool.bundleName];
        },
        /**
        * Gather selections.
        * @method gatherSelections
        * @private
        */
        gatherSelections: function () {
            var me = this,
                sandbox = this.instance.getSandbox(),
                selections = {
                    configuration: {

                    }
                },
                errors = [];

            var mapFullState = sandbox.getStatefulComponents().mapfull.getState();
            selections.configuration.mapfull = {
                state: mapFullState
            };

            jQuery.each(me.panels, function (index, panel) {
                if (panel.validate && typeof panel.validate === 'function') {
                    errors = errors.concat(panel.validate());
                }

                jQuery.extend(true, selections, panel.getValues());
            });

            if (errors.length > 0) {
                me._showValidationErrorMessage(errors);
                return null;
            }
            return selections;
        },

        /**
         * @private @method _editToolLayoutOff
         *
         *
         */
        _editToolLayoutOff: function () {
            this.panels.forEach(function (panel) {
                if (typeof panel.stop === 'function') {
                    panel.stop();
                }
            });
        },
        /**
         * @method cancel
         * Closes publisher without saving
         */
        cancel: function () {
            this.instance.setPublishMode(false);
        },
        /**
         * @private @method _getButtons
         * Renders publisher buttons to DOM snippet and returns it.
         *
         *
         * @return {jQuery} container with buttons
         */
        _getButtons: function () {
            var me = this,
                buttonCont = me.templateButtonsDiv.clone(),
                cancelBtn = Oskari.clazz.create(
                    'Oskari.userinterface.component.buttons.CancelButton'
                );

            cancelBtn.setHandler(function () {
                me.cancel();
            });
            cancelBtn.insertTo(buttonCont);

            var saveBtn = Oskari.clazz.create(
                'Oskari.userinterface.component.buttons.SaveButton'
            );

            if (me.data.uuid) {
                var save = function () {
                    var selections = me.gatherSelections();
                    if (selections) {
                        me._editToolLayoutOff();
                        me._publishMap(selections);
                    }
                };
                saveBtn.setTitle(me.loc.buttons.saveNew);
                saveBtn.setHandler(function () {
                    me.data.uuid = null;
                    delete me.data.uuid;
                    save();
                });
                saveBtn.insertTo(buttonCont);

                var replaceBtn = Oskari.clazz.create(
                    'Oskari.userinterface.component.Button'
                );
                replaceBtn.setTitle(me.loc.buttons.replace);
                replaceBtn.addClass('primary');
                replaceBtn.setHandler(function () {
                    me._showReplaceConfirm(save);
                });
                replaceBtn.insertTo(buttonCont);
            } else {
                saveBtn.setTitle(me.loc.buttons.save);
                saveBtn.setHandler(function () {
                    var selections = me.gatherSelections();
                    if (selections) {
                        me._editToolLayoutOff();
                        me._publishMap(selections);
                    }
                });
                saveBtn.insertTo(buttonCont);
            }

            return buttonCont;
        },
        /**
         * @private @method _publishMap
         * Sends the gathered map data to the server to save them/publish the map.
         *
         * @param {Object} selections map data as returned by gatherSelections()
         *
         */
        _publishMap: function (selections) {
            var me = this,
                sandbox = me.instance.getSandbox(),
                totalWidth = '100%',
                totalHeight = '100%',
                errorHandler = function () {
                    me.progressSpinner.stop();
                    var dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup'),
                        okBtn = dialog.createCloseButton(me.loc.buttons.ok);
                    dialog.show(me.loc.error.title, me.loc.error.saveFailed, [okBtn]);
                };
            if (selections.metadata.size) {
                totalWidth = selections.metadata.size.width + 'px';
                totalHeight = selections.metadata.size.height + 'px';
            }

            me.progressSpinner.start();

            // make the ajax call
            jQuery.ajax({
                url: Oskari.urls.getRoute('AppSetup'),
                type: 'POST',
                dataType: 'json',
                data: {
                    publishedFrom: Oskari.app.getUuid(),
                    uuid: (me.data && me.data.uuid) ? me.data.uuid : undefined,
                    pubdata: JSON.stringify(selections)
                },
                success: function (response) {
                    me.progressSpinner.stop();
                    if (response.id > 0) {
                        var event = Oskari.eventBuilder(
                            'Publisher.MapPublishedEvent'
                        )(
                            response.id,
                            totalWidth,
                            totalHeight,
                            response.lang,
                            sandbox.createURL(response.url)
                        );

                        me._editToolLayoutOff();
                        sandbox.notifyAll(event);
                    } else {
                        errorHandler();
                    }
                },
                error: errorHandler
            });
        },

        /**
         * @method setEnabled
         * "Activates" the published map preview when enabled
         * and returns to normal mode on disable
         *
         * @param {Boolean} isEnabled true to enable preview, false to disable
         * preview
         *
         */
        setEnabled: function (isEnabled) {
            if (isEnabled) {
                this._enablePreview();
            } else {
                this._editToolLayoutOff();
                this._disablePreview();
            }
            var sb = this.instance.sandbox;
            var publisherTools = this._createToolGroupings();
            publisherTools.tools.forEach(function (tool) {
                var event = Oskari.eventBuilder('Publisher2.ToolEnabledChangedEvent')(tool);
                sb.notifyAll(event);
            });
        },

        /**
         * @private @method _enablePreview
         * Modifies the main map to show what the published map would look like
         *
         *
         */
        _enablePreview: function () {
            const sandbox = this.instance.sandbox;
            const mapModule = sandbox.findRegisteredModuleInstance('MainMapModule');
            Object.values(mapModule.getPluginInstances())
                .filter(plugin => plugin.hasUI && plugin.hasUI())
                .forEach(plugin => {
                    plugin.stopPlugin(sandbox);
                    mapModule.unregisterPlugin(plugin);
                    this.normalMapPlugins.push(plugin);
                });
        },

        /**
         * @private @method _disablePreview
         * Returns the main map from preview to normal state
         *
         */
        _disablePreview: function () {
            const sandbox = this.instance.sandbox;
            var mapModule = sandbox.findRegisteredModuleInstance('MainMapModule');

            // Remove plugins added during publishing session
            Object.values(mapModule.getPluginInstances())
                .filter(plugin => plugin.hasUI && plugin.hasUI())
                .forEach(plugin => {
                    plugin.stopPlugin(sandbox);
                    mapModule.unregisterPlugin(plugin);
                });

            // resume normal plugins
            this.normalMapPlugins.forEach(plugin => {
                mapModule.registerPlugin(plugin);
                plugin.startPlugin(sandbox);
                if (plugin.refresh) {
                    plugin.refresh();
                }
            });
            // reset listing
            this.normalMapPlugins = [];
        },
        /**
         * @private @method _showValidationErrorMessage
         * Takes an error array as defined by Oskari.userinterface.component.FormInput validate() and
         * shows the errors on a  Oskari.userinterface.component.Popup
         *
         * @param {Object[]} errors validation error objects to show
         *
         */
        _showValidationErrorMessage: function (errors) {
            var dialog = Oskari.clazz.create(
                    'Oskari.userinterface.component.Popup'
                ),
                okBtn = dialog.createCloseButton(this.loc.buttons.ok),
                content = jQuery('<ul></ul>'),
                i,
                row;

            for (i = 0; i < errors.length; i += 1) {
                row = jQuery('<li></li>');
                row.append(errors[i].error);
                content.append(row);
            }
            dialog.makeModal();
            dialog.show(this.loc.error.title, content, [okBtn]);
        },
        /**
         * @private @method _showReplaceConfirm
         * Shows a confirm dialog for replacing published map
         *
         * @param {Function} continueCallback function to call if the user confirms
         *
         */
        _showReplaceConfirm: function (continueCallback) {
            var dialog = Oskari.clazz.create(
                    'Oskari.userinterface.component.Popup'
                ),
                okBtn = Oskari.clazz.create(
                    'Oskari.userinterface.component.Button'
                );
            okBtn.setTitle(this.loc.buttons.replace);
            okBtn.addClass('primary');
            okBtn.setHandler(function () {
                dialog.close();
                continueCallback();
            });
            var cancelBtn = dialog.createCloseButton(this.loc.buttons.cancel);
            dialog.show(
                this.loc.confirm.replace.title,
                this.loc.confirm.replace.msg,
                [cancelBtn, okBtn]
            );
        },
        /**
         * @method destroy
         * Destroys/removes this view from the screen.
         */
        destroy: function () {
            this.mainPanel.remove();
            // Resets map position and size to cover the whole space. Maybe find another way to do this?
            jQuery('#contentMap').width('');
            jQuery('.oskariui-left')
                .css({
                    'width': '',
                    'height': '',
                    'float': ''
                })
                .empty();
            jQuery('.oskariui-center').css({
                'width': '100%',
                'float': ''
            });
        }
    });
