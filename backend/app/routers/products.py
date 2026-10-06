"""
Products router — catalog endpoints + admin endpoints.

Public endpoints (no auth required for Week 5):
  GET /products/              – paginated list with filtering
  GET /products/featured      – featured products
  GET /products/new-arrivals  – new arrivals
  GET /products/{id}          – product detail (bumps view count)
  GET /products/slug/{slug}   – same but by slug

Admin endpoints (prefixed /products/admin):
  POST   /products/            – create product
  PATCH  /products/{id}        – update product
  DELETE /products/{id}        – delete product
  GET    /products/admin/stats – dashboard stats
  PATCH  /products/{id}/inventory – update stock
"""

import math
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/products", tags=["Products"])


# ──────────────────────── Public catalog ──────────────────────────────────

@router.get("/", response_model=schemas.PaginatedProducts)
def list_products(
    page: int = 1,
    page_size: int = 20,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    brand: Optional[str] = None,
    is_featured: Optional[bool] = None,
    is_new_arrival: Optional[bool] = None,
    in_stock_only: bool = False,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
    db: Session = Depends(get_db),
):
    """
    Paginated product list with rich filtering.
    sort_by options: name, price, rating, sold_count, created_at
    """
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    items, total = crud.get_products(
        db,
        page=page,
        page_size=page_size,
        category_id=category_id,
        search=search,
        min_price=min_price,
        max_price=max_price,
        brand=brand,
        is_featured=is_featured,
        is_new_arrival=is_new_arrival,
        in_stock_only=in_stock_only,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )

    return schemas.PaginatedProducts(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 1,
    )


@router.get("/featured", response_model=List[schemas.ProductListOut])
def featured_products(limit: int = 8, db: Session = Depends(get_db)):
    """Return featured products for the hero / homepage section."""
    items, _ = crud.get_products(db, page=1, page_size=limit, is_featured=True)
    return items


@router.get("/new-arrivals", response_model=List[schemas.ProductListOut])
def new_arrivals(limit: int = 8, db: Session = Depends(get_db)):
    """Return the newest products."""
    items, _ = crud.get_products(
        db, page=1, page_size=limit, is_new_arrival=True, sort_by="created_at", sort_dir="desc"
    )
    return items


@router.get("/admin/stats", response_model=schemas.DashboardStats)
def dashboard_stats(db: Session = Depends(get_db)):
    """Admin dashboard statistics — product and inventory counts."""
    return crud.get_dashboard_stats(db)


@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    crud.increment_view_count(db, product_id)
    return product


@router.get("/slug/{slug}", response_model=schemas.ProductOut)
def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    product = crud.get_product_by_slug(db, slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    crud.increment_view_count(db, product.id)
    return product


# ──────────────────────────── Admin CRUD ──────────────────────────────────

@router.post("/", response_model=schemas.ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(data: schemas.ProductCreate, db: Session = Depends(get_db)):
    """Create a product with optional initial inventory."""
    if data.sku and crud.get_product_by_slug(db, data.sku):
        raise HTTPException(status_code=400, detail="SKU already exists")
    return crud.create_product(db, data)


@router.patch("/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int, data: schemas.ProductUpdate, db: Session = Depends(get_db)
):
    updated = crud.update_product(db, product_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    if not crud.delete_product(db, product_id):
        raise HTTPException(status_code=404, detail="Product not found")


# ─────────────────────────── Inventory ────────────────────────────────────

@router.patch("/{product_id}/inventory", response_model=schemas.InventoryOut)
def update_inventory(
    product_id: int, data: schemas.InventoryUpdate, db: Session = Depends(get_db)
):
    """Update stock levels for a product."""
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    inv = crud.update_inventory(db, product_id, data)
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    return inv


# ──────────────────────────── Images ──────────────────────────────────────

@router.post("/{product_id}/images", response_model=schemas.ProductImageOut, status_code=201)
def add_image(
    product_id: int,
    url: str,
    alt_text: Optional[str] = None,
    is_primary: bool = False,
    db: Session = Depends(get_db),
):
    """Add an image URL to a product (file upload comes in Week 6)."""
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return crud.add_product_image(db, product_id, url, alt_text, is_primary)


@router.delete("/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_image(image_id: int, db: Session = Depends(get_db)):
    if not crud.delete_product_image(db, image_id):
        raise HTTPException(status_code=404, detail="Image not found")
