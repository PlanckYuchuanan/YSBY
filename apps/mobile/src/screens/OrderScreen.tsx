import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { shopApi } from '../services/api';

interface Order {
  id: string;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  productName: string;
  totalPoints: number;
  createdAt: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待发货', color: '#fa8c16' },
  paid: { label: '已支付', color: '#1890ff' },
  shipped: { label: '已发货', color: '#52c41a' },
  completed: { label: '已完成', color: '#999' },
  cancelled: { label: '已取消', color: '#ff4d4f' },
};

export default function OrderScreen() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // TODO: 调用真实 API
      // const res = await shopApi.getOrders();
      // if (res.code === 0) setOrders(res.data.list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirm = async (orderId: string) => {
    try {
      await shopApi.confirmReceived(orderId);
      loadOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const status = statusMap[item.status];

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>订单号: {item.id.slice(0, 8)}</Text>
          <Text style={[styles.orderStatus, { color: status.color }]}>{status.label}</Text>
        </View>

        <View style={styles.orderContent}>
          <View style={styles.productImage}>
            <Text style={styles.placeholder}>商品</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.productName}</Text>
            <Text style={styles.orderTime}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.orderPoints}>{item.totalPoints} 积分</Text>
        </View>

        {item.status === 'shipped' && (
          <TouchableOpacity style={styles.confirmBtn} onPress={() => handleConfirm(item.id)}>
            <Text style={styles.confirmBtnText}>确认收货</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>我的订单</Text>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.orderList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>暂无订单</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  orderList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 12,
    color: '#999',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    fontSize: 12,
    color: '#999',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  orderPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff4d4f',
  },
  confirmBtn: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1890ff',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#1890ff',
    fontSize: 14,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
