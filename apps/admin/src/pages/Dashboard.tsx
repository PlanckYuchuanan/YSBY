import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import {
  UserOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';

export default function Dashboard() {
  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>控制台</h2>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={112893}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="视频总数"
              value={34567}
              prefix={<VideoCameraOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="帖子总数"
              value={8901}
              prefix={<FileTextOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="订单总数"
              value={1234}
              prefix={<ShoppingOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="今日数据">
            <p>今日新增用户: 128</p>
            <p>今日视频播放: 5,432</p>
            <p>今日积分发放: 12,345</p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="待处理">
            <p>待审核视频: 23</p>
            <p>待审核帖子: 45</p>
            <p>待发货订单: 12</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}