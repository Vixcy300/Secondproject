/**
 * Product Detail page.
 * Features: image gallery with thumbnails, add-to-cart button (stub),
 * stock badge, category breadcrumb, full description, related products.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart, Heart, Share2, ArrowLeft,
  Package, Truck, ShieldCheck, RefreshCw,
} from "lucide-react";
import type { Product } from "../api";
import { productsApi } from "../api";
import StarRating from "../components/StarRating";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productsApi
      .getBySlug(slug)
      .then((p) => {
        setProduct(p);
        setActiveImage(0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner size="lg" label="Loading product…" />;
  if (error || !product)
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-2xl font-semibold text-gray-400 mb-4">Product not found</p>
        <button onClick={() => navigate("/catalog")} className="text-indigo-600 underline">
          Back to catalog
        </button>
      </div>
    );

  const stock = product.inventory?.stock_status ?? "in_stock";
  const available = product.inventory?.available_quantity ?? 0;
  const images = product.images.length > 0
    ? product.images
    : [{ id: 0, url: product.primary_image ?? "", alt_text: product.name, is_primary: true, sort_order: 0 }];

  const stockBadgeClass = {
    in_stock: "bg-green-100 text-green-700",
    low_stock: "bg-amber-100 text-amber-700",
    out_of_stock: "bg-red-100 text-red-700",
  }[stock];

  const stockLabel = {
    in_stock: `In Stock (${available} available)`,
    low_stock: `Only ${available} left!`,
    out_of_stock: "Out of Stock",
  }[stock];

  const tags = product.tags ? product.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <button onClick={() => navigate("/")} className="hover:text-indigo-600 transition-colors">Home</button>
        <span>/</span>
        <button onClick={() => navigate("/catalog")} className="hover:text-indigo-600 transition-colors">Catalog</button>
        {product.category && (
          <>
            <span>/</span>
            <button
              onClick={() => navigate(`/catalog?category_id=${product.category_id}`)}
              className="hover:text-indigo-600 transition-colors"
            >
              {product.category.name}
            </button>
          </>
        )}
        <span>/</span>
        <span className="text-gray-800 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        {/* ── Image gallery ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {/* Main image */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 relative">
            {images[activeImage]?.url ? (
              <img
                src={images[activeImage].url}
                alt={images[activeImage].alt_text ?? product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">🛍️</div>
            )}
            {product.discount_percent && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                -{product.discount_percent}% OFF
              </span>
            )}
          </div>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === i ? "border-indigo-600 shadow-md" : "border-gray-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt={img.alt_text ?? ""} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product info ──────────────────────────────────────────── */}
        <div className="flex flex-col">
          {/* Brand */}
          {product.brand && (
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">
              {product.brand}
            </p>
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating} count={product.review_count} />
            <span className="text-sm text-gray-500">
              {product.sold_count.toLocaleString()} sold
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl font-extrabold text-gray-900">${product.price.toFixed(2)}</span>
            {product.compare_price && (
              <span className="text-xl text-gray-400 line-through">${product.compare_price.toFixed(2)}</span>
            )}
            {product.discount_percent && (
              <span className="text-base font-semibold text-red-500">
                Save {product.discount_percent}%
              </span>
            )}
          </div>

          {/* Short description */}
          {product.short_description && (
            <p className="text-gray-600 mb-4 leading-relaxed">{product.short_description}</p>
          )}

          {/* Stock status */}
          <span className={`inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mb-6 ${stockBadgeClass}`}>
            <Package className="w-4 h-4" />
            {stockLabel}
          </span>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors font-bold text-lg"
              >
                −
              </button>
              <span className="w-12 text-center font-semibold text-gray-900">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(available || 99, q + 1))}
                className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors font-bold text-lg"
              >
                +
              </button>
            </div>
            <button
              disabled={stock === "out_of_stock"}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-indigo-600 text-white 
                font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
              onClick={() => alert("Cart coming in Week 7! 🛒")}
            >
              <ShoppingCart className="w-5 h-5" />
              {stock === "out_of_stock" ? "Out of Stock" : "Add to Cart"}
            </button>
            <button className="p-3.5 rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: <Truck className="w-5 h-5 text-indigo-500" />, text: "Free Shipping" },
              { icon: <ShieldCheck className="w-5 h-5 text-green-500" />, text: "Secure Payment" },
              { icon: <RefreshCw className="w-5 h-5 text-blue-500" />, text: "Easy Returns" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl text-center">
                {icon}
                <span className="text-xs font-medium text-gray-600">{text}</span>
              </div>
            ))}
          </div>

          {/* Meta info */}
          <div className="text-sm text-gray-500 space-y-1.5 border-t border-gray-100 pt-4">
            {product.sku && <p><span className="font-medium text-gray-700">SKU:</span> {product.sku}</p>}
            {product.brand && <p><span className="font-medium text-gray-700">Brand:</span> {product.brand}</p>}
            {product.weight && <p><span className="font-medium text-gray-700">Weight:</span> {product.weight}kg</p>}
            {product.category && (
              <p><span className="font-medium text-gray-700">Category:</span> {product.category.icon} {product.category.name}</p>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full description */}
      {product.description && (
        <section className="bg-white rounded-2xl border border-gray-100 p-8 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About this product</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
        </section>
      )}

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-indigo-600 hover:underline font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to results
      </button>
    </div>
  );
}
