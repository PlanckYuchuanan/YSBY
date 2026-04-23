import React, { useState } from 'react';
import { Table, Tag, Space, Button, Input, Select, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Video {
  id: string;
  title: string;
  nickname: string;
  viewCount: number;
  likeCount: number;
  status: 'pending' | 'approved' | 'rejected';
  points: number;
  createdAt: string;
}

export default function VideoList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Video[]>([]);

  const handleApprove = async (id: string) => {
    try {
      // TODO: 调用 API
      message.success('审核通过');
    } catch {
      message.error('操作失败');
    }
  };

  const handleReject = async (id: string) => {
    try {
      // TODO: 调用 API
      message.success('已拒绝');
    } catch {
      message.error('操作失败');
    }
  };

  const columns: ColumnsType<Video> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      ellipsis: true,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '作者',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '播放量',
      dataIndex: 'viewCount',
      key: 'viewCount',
    },
    {
      title: '点赞数',
      dataIndex: 'likeCount',
      key: 'likeCount',
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
      render: (status) => {
        const map: Record<string, { color: string; label: string }> = {
          pending: { color: 'orange', label: '待审核' },
          approved: { color: 'green', label: '已通过' },
          rejected: { color: 'red', label: '已拒绝' },
        };
        const item = map[status] || map.pending;
        return <Tag color={item.color}>{item.label}</Tag>;
      },
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Button type="link" size="small" onClick={() => handleApprove(record.id)}>
                通过
              </Button>
              <Button type="link" size="small" danger onClick={() => handleReject(record.id)}>
                拒绝
              </Button>
            </>
          )}
          <Button type="link" size="small">
            查看
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>视频管理</h2>

      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <Input.Search placeholder="搜索视频标题" style={{ width: 300 }} />
        <Select
          placeholder="筛选状态"
          style={{ width: 120 }}
          allowClear
          options={[
            { label: '待审核', value: 'pending' },
            { label: '已通过', value: 'approved' },
            { label: '已拒绝', value: 'rejected' },
          ]}
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