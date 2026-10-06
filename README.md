# ShopWave — E-Commerce Intern Project · Week 5

> Full-stack e-commerce application with a FastAPI backend and React + TypeScript frontend.

---

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Backend    | FastAPI, Pydantic v2, SQLAlchemy 2, SQLite   |
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS v4   |
| Routing    | React Router v6                               |
| Icons      | Lucide React                                  |

---

## Project Structure

```
Second-Project/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, routers
│   │   ├── database.py      # SQLAlchemy engine + session
│   │   ├── models.py        # ORM models (Category, Product, Inventory, ProductImage)
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── crud.py          # All database operations
│   │   └── routers/
│   │       ├── categories.py
│   │       └── products.py
│   ├── seed.py              # Demo data (20 products, 13 categories)
│   ├── requirements.txt
│   └── shopwave.db          # SQLite database (auto-created)
│
└── frontend/
    ├── src/
    │   ├── api.ts               # Typed API service layer
    │   ├── context/
    │   │   └── AppContext.tsx   # Global state (toasts)
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── ProductCard.tsx
    │   │   ├── CategoryBadge.tsx
    │   │   ├── StarRating.tsx
    │   │   ├── LoadingSpinner.tsx
    │   │   ├── EmptyState.tsx
    │   │   └── ToastContainer.tsx
    │   └── pages/
    │       ├── Home.tsx             # Hero, featured, new arrivals
    │       ├── Catalog.tsx          # Filtered + paginated listing
    │       ├── ProductDetail.tsx    # Image gallery, detail view
    │       ├── AdminProducts.tsx    # Admin table + stats
    │       └── AdminProductForm.tsx # Create / Edit form
    └── vite.config.ts
```

---

## Quick Start

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python seed.py            # Populate demo data (run once)
uvicorn app.main:app --reload
```

API available at: http://localhost:8000  
Interactive docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at: http://localhost:5173

---

## API Endpoints (Week 5)

### Categories
| Method | Path                        | Description          |
|--------|-----------------------------|----------------------|
| GET    | /api/v1/categories/         | List all categories  |
| GET    | /api/v1/categories/tree     | Hierarchical tree    |
| GET    | /api/v1/categories/{id}     | Single category      |
| POST   | /api/v1/categories/         | Create category      |
| PATCH  | /api/v1/categories/{id}     | Update category      |
| DELETE | /api/v1/categories/{id}     | Delete category      |

### Products
| Method | Path                              | Description                      |
|--------|-----------------------------------|----------------------------------|
| GET    | /api/v1/products/                 | Paginated list with filters      |
| GET    | /api/v1/products/featured         | Featured products                |
| GET    | /api/v1/products/new-arrivals     | New arrivals                     |
| GET    | /api/v1/products/{id}             | Product detail (bumps view count)|
| GET    | /api/v1/products/slug/{slug}      | By slug                          |
| GET    | /api/v1/products/admin/stats      | Dashboard statistics             |
| POST   | /api/v1/products/                 | Create product                   |
| PATCH  | /api/v1/products/{id}             | Update product                   |
| DELETE | /api/v1/products/{id}             | Delete product                   |
| PATCH  | /api/v1/products/{id}/inventory   | Update stock levels              |
| POST   | /api/v1/products/{id}/images      | Add image URL                    |

### Filter Parameters (GET /products/)
- `search` — full-text search (name, description, brand, tags, SKU)
- `category_id` — filter by category
- `min_price`, `max_price` — price range
- `brand` — brand filter
- `is_featured`, `is_new_arrival` — boolean flags
- `in_stock_only` — only show products with available stock
- `sort_by` — name | price | rating | sold_count | created_at
- `sort_dir` — asc | desc
- `page`, `page_size` — pagination

---

## Pages

| URL                            | Description                        |
|--------------------------------|------------------------------------|
| `/`                            | Home: hero, categories, featured   |
| `/catalog`                     | Full catalog with filters          |
| `/products/:slug`              | Product detail with image gallery  |
| `/admin/products`              | Admin: product table + stats       |
| `/admin/products/new`          | Create new product                 |
| `/admin/products/:id/edit`     | Edit existing product              |

---

## Week 6 Roadmap
- File upload for product images (drag & drop)
- Advanced search with highlighting
- Infinite scroll option
- Responsive mobile filter drawer
- Brand filter autocomplete
