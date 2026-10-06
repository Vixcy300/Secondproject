"""
ORM Models — the shape of every table in the database.

Tables:
  categories  - product categories (can be nested with parent_id)
  products    - the main product catalogue
  product_images - multiple images per product
  inventory   - stock levels, low-stock thresholds, reorder info
"""

from datetime import datetime
from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey,
    Integer, String, Text, func
)
from sqlalchemy.orm import relationship

from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(120), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)          # emoji or icon name
    color = Column(String(20), nullable=True)          # hex color for UI badges
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Self-referential relationship for sub-categories
    parent = relationship("Category", back_populates="children", remote_side=[id])
    children = relationship("Category", back_populates="parent", lazy="select")
    products = relationship("Product", back_populates="category", lazy="dynamic")

    @property
    def product_count(self):
        return self.products.count()


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(220), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    sku = Column(String(100), unique=True, index=True, nullable=True)
    price = Column(Float, nullable=False)
    compare_price = Column(Float, nullable=True)       # original price for strikethrough
    cost_price = Column(Float, nullable=True)          # internal cost (admin only)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    brand = Column(String(100), nullable=True)
    tags = Column(String(500), nullable=True)           # comma-separated tags
    weight = Column(Float, nullable=True)               # in kg
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    is_new_arrival = Column(Boolean, default=False)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    sold_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    inventory = relationship("Inventory", back_populates="product", uselist=False, cascade="all, delete-orphan")

    @property
    def primary_image(self):
        """Return the first image marked as primary, or the first image, or None."""
        primary = [img for img in self.images if img.is_primary]
        if primary:
            return primary[0].url
        return self.images[0].url if self.images else None

    @property
    def discount_percent(self):
        if self.compare_price and self.compare_price > self.price:
            return round((1 - self.price / self.compare_price) * 100)
        return None


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    url = Column(String(500), nullable=False)
    alt_text = Column(String(200), nullable=True)
    is_primary = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())

    product = relationship("Product", back_populates="images")


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), unique=True, nullable=False)
    quantity = Column(Integer, default=0)
    reserved_quantity = Column(Integer, default=0)  # held by open carts/orders
    low_stock_threshold = Column(Integer, default=5)
    reorder_quantity = Column(Integer, default=10)
    location = Column(String(100), nullable=True)   # warehouse / shelf location
    last_restocked_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    product = relationship("Product", back_populates="inventory")

    @property
    def available_quantity(self):
        """Stock available for new orders (excludes reserved)."""
        return max(0, self.quantity - self.reserved_quantity)

    @property
    def stock_status(self):
        avail = self.available_quantity
        if avail == 0:
            return "out_of_stock"
        if avail <= self.low_stock_threshold:
            return "low_stock"
        return "in_stock"
