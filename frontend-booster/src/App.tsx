import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { Home } from "./pages/Home";
import { Register } from "./pages/Register";
import { Pecas } from "./pages/Pecas";
import { Cart } from "./pages/Cart";
import { Orders } from "./pages/Orders";
import { OrderDetails } from "./pages/OrderDetails";
import { Checkout } from "./pages/Checkout";
import { OrderConfirmation } from "./pages/OrderConfirmation";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProdutos } from "./pages/admin/AdminProdutos";
import { AdminPedidos } from "./pages/admin/AdminPedidos";
import { AdminUsuarios } from "./pages/admin/AdminUsuarios";
import { AdminConfiguracoes } from "./pages/admin/AdminConfiguracoes";
import { Toaster } from "./components/ui/sonner";
import "./App.css";

// Componente para rotas protegidas de admin
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pecas" element={<Pecas />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route
        path="/order-confirmation/:orderId"
        element={<OrderConfirmation />}
      />
      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/:orderId" element={<OrderDetails />} />

      {/* Rotas de Admin */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/produtos"
        element={
          <AdminRoute>
            <AdminProdutos />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/pedidos"
        element={
          <AdminRoute>
            <AdminPedidos />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <AdminRoute>
            <AdminUsuarios />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/configuracoes"
        element={
          <AdminRoute>
            <AdminConfiguracoes />
          </AdminRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster position="top-right" expand={true} richColors closeButton />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
