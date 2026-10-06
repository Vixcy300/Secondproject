"""
Pydantic schemas — request bodies and response shapes.

Naming convention:
  *Base   – shared fields
  *Create – what the client sends to create a resource
  *Update – partial update (all fields optional)
  *Out    – what the API returns to the client
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
import re


# ─────────────────────────────── helpers ──────────────────────────────────

def slugify(text: str) -> str:
    """Convert a display name to a URL-safe slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text


# ───────────────────────────── Category ───────────────────────────────────

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = None          # emoji e.g. "📱"
    color: Optional[str] = None         # hex e.g. "#6366f1"
    parent_id: Optional[int] = None
    is_active: bool = True
    sort_order: int = 0


class CategoryCreate(CategoryBase):
    slug: Optional[str] = None          # auto-generated if omitted

    @field_validator("slug", mode="before")
    @classmethod
    def auto_slug(cls, v, info):
        if not v and info.data.get("name"):
            return slugify(info.data["name"])
        return v


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    slug: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    parent_id: Optional[int] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    product_count: int = 0
    children: List["CategoryOut"] = []
    created_at: datetime
    updated_at: datetime


# ─────────────────────────── ProductImage ─────────────────────────────────

class ProductImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    alt_text: Optional[str] = None
    is_primary: bool
    sort_order: int


# ──────────────────────────── Inventory ───────────────────────────────────

class InventoryBase(BaseModel):
    quantity: int = Field(0, ge=0)
    reserved_quantity: int = Field(0, ge=0)
    low_stock_threshold: int = Field(5, ge=0)
    reorder_quantity: int = Field(10, ge=1)
    location: Optional[str] = None


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseModel):
    quantity: Optional[int] = Field(None, ge=0)
    reserved_quantity: Optional[int] = Field(None, ge=0)
    low_stock_threshold: Optional[int] = Field(None, ge=0)
    reorder_quantity: Optional[int] = Field(None, ge=1)
    location: Optional[str] = None


class InventoryOut(InventoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    available_quantity: int
    stock_status: str
    last_restocked_at: Optional[datetime] = None
    updated_at: datetime


# ────────────────────────────── Product ───────────────────────────────────

class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    sku: Optional[str] = None
    price: float = Field(..., gt=0)
    compare_price: Optional[float] = Field(None, gt=0)
    cost_price: Optional[float] = Field(None, gt=0)
    category_id: Optional[int] = None
    brand: Optional[str] = None
    tags: Optional[str] = None          # comma-separated
    weight: Optional[float] = None
    is_active: bool = True
    is_featured: bool = False
    is_new_arrival: bool = False


class ProductCreate(ProductBase):
    slug: Optional[str] = None
    inventory: Optional[InventoryCreate] = None

    @field_validator("slug", mode="before")
    @classmethod
    def auto_slug(cls, v, info):
        if not v and info.data.get("name"):
            return slugify(info.data["name"])
        return v


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    slug: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    compare_price: Optional[float] = None
    cost_price: Optional[float] = None
    category_id: Optional[int] = None
    brand: Optional[str] = None
    tags: Optional[str] = None
    weight: Optional[float] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_new_arrival: Optional[bool] = None


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    primary_image: Optional[str] = None
    discount_percent: Optional[int] = None
    rating: float
    review_count: int
    sold_count: int
    view_count: int
    images: List[ProductImageOut] = []
    inventory: Optional[InventoryOut] = None
    category: Optional[CategoryOut] = None
    created_at: datetime
    updated_at: datetime


class ProductListOut(BaseModel):
    """Lightweight product representation for listing pages (no full description)."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    price: float
    compare_price: Optional[float] = None
    discount_percent: Optional[int] = None
    brand: Optional[str] = None
    rating: float
    review_count: int
    is_featured: bool
    is_new_arrival: bool
    primary_image: Optional[str] = None
    category: Optional[CategoryOut] = None
    inventory: Optional[InventoryOut] = None


# ──────────────────────────── Pagination ──────────────────────────────────

class PaginatedProducts(BaseModel):
    items: List[ProductListOut]
    total: int
    page: int
    page_size: int
    total_pages: int


# ─────────────────────────── Statistics ───────────────────────────────────

class DashboardStats(BaseModel):
    total_products: int
    active_products: int
    out_of_stock: int
    low_stock: int
    total_categories: int
    featured_products: int
