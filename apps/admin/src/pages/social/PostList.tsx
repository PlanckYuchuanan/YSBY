import React, { useState } from 'react';
import { Table, Tag, Space, Button, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Post {
  id: string;
  title: string;
  nickname: string;
  likeCount: number;
  commentCount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function PostList() {
  const [loading] = useState(false);
  const [data] = useState<Post[]>([]);

  const handleDelete = async (id: string) => {
    // TODO: 调用 API
    message.success('删除成功');
  };

  const columns: ColumnsType<Post> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 100, ellipsis: true },
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '作者', dataIndex: 'nickname', key: 'nickname' },
    { title: '点赞', dataIndex: 'likeCount', key: 'likeCount' },
    { title: '评论', dataIndex: 'commentCount', key: 'commentCount' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const map: Record<string, { color: string; label: string }> = {
          pending: { color: 'orange', label: '待审核' },
          approved: { color: 'green', label: '已通过' },
          rejected: { color: 'red', label: '已拒绝' },
        };
        return <Tag color={map[status]?.color}>{map[status]?.label}</Tag>;
      },
    },
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">查看</Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>帖子管理</h2>
      <div style={{ marginBottom: 16 }}>
        <Input.Search placeholder="搜索帖子标题" style={{ width: 300 }} />
      </div>
      <Table columns={columns} dataSource={data} loading={loading} rowKey="id" />
    </div>
  );
}