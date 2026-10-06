/**
 * Home page — hero banner, featured products, category grid, new arrivals.
 * This is the "storefront" entry point.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import type { Product, Category } from "../api";
import { productsApi, categoriesApi } from "../api";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [feat, newArr, cats] = await Promise.all([
          productsApi.featured(8),
          productsApi.newArrivals(4),
          categoriesApi.tree(),
        ]);
        setFeatured(feat);
        setNewArrivals(newArr);
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load home data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner size="lg" label="Loading ShopWave…" />;

  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-purple-300 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              New arrivals every week
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Discover Your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-400">
                Perfect Style
              </span>
            </h1>
            <p className="text-indigo-200 text-lg mb-8 max-w-lg">
              Thousands of products across electronics, fashion, home, sports, and more. 
              Curated for quality, priced for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button
                onClick={() => navigate("/catalog")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-indigo-700 
                  font-semibold hover:bg-indigo-50 transition-colors shadow-lg"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/catalog?is_new_arrival=true")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/30 
                  text-white font-semibold hover:bg-white/10 transition-colors"
              >
                New Arrivals
              </button>
            </div>
          </div>
          {/* Hero image grid */}
          <div className="hidden md:grid grid-cols-2 gap-3 w-80 shrink-0">
            {featured.slice(0, 4).map((p, i) => (
              <div
                key={p.id}
                onClick={() => navigate(`/products/${p.slug}`)}
                className={`rounded-2xl overflow-hidden cursor-pointer aspect-square bg-white/10 hover:ring-2 ring-white/50 transition-all ${i === 0 ? "col-span-2" : ""}`}
              >
                {p.primary_image ? (
                  <img src={p.primary_image} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Grid ──────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Browse Categories</h2>
              <p className="text-gray-500 mt-1">Find exactly what you're looking for</p>
            </div>
            <button
              onClick={() => navigate("/catalog")}
              className="hidden sm:flex items-center gap-1 text-sm text-indigo-600 font-medium hover:underline"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/catalog?category_id=${cat.id}`)}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-100 
                  hover:border-indigo-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: (cat.color ?? "#6366f1") + "20" }}
                >
                  {cat.icon ?? "📦"}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800 text-sm">{cat.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{cat.product_count} products</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Products ──────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
                    Handpicked
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
              </div>
              <button
                onClick={() => navigate("/catalog?is_featured=true")}
                className="hidden sm:flex items-center gap-1 text-sm text-indigo-600 font-medium hover:underline"
              >
                See all <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── New Arrivals ───────────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-pink-500" />
                <span className="text-sm font-semibold text-pink-600 uppercase tracking-wider">
                  Just In
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
            </div>
            <button
              onClick={() => navigate("/catalog?is_new_arrival=true")}
              className="hidden sm:flex items-center gap-1 text-sm text-indigo-600 font-medium hover:underline"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {newArrivals.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── Stats bar ─────────────────────────────────────────────────── */}
      <section className="bg-indigo-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10,000+", label: "Products" },
            { value: "500+", label: "Brands" },
            { value: "50,000+", label: "Happy Customers" },
            { value: "4.8★", label: "Average Rating" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-amber-400">{stat.value}</p>
              <p className="text-indigo-300 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
