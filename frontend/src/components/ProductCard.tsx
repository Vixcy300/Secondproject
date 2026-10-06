/**
 * ProductCard — shown in grid and list views.
 * Features: hover zoom, discount badge, stock status, quick-view button.
 */
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import type { Product } from "../api";
import StarRating from "./StarRating";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate();
  const stock = product.inventory?.stock_status ?? "in_stock";

  const stockBadge = {
    in_stock: null,
    low_stock: (
      <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
        Low Stock
      </span>
    ),
    out_of_stock: (
      <span className="absolute top-2 left-2 bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
        Sold Out
      </span>
    ),
  }[stock];

  return (
    <article
      onClick={() => navigate(`/products/${product.slug}`)}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl 
        transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl select-none">
            🛍️
          </div>
        )}

        {/* Discount badge */}
        {product.discount_percent && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{product.discount_percent}%
          </span>
        )}

        {/* New arrival badge */}
        {product.is_new_arrival && !product.discount_percent && (
          <span className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            NEW
          </span>
        )}

        {/* Stock badge */}
        {stockBadge}

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.slug}`); }}
            className="p-2.5 rounded-full bg-white shadow-md hover:bg-indigo-600 hover:text-white transition-colors"
            title="Quick view"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-2.5 rounded-full bg-white shadow-md hover:bg-red-500 hover:text-white transition-colors"
            title="Add to wishlist"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            {product.brand}
          </p>
        )}

        {/* Name */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="mb-3">
          <StarRating rating={product.rating} count={product.review_count} size="sm" />
        </div>

        {/* Price row */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {product.compare_price && (
              <span className="text-sm text-gray-400 line-through">
                ${product.compare_price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              // Cart functionality comes in Week 7
              alert("Cart coming in Week 7! 🛒");
            }}
            disabled={stock === "out_of_stock"}
            className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 
              disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
