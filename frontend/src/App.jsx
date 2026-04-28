import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddEditProduct from './pages/AddEditProduct';
import Stock from './pages/Stock';
import Sales from './pages/Sales';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Suppliers from './pages/Suppliers';
import Notifications from './pages/Notifications';
import AuditLogs from './pages/AuditLogs';
import Users from './pages/Users';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/add" element={<AddEditProduct />} />
          <Route path="products/edit/:id" element={<AddEditProduct />} />
          <Route path="stock" element={<Stock />} />
          <Route path="sales" element={<Sales />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
