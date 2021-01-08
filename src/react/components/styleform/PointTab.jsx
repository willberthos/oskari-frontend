import React from 'react';
import PropTypes from 'prop-types';
import { SvgRadioButton, Preview, SizeControl, ColorPicker, Message } from 'oskari-ui';
import { Form, Row } from 'antd';

const markers = [
    {
        offsetX: 14.06,
        offsetY: 5.38,
        data: '<svg width="32" height="32"><path fill="#000000" stroke="#000000" d="m 17.662202,6.161625 c -2.460938,-0.46875 -4.101563,-0.234375 -4.921875,0.585937 -0.234375,0.234376 -0.234375,0.468751 -0.117188,0.820313 0.234375,0.585938 0.585938,1.171875 1.054688,2.109375 0.46875,0.9375 0.703125,1.523438 0.820312,1.757813 -0.351562,0.351562 -1.054687,1.054687 -2.109375,1.992187 -1.523437,1.40625 -1.523437,1.40625 -2.226562,2.109375 -0.8203126,0.820312 -0.117188,1.757812 2.109375,2.8125 0.9375,0.46875 1.992187,0.820312 3.046875,0.9375 2.695312,0.585937 4.570312,0.351562 5.742187,-0.585938 0.351563,-0.351562 0.46875,-0.703125 0.351563,-1.054687 0,0 -1.054688,-2.109375 -1.054688,-2.109375 -0.46875,-1.054688 -0.46875,-1.171875 -0.9375,-2.109375 -0.351562,-0.703125 -0.46875,-1.054687 -0.585937,-1.289062 0.234375,-0.234375 0.234375,-0.351563 1.289062,-1.289063 1.054688,-0.9375 1.054688,-0.9375 1.757813,-1.640625 0.703125,-0.585937 0.117187,-1.40625 -1.757813,-2.34375 -0.820312,-0.351563 -1.640625,-0.585938 -2.460937,-0.703125 0,0 0,0 0,0 M 14.615327,26.0835 c 0,0 1.054687,-5.625 1.054687,-5.625 0,0 -1.40625,-0.234375 -1.40625,-0.234375 0,0 -1.054687,5.859375 -1.054687,5.859375 0,0 1.40625,0 1.40625,0 0,0 0,0 0,0" /></svg>'
    }, {
        offsetX: 16,
        offsetY: 6.84,
        data: '<svg width="32" height="32"><path fill="#000000" stroke="#000000" d="m 22.20134,7.4273516 c 0,0 -12.40234,0 -12.40234,0 0,0 0,12.3046904 0,12.3046904 0,0 3.41797,0 3.41797,0 0,0 2.73437,4.39453 2.73437,4.39453 0,0 2.73438,-4.39453 2.73438,-4.39453 0,0 3.51562,0 3.51562,0 0,0 0,-12.3046904 0,-12.3046904 0,0 0,0 0,0"/></svg>'
    }, {
        offsetX: 16,
        offsetY: 5.19,
        data: '<svg width="32" height="32"><path fill="#000000" stroke="#000000" d="m 16.00025,5.7495486 c -1.99219,0 -3.51562,0.58594 -4.92187,1.99219 C 9.67213,9.1479886 8.969,10.788619 8.969,12.780799 c 0,1.17188 0.58594,2.8125 1.75781,5.03907 1.17188,2.22656 2.34375,4.10156 3.51563,5.625 0,0 1.75781,2.46093 1.75781,2.46093 4.6875,-6.21093 7.03125,-10.54687 7.03125,-13.125 0,-1.99218 -0.70312,-3.6328104 -2.10937,-5.0390604 -1.40625,-1.40625 -2.92969,-1.99219 -4.92188,-1.99219 0,0 0,0 0,0 m 0,9.9609404 c -0.82031,0 -1.40625,-0.23437 -1.99219,-0.82031 -0.58593,-0.58594 -0.82031,-1.17188 -0.82031,-1.99219 0,-0.82031 0.23438,-1.52344 0.82031,-2.10937 0.58594,-0.58594 1.17188,-0.8203204 1.99219,-0.8203204 0.82031,0 1.52344,0.2343804 2.10938,0.8203204 0.58593,0.58593 0.82031,1.28906 0.82031,2.10937 0,0.82031 -0.23438,1.40625 -0.82031,1.99219 -0.58594,0.58594 -1.28907,0.82031 -2.10938,0.82031 0,0 0,0 0,0"/></svg>'
    }, {
        offsetX: 12.74,
        offsetY: 5.63,
        data: '<svg width="32" height="32"><path fill="#000000" stroke="#000000" d="m 13.48113,25.7265 c 0,0 1.99218,-8.3203 1.99218,-8.3203 0,0 -1.40625,-0.2344 -1.40625,-0.2344 0,0 -1.99218,8.5547 -1.99218,8.5547 0,0 1.40625,0 1.40625,0 0,0 0,0 0,0 M 10.903,11.3124 c 0,1.4063 0.46875,2.5782 1.40625,3.6329 0.9375,1.0546 2.22656,1.5234 3.63281,1.5234 1.40625,0 2.57813,-0.4688 3.63282,-1.5234 1.05468,-1.0547 1.52343,-2.2266 1.52343,-3.6329 0,-1.4062 -0.46875,-2.5781 -1.52343,-3.5156 -1.05469,-0.9375 -2.22657,-1.5234 -3.63282,-1.5234 -1.40625,0 -2.69531,0.5859 -3.63281,1.5234 -0.9375,0.9375 -1.40625,2.1094 -1.40625,3.5156 0,0 0,0 0,0"/></svg>'
    }, {
        offsetX: 20.12,
        offsetY: 5.41,
        data: '<svg width="32" height="32"><g transform="translate(1.2364754,0.92819)"><path fill="#000000" stroke="#000000" d="m 19.50313,25.03281 c 0,0 4.80468,-19.80468 4.80468,-19.80468 0,0 -1.52343,0 -1.52343,0 0,0 -4.6875,19.80468 -4.6875,19.80468 0,0 1.40625,0 1.40625,0 0,0 0,0 0,0 M 8.01875,5.11094 c 0,0 2.10938,5.27344 2.10938,5.27344 0,0 -4.45313,5.15625 -4.45313,5.15625 0,0 13.47656,0 13.47656,0 0,0 2.46094,-10.42969 2.46094,-10.42969 0,0 -13.59375,0 -13.59375,0 0,0 0,0 0,0"/></g></svg>'
    }, {
        data: '<svg width="32" height="32"><path fill="#000000" stroke="#000000" d="m 8.969,15.99975 c 0,1.99219 0.70313,3.51563 2.10938,4.92188 1.40625,1.40625 2.92968,2.10937 4.92187,2.10937 1.99219,0 3.51563,-0.70312 4.92188,-2.10937 1.40625,-1.40625 2.10937,-2.92969 2.10937,-4.92188 0,-1.99219 -0.70312,-3.51562 -2.10937,-4.92187 C 19.51588,9.67163 17.99244,8.9685 16.00025,8.9685 c -1.99219,0 -3.51562,0.70313 -4.92187,2.10938 -1.40625,1.40625 -2.10938,2.92968 -2.10938,4.92187 0,0 0,0 0,0"/></svg>'
    }, {
        offsetX: 16,
        offsetY: 5.41,
        data: '<svg width="32" height="32"><path fill="#000000" stroke="#000000" d="m 19.280933,16.92943 c 0,0 0,-10.8984403 0,-10.8984403 0,0 -6.5625,0 -6.5625,0 0,0 0,10.8984403 0,10.8984403 0,0 -4.5703104,0 -4.5703104,0 0,0 7.8515604,8.78906 7.8515604,8.78906 0,0 7.85156,-8.78906 7.85156,-8.78906 0,0 -4.57031,0 -4.57031,0 0,0 0,0 0,0"/></svg>'
    }
];

