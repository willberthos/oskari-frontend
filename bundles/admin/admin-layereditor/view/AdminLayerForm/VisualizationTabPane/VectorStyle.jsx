import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { VectorStyleSelect } from './VectorStyle/VectorStyleSelect';
import { VectorNameInput } from './VectorStyle/VectorNameInput';
import { LocaleConsumer, Controller } from 'oskari-ui/util';
import { Button, Message, Space } from 'oskari-ui';
import { PlusOutlined } from '@ant-design/icons';
import { Modal } from 'oskari-ui/components/Modal';
import { StyleEditor } from 'oskari-ui/components/StyleEditor';
import styled from 'styled-components';

const FullWidthSpace = styled(Space)`
    & {
        padding: 5px 0 10px;
        width: 100%;
    }
`;

const hasValidName = (name) => {
    return name.length > 0;
};

export const VectorStyle = LocaleConsumer((props) => {
    const newStyleName = props.getMessage('styles.vector.newStyleName');
    const [editorState, setEditorState] = useState({
        modalVisibility: false,
        currentStyle: {},
        styleId: '',
        styleName: newStyleName,
        originalName: '',
        validates: false
    });

    const saveStyle = () => props.controller.saveStyleToLayer(editorState.currentStyle, editorState.styleName, editorState.styleId);
    const onModalCancel = () => setEditorState({ ...editorState, modalVisibility: false });
    const resetNewStyle = () => setEditorState({ ...editorState, styleId: '', styleName: newStyleName, originalName: '', currentStyle: {}, modalVisibility: true });
    const setName = (name) => setEditorState({ ...editorState, styleName: name });
    const onModalOk = () => {
        if (hasValidName(editorState.styleName)) {
            saveStyle();
            setEditorState({ ...editorState, modalVisibility: false });
        }
    };

    return (
        <FullWidthSpace direction='vertical'>
            <Button onClick={ resetNewStyle }>
                <PlusOutlined />
                <Message messageKey="styles.vector.addStyle" />
            </Button>

            <Modal
                visible={ editorState.modalVisibility }
                onOk={ onModalOk }
                onCancel={ onModalCancel }
                cancelText={ <Message messageKey="cancel" /> }
                okText={ <Message messageKey="save" /> }
                width={ 620 }
            >
                <VectorNameInput
                    styleName={ editorState.styleName }
                    isValid={ hasValidName(editorState.styleName) }
                    onChange={ setName }
                    nameFieldHeader={ <Message messageKey={ 'styles.vector.name' } /> }
                    validationErrorMessage={ <Message messageKey='styles.vector.validation.name' /> }
                />

                <StyleEditor
                    oskariStyle={ editorState.currentStyle }
                    onChange={ (style) => setEditorState({ ...editorState, currentStyle: style })}
                />
            </Modal>

            <VectorStyleSelect
                layer={ props.layer }
                controller={ props.controller }
                editStyleCallback={ (styleId) => {
                    setEditorState({
                        modalVisibility: true,
                        styleName: props.layer.options.styles[styleId].title || styleId,
                        styleId: styleId,
                        currentStyle: props.layer.options.styles[styleId].featureStyle
                    });
                } }
            />
        </FullWidthSpace>
    );
});

VectorStyle.propTypes = {
    layer: PropTypes.object.isRequired,
    controller: PropTypes.instanceOf(Controller).isRequired
};
