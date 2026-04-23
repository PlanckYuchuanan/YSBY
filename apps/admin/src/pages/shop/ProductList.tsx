import React, { useState } from 'react';
import { Table, Tag, Space, Button, Input, Modal, Form, InputNumber, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  status: 'draft' | 'published' | 'offline';
  createdAt: string;
}

export default function ProductList() {
  const [loading] = useState(false);
  const [data] = useState<Product[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    // TODO: 调用 API
    message.success('创建成功');
    setModalVisible(false);
    form.resetFields();
  };

  const columns: ColumnsType<Product> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 100, ellipsis: true },
    { title: '商品名称', dataIndex: 'name', key: 'name' },
    { title: '价格(积分)', dataIndex: 'price', key: 'price' },
    { title: '库存', dataIndex: 'stock', key: 'stock' },
    { title: '分类', dataIndex: 'category', key: 'category' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const map: Record<string, { color: string; label: string }> = {
          draft: { color: 'default', label: '草稿' },
          published: { color: 'green', label: '已发布' },
          offline: { color: 'red', label: '已下架' },
        };
        return <Tag color={map[status]?.color}>{map[status]?.label}</Tag>;
      },
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small" danger>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>商品管理</h2>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setModalVisible(true)}>
          添加商品
        </Button>
      </div>
      <Table columns={columns} dataSource={data} loading={loading} rowKey="id" />

      <Modal
        title="添加商品"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="商品名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="价格(积分)" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock" label="库存" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}