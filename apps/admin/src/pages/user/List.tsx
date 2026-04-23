import React, { useState } from 'react';
import { Table, Tag, Space, Button, Input, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface User {
  id: string;
  nickname: string;
  phone: string;
  points: number;
  status: 'active' | 'banned';
  createdAt: string;
}

export default function UserList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);

  // TODO: 加载用户数据
  // useEffect(() => {
  //   loadUsers();
  // }, []);

  const handleBan = (user: User) => {
    Modal.confirm({
      title: '确认封禁',
      content: `确定封禁用户 ${user.nickname} 吗？`,
      onOk: async () => {
        message.success('操作成功');
        // TODO: 调用 API
      },
    });
  };

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      ellipsis: true,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '已封禁'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">
            查看详情
          </Button>
          {record.status === 'active' && (
            <Button
              type="link"
              size="small"
              danger
              onClick={() => handleBan(record)}
            >
              封禁
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>用户管理</h2>

      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索用户昵称或手机号"
          style={{ width: 300 }}
          onSearch={(value) => console.log(value)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
}