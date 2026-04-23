import React, { useState } from 'react';
import { Table, Tag, Space, Button, Select, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Order {
  id: string;
  userId: string;
  productName: string;
  quantity: number;
  totalPoints: number;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  receiverName: string;
  phone: string;
  createdAt: string;
}

export default function OrderList() {
  const [loading] = useState(false);
  const [data] = useState<Order[]>([]);

  const handleUpdateStatus = async (id: string, status: string) => {
    // TODO: 调用 API
    message.success('状态更新成功');
  };

  const columns: ColumnsType<Order> = [
    { title: '订单号', dataIndex: 'id', key: 'id', width: 100, ellipsis: true },
    { title: '商品', dataIndex: 'productName', key: 'productName' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '积分', dataIndex: 'totalPoints', key: 'totalPoints' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const map: Record<string, { color: string; label: string }> = {
          pending: { color: 'orange', label: '待发货' },
          paid: { color: 'blue', label: '已支付' },
          shipped: { color: 'cyan', label: '已发货' },
          completed: { color: 'green', label: '已完成' },
          cancelled: { color: 'default', label: '已取消' },
        };
        return <Tag color={map[status]?.color}>{map[status]?.label}</Tag>;
      },
    },
    { title: '收货人', dataIndex: 'receiverName', key: 'receiverName' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <Button type="link" size="small" onClick={() => handleUpdateStatus(record.id, 'shipped')}>
              发货
            </Button>
          )}
          <Button type="link" size="small">详情</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>订单管理</h2>
      <div style={{ marginBottom: 16 }}>
        <Select
          placeholder="筛选状态"
          style={{ width: 150 }}
          allowClear
          options={[
            { label: '待发货', value: 'pending' },
            { label: '已发货', value: 'shipped' },
            { label: '已完成', value: 'completed' },
          ]}
        />
      </div>
      <Table columns={columns} dataSource={data} loading={loading} rowKey="id" />
    </div>
  );
}