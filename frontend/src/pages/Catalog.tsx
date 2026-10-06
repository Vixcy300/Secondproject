/**
 * Catalog page — full product listing with sidebar filters.
 * Supports: category filter, search, price range, sort, pagination.
 */
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ChevronDown, ChevronUp, LayoutGrid, List } from "lucide-react";
import type { Category, PaginatedProducts, ProductFilters } from "../api";
import { productsApi, categoriesApi } from "../api";
import ProductCard from "../components/ProductCard";
import CategoryBadge from "../components/CategoryBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

type SortOption = { label: string; sort_by: string; sort_dir: "asc" | "desc" };
const SORT_OPTIONS: SortOption[] = [
  { label: "Newest First",     sort_by: "created_at",  sort_dir: "desc" },
  { label: "Price: Low → High",sort_by: "price",       sort_dir: "asc"  },
  { label: "Price: High → Low",sort_by: "price",       sort_dir: "desc" },
  { label: "Top Rated",        sort_by: "rating",      sort_dir: "desc" },
  { label: "Best Selling",     sort_by: "sold_count",  sort_dir: "desc" },
  { label: "Name A–Z",         sort_by: "name",        sort_dir: "asc"  },
];

export default function Catalog() {
  const [params, setParams] = useSearchParams();

  // ── State ────────────────────────────────────────────────────────────────
  const [data, setData] = useState<PaginatedProducts | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Local filter state (separate from URL params so user can stage changes)
  const [categoryId, setCategoryId] = useState<number | undefined>(
    params.get("category_id") ? Number(params.get("category_id")) : undefined
  );
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [minPrice, setMinPrice] = useState(params.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("max_price") ?? "");
  const [sortIndex, setSortIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isFeatured, setIsFeatured] = useState(params.get("is_featured") === "true");
  const [isNewArrival, setIsNewArrival] = useState(params.get("is_new_arrival") === "true");

  // ── Load categories once ─────────────────────────────────────────────────
  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(console.error);
  }, []);

  // ── Fetch products when filters change ───────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const sortOpt = SORT_OPTIONS[sortIndex];
    const filters: ProductFilters = {
      page,
      page_size: 12,
      sort_by: sortOpt.sort_by as ProductFilters["sort_by"],
      sort_dir: sortOpt.sort_dir,
    };
    if (categoryId) filters.category_id = categoryId;
    if (search.trim()) filters.search = search.trim();
    if (minPrice) filters.min_price = Number(minPrice);
    if (maxPrice) filters.max_price = Number(maxPrice);
    if (inStockOnly) filters.in_stock_only = true;
    if (isFeatured) filters.is_featured = true;
    if (isNewArrival) filters.is_new_arrival = true;

    try {
      const result = await productsApi.list(filters);
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, search, minPrice, maxPrice, sortIndex, page, inStockOnly, isFeatured, isNewArrival]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function clearFilters() {
    setCategoryId(undefined);
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setIsFeatured(false);
    setIsNewArrival(false);
    setPage(1);
    setParams({});
  }

  const hasActiveFilters = !!(categoryId || search || minPrice || maxPrice || inStockOnly || isFeatured || isNewArrival);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
          {data && (
            <p className="text-sm text-gray-500 mt-0.5">
              {data.total.toLocaleString()} product{data.total !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="hidden sm:flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          {/* Filter toggle for mobile */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* ── Sidebar filters ──────────────────────────────────────────── */}
        <aside
          className={`${filtersOpen ? "flex" : "hidden"} md:flex flex-col gap-6 w-60 shrink-0`}
        >
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>

            {/* Category filter */}
            <FilterSection title="Category">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => { setCategoryId(undefined); setPage(1); }}
                  className={`text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!categoryId ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setCategoryId(cat.id); setPage(1); }}
                    className={`text-left text-sm px-2 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${categoryId === cat.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    <span>{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Price filter */}
            <FilterSection title="Price Range">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  placeholder="Min"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  placeholder="Max"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </FilterSection>

            {/* Quick filters */}
            <FilterSection title="Quick Filters">
              <div className="flex flex-col gap-2">
                {[
                  { label: "In Stock Only", state: inStockOnly, set: setInStockOnly },
                  { label: "Featured",      state: isFeatured, set: setIsFeatured },
                  { label: "New Arrivals",  state: isNewArrival, set: setIsNewArrival },
                ].map(({ label, state, set }) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state}
                      onChange={(e) => { set(e.target.checked); setPage(1); }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-300"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Sort + category badges */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
            <div className="flex gap-2 flex-wrap">
              {categories.slice(0, 6).map((cat) => (
                <CategoryBadge
                  key={cat.id}
                  category={cat}
                  active={categoryId === cat.id}
                  onClick={() => { setCategoryId(categoryId === cat.id ? undefined : cat.id); setPage(1); }}
                />
              ))}
            </div>
            <div className="ml-auto">
              <select
                value={sortIndex}
                onChange={(e) => { setSortIndex(Number(e.target.value)); setPage(1); }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {SORT_OPTIONS.map((opt, i) => (
                  <option key={i} value={i}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Products grid */}
          {loading ? (
            <LoadingSpinner label="Loading products…" />
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              title="No products found"
              message="Try adjusting your filters or search term."
              action={{ label: "Clear filters", onClick: clearFilters }}
            />
          ) : (
            <>
              <div className={`grid gap-5 ${
                viewMode === "grid"
                  ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}>
                {data.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {data.total_pages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: data.total_pages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === data.total_pages || Math.abs(p - page) <= 2)
                    .reduce<(number | "…")[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "…" ? (
                        <span key={`e${i}`} className="px-3 py-2 text-gray-400">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            page === p
                              ? "bg-indigo-600 text-white"
                              : "border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                    disabled={page === data.total_pages}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helper: collapsible filter section ────────────────────────────────────

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t border-gray-100 pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-3"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && children}
    </div>
  );
}
