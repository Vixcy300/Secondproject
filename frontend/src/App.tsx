/**
 * Root application component.
 * Sets up routing and wraps everything in the AppProvider for global state.
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import ToastContainer from "./components/ToastContainer";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import AdminProducts from "./pages/AdminProducts";
import AdminProductForm from "./pages/AdminProductForm";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-900">
          <Navbar />
          <div className="flex-1">
            <Routes>
              {/* Public Storefront */}
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/products/:slug" element={<ProductDetail />} />

              {/* Admin Dashboard */}
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/products/new" element={<AdminProductForm />} />
              <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {/* Footer */}
          <footer className="border-t border-gray-200 bg-white mt-auto py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
              ShopWave © {new Date().getFullYear()} — Full-Stack E-Commerce & Order Management System · Week 5
            </div>
          </footer>

          {/* Global toast notifications */}
          <ToastContainer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
