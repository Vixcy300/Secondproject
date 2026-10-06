"""
CRUD helper functions for every model.

Why a separate module?  So that each router stays thin (just HTTP concerns)
and all database logic lives in one testable place.
"""

from datetime import datetime
from typing import List, Optional, Tuple

from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app import models, schemas


# ─────────────────────────── Category CRUD ────────────────────────────────

def get_category(db: Session, category_id: int) -> Optional[models.Category]:
    return db.query(models.Category).filter(models.Category.id == category_id).first()


def get_category_by_slug(db: Session, slug: str) -> Optional[models.Category]:
    return db.query(models.Category).filter(models.Category.slug == slug).first()


def get_categories(db: Session, include_inactive: bool = False) -> List[models.Category]:
    q = db.query(models.Category)
    if not include_inactive:
        q = q.filter(models.Category.is_active == True)
    return q.order_by(models.Category.sort_order, models.Category.name).all()


def get_root_categories(db: Session) -> List[models.Category]:
    """Return only top-level categories (no parent)."""
    return (
        db.query(models.Category)
        .filter(models.Category.parent_id == None, models.Category.is_active == True)
        .order_by(models.Category.sort_order, models.Category.name)
        .all()
    )


def create_category(db: Session, data: schemas.CategoryCreate) -> models.Category:
    category = models.Category(**data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(
    db: Session, category_id: int, data: schemas.CategoryUpdate
) -> Optional[models.Category]:
    category = get_category(db, category_id)
    if not category:
        return None
    # Only update fields that were explicitly provided
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    category.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: int) -> bool:
    category = get_category(db, category_id)
    if not category:
        return False
    db.delete(category)
    db.commit()
    return True


# ─────────────────────────── Product CRUD ─────────────────────────────────

def get_product(db: Session, product_id: int) -> Optional[models.Product]:
    return (
        db.query(models.Product)
        .filter(models.Product.id == product_id)
        .first()
    )


def get_product_by_slug(db: Session, slug: str) -> Optional[models.Product]:
    return db.query(models.Product).filter(models.Product.slug == slug).first()


def get_products(
    db: Session,
    *,
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
    sort_by: str = "created_at",   # name | price | rating | sold_count | created_at
    sort_dir: str = "desc",        # asc | desc
    active_only: bool = True,
) -> Tuple[List[models.Product], int]:
    """Return (items, total_count) with full filtering and pagination."""
    q = db.query(models.Product)

    if active_only:
        q = q.filter(models.Product.is_active == True)

    if category_id:
        q = q.filter(models.Product.category_id == category_id)

    if search:
        term = f"%{search}%"
        q = q.filter(
            or_(
                models.Product.name.ilike(term),
                models.Product.description.ilike(term),
                models.Product.brand.ilike(term),
                models.Product.tags.ilike(term),
                models.Product.sku.ilike(term),
            )
        )

    if min_price is not None:
        q = q.filter(models.Product.price >= min_price)
    if max_price is not None:
        q = q.filter(models.Product.price <= max_price)
    if brand:
        q = q.filter(models.Product.brand.ilike(f"%{brand}%"))
    if is_featured is not None:
        q = q.filter(models.Product.is_featured == is_featured)
    if is_new_arrival is not None:
        q = q.filter(models.Product.is_new_arrival == is_new_arrival)
    if in_stock_only:
        q = q.join(models.Inventory).filter(
            models.Inventory.quantity - models.Inventory.reserved_quantity > 0
        )

    # Sorting
    sort_col = getattr(models.Product, sort_by, models.Product.created_at)
    if sort_dir == "asc":
        q = q.order_by(sort_col.asc())
    else:
        q = q.order_by(sort_col.desc())

    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()
    return items, total


def create_product(db: Session, data: schemas.ProductCreate) -> models.Product:
    # Split inventory from product data
    inventory_data = data.inventory
    product_dict = data.model_dump(exclude={"inventory"})
    product = models.Product(**product_dict)
    db.add(product)
    db.flush()  # get product.id without committing

    # Always create an inventory record
    inv = models.Inventory(
        product_id=product.id,
        **(inventory_data.model_dump() if inventory_data else {})
    )
    db.add(inv)
    db.commit()
    db.refresh(product)
    return product


def update_product(
    db: Session, product_id: int, data: schemas.ProductUpdate
) -> Optional[models.Product]:
    product = get_product(db, product_id)
    if not product:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    product.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> bool:
    product = get_product(db, product_id)
    if not product:
        return False
    db.delete(product)
    db.commit()
    return True


def increment_view_count(db: Session, product_id: int) -> None:
    """Bump a product's view counter without loading the whole model."""
    db.query(models.Product).filter(models.Product.id == product_id).update(
        {models.Product.view_count: models.Product.view_count + 1}
    )
    db.commit()


# ─────────────────────────── Image CRUD ───────────────────────────────────

def add_product_image(
    db: Session, product_id: int, url: str, alt_text: Optional[str] = None, is_primary: bool = False
) -> models.ProductImage:
    # If this is the first image, make it primary automatically
    existing = db.query(models.ProductImage).filter(
        models.ProductImage.product_id == product_id
    ).count()
    if existing == 0:
        is_primary = True

    image = models.ProductImage(
        product_id=product_id,
        url=url,
        alt_text=alt_text,
        is_primary=is_primary,
        sort_order=existing,
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


def delete_product_image(db: Session, image_id: int) -> bool:
    image = db.query(models.ProductImage).filter(models.ProductImage.id == image_id).first()
    if not image:
        return False
    db.delete(image)
    db.commit()
    return True


# ─────────────────────────── Inventory CRUD ───────────────────────────────

def get_inventory(db: Session, product_id: int) -> Optional[models.Inventory]:
    return db.query(models.Inventory).filter(models.Inventory.product_id == product_id).first()


def update_inventory(
    db: Session, product_id: int, data: schemas.InventoryUpdate
) -> Optional[models.Inventory]:
    inv = get_inventory(db, product_id)
    if not inv:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(inv, field, value)
    if data.quantity is not None:
        inv.last_restocked_at = datetime.utcnow()
    inv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(inv)
    return inv


# ────────────────────────── Dashboard stats ───────────────────────────────

def get_dashboard_stats(db: Session) -> schemas.DashboardStats:
    total_products = db.query(models.Product).count()
    active_products = db.query(models.Product).filter(models.Product.is_active == True).count()
    featured = db.query(models.Product).filter(models.Product.is_featured == True).count()
    total_categories = db.query(models.Category).filter(models.Category.is_active == True).count()

    out_of_stock = (
        db.query(models.Inventory)
        .filter(models.Inventory.quantity - models.Inventory.reserved_quantity <= 0)
        .count()
    )
    low_stock = (
        db.query(models.Inventory)
        .filter(
            models.Inventory.quantity - models.Inventory.reserved_quantity > 0,
            models.Inventory.quantity - models.Inventory.reserved_quantity <= models.Inventory.low_stock_threshold,
        )
        .count()
    )

    return schemas.DashboardStats(
        total_products=total_products,
        active_products=active_products,
        out_of_stock=out_of_stock,
        low_stock=low_stock,
        total_categories=total_categories,
        featured_products=featured,
    )
