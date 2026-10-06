/**
 * Admin — Products list with stats dashboard, search, and actions.
 * Shows all products (including inactive) with edit/delete buttons.
 */
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Edit, Trash2, Package, AlertTriangle,
  TrendingUp, Tag, ToggleLeft, ToggleRight, Search,
} from "lucide-react";
import type { Product, DashboardStats } from "../api";
import { productsApi } from "../api";
import { useApp } from "../context/AppContext";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

export default function AdminProducts() {
  const navigate = useNavigate();
  const { toast } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [result, statsData] = await Promise.all([
        productsApi.list({ page, page_size: PAGE_SIZE, search: search || undefined, active_only: false as never }),
        productsApi.stats(),
      ]);
      setProducts(result.items);
      setTotal(result.total);
      setStats(statsData);
    } catch (err) {
      toast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  async function toggleActive(product: Product) {
    try {
      await productsApi.update(product.id, { is_active: !product.is_active });
      toast(`"${product.name}" ${product.is_active ? "deactivated" : "activated"}`, "success");
      load();
    } catch {
      toast("Failed to update product", "error");
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product.id);
    try {
      await productsApi.delete(product.id);
      toast(`"${product.name}" deleted`, "success");
      load();
    } catch {
      toast("Failed to delete product", "error");
    } finally {
      setDeletingId(null);
    }
  }

  const stockBadge = (status: string) => ({
    in_stock:     <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">In Stock</span>,
    low_stock:    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">Low Stock</span>,
    out_of_stock: <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Out of Stock</span>,
  }[status] ?? null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your product catalogue</p>
        </div>
        <button
          onClick={() => navigate("/admin/products/new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold 
            hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Total",    value: stats.total_products,    icon: <Package className="w-5 h-5" />,      color: "text-indigo-600 bg-indigo-50" },
            { label: "Active",   value: stats.active_products,   icon: <TrendingUp className="w-5 h-5" />,   color: "text-green-600 bg-green-50" },
            { label: "Featured", value: stats.featured_products, icon: <Tag className="w-5 h-5" />,          color: "text-purple-600 bg-purple-50" },
            { label: "Categories",value: stats.total_categories, icon: <Tag className="w-5 h-5" />,          color: "text-blue-600 bg-blue-50" },
            { label: "Low Stock",value: stats.low_stock,         icon: <AlertTriangle className="w-5 h-5" />,color: "text-amber-600 bg-amber-50" },
            { label: "Out of Stock",value: stats.out_of_stock,   icon: <AlertTriangle className="w-5 h-5" />,color: "text-red-600 bg-red-50" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products by name, SKU, brand…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        {/* Products table */}
        {loading ? (
          <LoadingSpinner label="Loading products…" />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products yet"
            message="Click 'Add Product' to create your first product."
            action={{ label: "Add Product", onClick: () => navigate("/admin/products/new") }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {p.primary_image ? (
                            <img src={p.primary_image} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">🛍️</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.sku ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.category ? `${p.category.icon ?? ""} ${p.category.name}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-semibold text-gray-900">${p.price.toFixed(2)}</span>
                        {p.compare_price && (
                          <span className="text-xs text-gray-400 line-through ml-1">${p.compare_price.toFixed(2)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.inventory ? stockBadge(p.inventory.stock_status) : "—"}
                      {p.inventory && (
                        <p className="text-xs text-gray-400 mt-0.5">{p.inventory.available_quantity} avail.</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => toggleActive(p)}
                          className={`flex items-center gap-1 text-xs font-semibold ${p.is_active ? "text-green-600" : "text-gray-400"}`}
                        >
                          {p.is_active
                            ? <><ToggleRight className="w-4 h-4" /> Active</>
                            : <><ToggleLeft className="w-4 h-4" /> Inactive</>
                          }
                        </button>
                        {p.is_featured && (
                          <span className="text-xs text-purple-600 font-semibold">⭐ Featured</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{(p.view_count ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={deletingId === p.id}
                          className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {Math.ceil(total / PAGE_SIZE) > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <p className="text-gray-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / PAGE_SIZE)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
