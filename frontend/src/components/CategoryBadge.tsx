/** Small category badge pill with icon and color. */
import type { Category } from "../api";

interface Props {
  category: Category;
  onClick?: () => void;
  active?: boolean;
}

export default function CategoryBadge({ category, onClick, active }: Props) {
  const bg = active
    ? "ring-2 ring-offset-1"
    : "hover:scale-105";

  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: active ? (category.color ?? "#6366f1") + "20" : undefined,
        borderColor: category.color ?? "#6366f1",
        color: category.color ?? "#6366f1",
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium 
        transition-all duration-200 cursor-pointer select-none ${bg}`}
    >
      {category.icon && <span>{category.icon}</span>}
      {category.name}
      {category.product_count > 0 && (
        <span className="ml-1 text-xs opacity-60">({category.product_count})</span>
      )}
    </button>
  );
}

