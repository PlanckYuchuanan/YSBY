import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './layouts/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserList from './pages/user/List';
import VideoList from './pages/video/List';
import PostList from './pages/social/PostList';
import ProductList from './pages/shop/ProductList';
import OrderList from './pages/shop/OrderList';
import PointsRules from './pages/points/Rules';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserList />} />
        <Route path="videos" element={<VideoList />} />
        <Route path="posts" element={<PostList />} />
        <Route path="products" element={<ProductList />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="points/rules" element={<PointsRules />} />
      </Route>
    </Routes>
  );
}