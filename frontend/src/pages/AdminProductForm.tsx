/**
 * Admin Product Form — used for both creating and editing products.
 * Covers all fields: name, slug, price, category, tags, inventory,
 * description, images, and boolean flags.
 */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import type { Category } from "../api";
import { productsApi, categoriesApi } from "../api";
import { useApp } from "../context/AppContext";
import LoadingSpinner from "../components/LoadingSpinner";

interface FormData {
  name: string;
  sku: string;
  description: string;
  short_description: string;
  price: string;
  compare_price: string;
  cost_price: string;
  brand: string;
  tags: string;
  weight: string;
  category_id: string;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  // Inventory
  quantity: string;
  low_stock_threshold: string;
  reorder_quantity: string;
  location: string;
  // Images
  imageUrl: string;
  imageAlt: string;
}

const defaults: FormData = {
  name: "", sku: "", description: "", short_description: "",
  price: "", compare_price: "", cost_price: "", brand: "",
  tags: "", weight: "", category_id: "",
  is_active: true, is_featured: false, is_new_arrival: false,
  quantity: "0", low_stock_threshold: "5", reorder_quantity: "10", location: "",
  imageUrl: "", imageAlt: "",
};

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useApp();

  const [form, setForm] = useState<FormData>(defaults);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<{ url: string; alt: string; isPrimary: boolean }[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(console.error);
    if (isEdit && id) {
      productsApi.get(Number(id)).then((p) => {
        setForm({
          name: p.name,
          sku: p.sku ?? "",
          description: p.description ?? "",
          short_description: p.short_description ?? "",
          price: String(p.price),
          compare_price: p.compare_price ? String(p.compare_price) : "",
          cost_price: p.cost_price ? String(p.cost_price) : "",
          brand: p.brand ?? "",
          tags: p.tags ?? "",
          weight: p.weight ? String(p.weight) : "",
          category_id: p.category_id ? String(p.category_id) : "",
          is_active: p.is_active,
          is_featured: p.is_featured,
          is_new_arrival: p.is_new_arrival,
          quantity: p.inventory ? String(p.inventory.quantity) : "0",
          low_stock_threshold: p.inventory ? String(p.inventory.low_stock_threshold) : "5",
          reorder_quantity: p.inventory ? String(p.inventory.reorder_quantity) : "10",
          location: p.inventory?.location ?? "",
          imageUrl: "",
          imageAlt: "",
        });
        setImages(
          p.images.map((img) => ({ url: img.url, alt: img.alt_text ?? "", isPrimary: img.is_primary }))
        );
      }).catch(() => toast("Failed to load product", "error")).finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  function set(field: keyof FormData, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Product name is required";
    if (!form.price || Number(form.price) <= 0) errs.price = "Price must be greater than 0";
    if (form.compare_price && Number(form.compare_price) <= 0) errs.compare_price = "Compare price must be > 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku || undefined,
        description: form.description || undefined,
        short_description: form.short_description || undefined,
        price: Number(form.price),
        compare_price: form.compare_price ? Number(form.compare_price) : undefined,
        cost_price: form.cost_price ? Number(form.cost_price) : undefined,
        brand: form.brand || undefined,
        tags: form.tags || undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        category_id: form.category_id ? Number(form.category_id) : undefined,
        is_active: form.is_active,
        is_featured: form.is_featured,
        is_new_arrival: form.is_new_arrival,
        inventory: {
          quantity: Number(form.quantity),
          low_stock_threshold: Number(form.low_stock_threshold),
          reorder_quantity: Number(form.reorder_quantity),
          location: form.location || undefined,
        },
      };

      if (isEdit && id) {
        await productsApi.update(Number(id), payload);
        // Update inventory separately
        await productsApi.updateInventory(Number(id), payload.inventory);
        toast("Product updated successfully!", "success");
      } else {
        const created = await productsApi.create(payload);
        // Add any staged images
        for (const img of images) {
          await productsApi.addImage(created.id, img.url, img.alt, img.isPrimary);
        }
        toast("Product created successfully!", "success");
        navigate("/admin/products");
      }
    } catch (err: unknown) {
      toast((err as Error).message || "Failed to save product", "error");
    } finally {
      setSaving(false);
    }
  }

  function addImage() {
    if (!form.imageUrl.trim()) return;
    setImages((imgs) => [
      ...imgs,
      { url: form.imageUrl.trim(), alt: form.imageAlt.trim(), isPrimary: imgs.length === 0 },
    ]);
    set("imageUrl", "");
    set("imageAlt", "");
  }

  if (loading) return <LoadingSpinner size="lg" label="Loading product…" />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/admin/products")} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? "Edit Product" : "New Product"}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{isEdit ? "Update product details" : "Fill in the details to create a new product"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* ── Basic Info ──────────────────────────────────────────── */}
        <Card title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Product Name *" error={errors.name}>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Premium Wireless Headphones"
                className={input(errors.name)}
              />
            </Field>
            <Field label="SKU" hint="Leave blank to auto-generate">
              <input value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="e.g. WH-1000XM5" className={input()} />
            </Field>
            <Field label="Brand">
              <input value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Sony" className={input()} />
            </Field>
            <Field label="Category">
              <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)} className={input()}>
                <option value="">— No category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Tags" hint="Comma-separated" className="md:col-span-2">
              <input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="e.g. wireless, audio, noise-cancelling" className={input()} />
            </Field>
          </div>
        </Card>

        {/* ── Pricing ──────────────────────────────────────────────── */}
        <Card title="Pricing">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Selling Price ($) *" error={errors.price}>
              <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0.00" className={input(errors.price)} />
            </Field>
            <Field label="Compare Price ($)" hint="Original / struck-through" error={errors.compare_price}>
              <input type="number" step="0.01" min="0" value={form.compare_price} onChange={(e) => set("compare_price", e.target.value)} placeholder="0.00" className={input(errors.compare_price)} />
            </Field>
            <Field label="Cost Price ($)" hint="Internal, not shown to customers">
              <input type="number" step="0.01" min="0" value={form.cost_price} onChange={(e) => set("cost_price", e.target.value)} placeholder="0.00" className={input()} />
            </Field>
            <Field label="Weight (kg)">
              <input type="number" step="0.01" min="0" value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="0.0" className={input()} />
            </Field>
          </div>
        </Card>

        {/* ── Descriptions ─────────────────────────────────────────── */}
        <Card title="Descriptions">
          <div className="flex flex-col gap-4">
            <Field label="Short Description" hint="Shown on product cards (max 500 chars)">
              <textarea
                value={form.short_description}
                onChange={(e) => set("short_description", e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Brief, punchy summary…"
                className={`${input()} resize-none`}
              />
            </Field>
            <Field label="Full Description">
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={6}
                placeholder="Detailed product description…"
                className={`${input()} resize-y`}
              />
            </Field>
          </div>
        </Card>

        {/* ── Inventory ────────────────────────────────────────────── */}
        <Card title="Inventory">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Quantity in Stock">
              <input type="number" min="0" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} className={input()} />
            </Field>
            <Field label="Low Stock Threshold" hint="Alert when below this">
              <input type="number" min="0" value={form.low_stock_threshold} onChange={(e) => set("low_stock_threshold", e.target.value)} className={input()} />
            </Field>
            <Field label="Reorder Quantity">
              <input type="number" min="1" value={form.reorder_quantity} onChange={(e) => set("reorder_quantity", e.target.value)} className={input()} />
            </Field>
            <Field label="Storage Location">
              <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Shelf A3" className={input()} />
            </Field>
          </div>
        </Card>

        {/* ── Images ───────────────────────────────────────────────── */}
        <Card title="Product Images">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="https://example.com/image.jpg"
                className={`${input()} flex-1`}
              />
              <input
                value={form.imageAlt}
                onChange={(e) => set("imageAlt", e.target.value)}
                placeholder="Alt text"
                className={`${input()} w-40`}
              />
              <button type="button" onClick={addImage} className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-1">
                {images.map((img, i) => (
                  <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200">
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                    {img.isPrimary && (
                      <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] bg-indigo-600 text-white font-bold py-0.5">
                        PRIMARY
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white items-center justify-center hidden group-hover:flex"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400">File upload (drag & drop) will be added in Week 6.</p>
          </div>
        </Card>

        {/* ── Visibility ───────────────────────────────────────────── */}
        <Card title="Visibility & Flags">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Active (visible to customers)", field: "is_active" as const },
              { label: "Featured (shown on homepage)",   field: "is_featured" as const },
              { label: "New Arrival",                    field: "is_new_arrival" as const },
            ].map(({ label, field }) => (
              <label key={field} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 border border-gray-100">
                <input
                  type="checkbox"
                  checked={form[field] as boolean}
                  onChange={(e) => set(field, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-300"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold 
              hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Small helpers ───────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Field({
  label, hint, error, children, className = "",
}: {
  label: string; hint?: string; error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function input(error?: string) {
  return `w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors ${
    error
      ? "border-red-300 focus:ring-red-200 bg-red-50"
      : "border-gray-200 focus:ring-indigo-200 bg-white hover:border-gray-300"
  }`;
}
