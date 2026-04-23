import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { shopApi } from '../services/api';
import { useAuthStore } from '../store/auth';

interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  stock: number;
}

export default function ShopScreen() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // TODO: 调用真实 API
      // const res = await shopApi.getProducts();
      // if (res.code === 0) setProducts(res.data.list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExchange = async (product: Product) => {
    if (!user) {
      Alert.alert('提示', '请先登录');
      return;
    }

    if (user.points < product.price) {
      Alert.alert('积分不足', `需要 ${product.price} 积分，您当前有 ${user.points} 积分`);
      return;
    }

    if (product.stock <= 0) {
      Alert.alert('库存不足', '该商品已售罄');
      return;
    }

    Alert.alert(
      '确认兑换',
      `确定用 ${product.price} 积分兑换 "${product.name}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认',
          onPress: async () => {
            try {
              const res = await shopApi.exchange({
                productId: product.id,
                quantity: 1,
              });
              if (res.code === 0) {
                Alert.alert('兑换成功', '请在我的订单中查看');
              } else {
                Alert.alert('兑换失败', res.message);
              }
            } catch (err: any) {
              Alert.alert('错误', err.message || '兑换失败');
            }
          },
        },
      ]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => handleExchange(item)}>
      <View style={styles.productImage}>
        <Text style={styles.imagePlaceholder}>商品图片</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productDesc} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.price}</Text>
          <Text style={styles.priceUnit}>积分</Text>
        </View>
        <Text style={styles.stock}>库存: {item.stock}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>积分商城</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>💰 {user?.points || 0} 积分</Text>
        </View>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyText}>暂无商品</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  pointsBadge: {
    backgroundColor: '#fff7e6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pointsText: {
    color: '#fa8c16',
    fontSize: 14,
    fontWeight: '600',
  },
  productList: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  productImage: {
    height: 120,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4d4f',
  },
  priceUnit: {
    fontSize: 12,
    color: '#ff4d4f',
    marginLeft: 2,
  },
  stock: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
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
