import React from 'react';
import PropTypes from 'prop-types';
import { Table, getSorterFor, ToolsContainer } from 'oskari-ui/components/Table';
import { Message, Confirm } from 'oskari-ui';
import styled from 'styled-components';
import { LOCALE_KEY } from './constants';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { red } from '@ant-design/colors'

const DELETE_ICON_STYLE = {
    fontSize: '14px',
    color: red.primary
};

const EDIT_ICON_STYLE = {
    fontSize: '14px'
};

const StyledTable = styled(Table)`
    tr {
        th {
            padding: 8px 8px;
        }
        td {
            padding: 8px;
        }
    }
`;

export const MyPlacesList = ({data = [], handleDelete, handleEdit, showPlace, getGeometryIcon}) => {

    const columnSettings = [
        {
            align: 'left',
            title: <Message messageKey='tab.grid.name' bundleKey={LOCALE_KEY} />,
            dataIndex: ['properties', 'name'],
            sorter: (a, b) => a.properties.name.localeCompare(b.properties.name),
            defaultSortOrder: 'ascend',
            render: (title, item) => {
                const shape = getGeometryIcon(item.geometry);
                return (
                    <a onClick={() => showPlace(item.geometry, item.categoryId)}>
                        <div className={`icon myplaces-${shape}`} />
                        <span>{title}</span>
                    </a>
                );
            }
        },
        {
            align: 'left',
            title: <Message messageKey='tab.grid.desc' bundleKey={LOCALE_KEY} />,
            dataIndex: ['properties', 'description'],
            sorter: (a, b) => a.properties.description.localeCompare(b.properties.description)
        },
        {
            align: 'left',
            title: <Message messageKey='tab.grid.createDate' bundleKey={LOCALE_KEY} />,
            dataIndex: 'createDate',
            sorter: getSorterFor('createDate')
        },
        {
            align: 'left',
            title: <Message messageKey='tab.grid.updateDate' bundleKey={LOCALE_KEY} />,
            dataIndex: 'updateDate',
            sorter: getSorterFor('updateDate')
        },
        {
            align: 'left',
            title: <Message messageKey='tab.grid.measurement' bundleKey={LOCALE_KEY} />,
            dataIndex: 'measurement',
            sorter: getSorterFor('measurement')
        },
        {
            align: 'left',
            title: <Message messageKey='tab.grid.actions' bundleKey={LOCALE_KEY} />,
            dataIndex: 'id',
            render: (title, item) => {
                return (
                    <ToolsContainer>
                        <div className='icon t_edit' onClick={() => handleEdit(item)}>
                            <EditOutlined style={ EDIT_ICON_STYLE } />
                        </div>
                        <Confirm
                            title={<Message messageKey='tab.notification.delete.confirm' messageArgs={{ name: item.properties.name }} bundleKey={LOCALE_KEY} />}
                            onConfirm={() => handleDelete(item)}
                            okText={<Message messageKey='buttons.ok' bundleKey={LOCALE_KEY} />}
                            cancelText={<Message messageKey='buttons.cancel' bundleKey={LOCALE_KEY} />}
                            placement='bottomLeft'
                        >
                            <div className='icon t_delete'><DeleteOutlined style={ DELETE_ICON_STYLE } /></div>
                        </Confirm>
                    </ToolsContainer>
                );
            }
        }
    ];

    return (
        <StyledTable
            columns={columnSettings}
            dataSource={data.map(item => ({
                key: item.id,
                ...item
            }))}
            pagination={false}
        />
    )
}

MyPlacesList.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    handleDelete: PropTypes.func.isRequired,
    handleEdit: PropTypes.func.isRequired,
    showPlace: PropTypes.func.isRequired,
    getGeometryIcon: PropTypes.func.isRequired
};