export const PointTab = (props) => {
    console.log('point props');
    console.log(props);
    return (
        <React.Fragment>
            <Row>
                <Form.Item
                    { ...props.formLayout }
                    name='stroke.color'
                    label={ <Message bundleKey={ props.locSettings.localeKey } messageKey='VisualizationForm.point.color.label' /> }
                >
                    <ColorPicker
                        defaultValue={ props.styleSettings.stroke.color }
                    />
                </Form.Item>

                <Form.Item
                    { ...props.formLayout }
                    name='fill.color'
                    label={ <Message bundleKey={ props.locSettings.localeKey } messageKey='VisualizationForm.point.fillcolor.label' /> }
                >
                    <ColorPicker
                        defaultValue={ props.styleSettings.fill.color }
                    />
                </Form.Item>
            </Row>

            <Row>
                <Form.Item
                    { ...props.formLayout }
                    name='image.shape'
                    label={ <Message bundleKey={ props.locSettings.localeKey } messageKey='VisualizationForm.point.symbol.label' /> }
                >
                    <SvgRadioButton
                        options={ markers }
                        defaultValue={ props.styleSettings.image.shape }
                    />
                </Form.Item>
            </Row>

            <Row>
                <SizeControl
                    formLayout={ props.formLayout }
                    format={ props.styleSettings.format }
                    locSettings={ props.locSettings }
                    name='image.size'
                />
            </Row>

            <Row>
                <Preview
                    markers={ markers }
                    styleSettings={ props.styleSettings }
                />
            </Row>

        </React.Fragment>
    );
};

PointTab.propTypes = {
    styleSettings: PropTypes.object.isRequired,
    formLayout: PropTypes.object.isRequired,
    locSettings: PropTypes.object.isRequired
};
