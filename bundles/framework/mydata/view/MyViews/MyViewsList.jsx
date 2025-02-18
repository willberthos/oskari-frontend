import React from 'react';
import PropTypes from 'prop-types';
import { Table, getSorterFor, ToolsContainer } from 'oskari-ui/components/Table';
import { Message, Checkbox } from 'oskari-ui';
import { EditOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { IconButton, DeleteButton } from 'oskari-ui/components/buttons';

const EDIT_ICON_STYLE = {
    fontSize: '16px'
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

export const MyViewsList = ({ controller, loading, data = [] }) => {

    const columnSettings = [
        {
            align: 'left',
            title: <Message messageKey='tabs.myviews.grid.default' />,
            dataIndex: 'isDefault',
            width: 60,
            render: (title, item) => {
                return (
                    <Checkbox checked={item.isDefault} onChange={() => controller.setDefaultView(item)} />
                )
            }
        },
        {
            align: 'left',
            title: <Message messageKey='tabs.myviews.grid.name' />,
            dataIndex: 'name',
            sorter: getSorterFor('name'),
            defaultSortOrder: 'ascend',
            render: (title, item) => {
                return (
                    <a onClick={() => controller.openView(item)}>{title}</a>
                )
            }
        },
        {
            align: 'left',
            title: <Message messageKey='tabs.myviews.grid.description' />,
            dataIndex: 'description',
            sorter: getSorterFor('description')
        },
        {
            align: 'left',
            title: <Message messageKey='tabs.myviews.grid.createDate' />,
            dataIndex: 'created',
            sorter: getSorterFor('created'),
            width: 135,
            render: title => Oskari.util.formatDate(title)
        },
        {
            align: 'left',
            title: <Message messageKey='tabs.myviews.grid.actions' />,
            dataIndex: 'id',
            width: 100,
            render: (title, item) => {
                return (
                    <ToolsContainer>
                        <IconButton
                            className='t_edit'
                            title={<Message messageKey='tabs.myviews.grid.edit' />}
                            icon={<EditOutlined style={EDIT_ICON_STYLE} />}
                            onClick={() => controller.editView(item)}
                        />
                        <DeleteButton
                            type='icon'
                            title={<Message messageKey='tabs.myviews.popup.deletemsg' messageArgs={{ name: item.name }} />}
                            onConfirm={() => controller.deleteView(item)}
                        />
                    </ToolsContainer>
                )
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
            loading={loading}
        />
    )
}

MyViewsList.propTypes = {
    controller: PropTypes.object.isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
    loading: PropTypes.bool.isRequired
}
