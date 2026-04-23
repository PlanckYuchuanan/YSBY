import React, { useState } from 'react';
import { Table, Button, Form, InputNumber, Switch, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface PointsRule {
  id: string;
  action: string;
  points: number;
  dailyLimit: number;
  enabled: boolean;
  description: string;
}

export default function PointsRules() {
  const [loading] = useState(false);
  const [data, setData] = useState<PointsRule[]>([
    { id: '1', action: 'watch_video', points: 10, dailyLimit: 50, enabled: true, description: '观看视频（完整观看一部视频）' },
    { id: '2', action: 'like', points: 1, dailyLimit: 30, enabled: true, description: '点赞' },
    { id: '3', action: 'comment', points: 2, dailyLimit: 20, enabled: true, description: '评论' },
    { id: '4', action: 'share', points: 5, dailyLimit: 10, enabled: true, description: '分享' },
    { id: '5', action: 'daily_login', points: 5, dailyLimit: 1, enabled: true, description: '每日登录' },
    { id: '6', action: 'sign_up', points: 100, dailyLimit: 1, enabled: true, description: '注册奖励' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<PointsRule | null>(null);
  const [form] = Form.useForm();

  const handleEdit = (record: PointsRule) => {
    setEditingRule(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSave = async (values: any) => {
    // TODO: 调用 API
    message.success('保存成功');
    setModalVisible(false);
    if (editingRule) {
      setData(data.map(item => item.id === editingRule.id ? { ...item, ...values } : item));
    }
  };

  const handleToggle = async (record: PointsRule) => {
    // TODO: 调用 API
    message.success(record.enabled ? '已禁用' : '已启用');
  };

  const columns: ColumnsType<PointsRule> = [
    { title: '动作', dataIndex: 'action', key: 'action' },
    { title: '积分', dataIndex: 'points', key: 'points', render: (v) => `+${v}` },
    { title: '每日上限', dataIndex: 'dailyLimit', key: 'dailyLimit', render: (v) => v || '无限制' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled, record) => (
        <Switch checked={enabled} onChange={() => handleToggle(record)} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => handleEdit(record)}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>积分规则</h2>
      <Table columns={columns} dataSource={data} loading={loading} rowKey="id" />

      <Modal
        title="编辑积分规则"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="points" label="积分" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="dailyLimit" label="每日上限（0表示无限制）" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}