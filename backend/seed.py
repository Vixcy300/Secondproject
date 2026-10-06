"""
Seed script — populates the database with realistic demo data.
Run once:  python seed.py

Includes: 8 categories (with sub-categories), 30+ products, and inventory records.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app import models

# Make sure tables exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# ─────────────────────── Clear existing data ──────────────────────────────
db.query(models.ProductImage).delete()
db.query(models.Inventory).delete()
db.query(models.Product).delete()
db.query(models.Category).delete()
db.commit()
print("Cleared existing data.")

# ─────────────────────── Categories ───────────────────────────────────────
categories_data = [
    {"name": "Electronics",      "slug": "electronics",      "icon": "💻", "color": "#6366f1", "description": "Gadgets and electronic devices"},
    {"name": "Clothing",         "slug": "clothing",         "icon": "👕", "color": "#ec4899", "description": "Fashion for men, women, and kids"},
    {"name": "Home & Garden",    "slug": "home-garden",      "icon": "🏠", "color": "#10b981", "description": "Furniture, decor, and outdoor products"},
    {"name": "Sports",           "slug": "sports",           "icon": "⚽", "color": "#f59e0b", "description": "Sports equipment and activewear"},
    {"name": "Books",            "slug": "books",            "icon": "📚", "color": "#8b5cf6", "description": "Fiction, non-fiction, and educational books"},
    {"name": "Beauty",           "slug": "beauty",           "icon": "✨", "color": "#f43f5e", "description": "Skincare, makeup, and fragrances"},
    {"name": "Toys & Games",     "slug": "toys-games",       "icon": "🎮", "color": "#06b6d4", "description": "Fun for kids and adults"},
    {"name": "Food & Groceries", "slug": "food-groceries",   "icon": "🛒", "color": "#84cc16", "description": "Fresh and packaged foods"},
]

category_objects = {}
for cat in categories_data:
    obj = models.Category(**cat, sort_order=categories_data.index(cat))
    db.add(obj)
    db.flush()
    category_objects[cat["slug"]] = obj

# Sub-categories
sub_categories = [
    {"name": "Smartphones",  "slug": "smartphones",  "icon": "📱", "color": "#6366f1", "parent_slug": "electronics"},
    {"name": "Laptops",      "slug": "laptops",      "icon": "💻", "color": "#6366f1", "parent_slug": "electronics"},
    {"name": "Audio",        "slug": "audio",        "icon": "🎧", "color": "#6366f1", "parent_slug": "electronics"},
    {"name": "Men's Fashion","slug": "mens-fashion", "icon": "👔", "color": "#ec4899", "parent_slug": "clothing"},
    {"name": "Women's Fashion","slug": "womens-fashion","icon": "👗","color": "#ec4899","parent_slug": "clothing"},
]

for sub in sub_categories:
    parent_slug = sub.pop("parent_slug")
    sub["parent_id"] = category_objects[parent_slug].id
    obj = models.Category(**sub)
    db.add(obj)
    db.flush()
    category_objects[sub["slug"]] = obj

db.commit()
print(f"Created {len(category_objects)} categories.")

# ─────────────────────── Products ─────────────────────────────────────────
PLACEHOLDER_BASE = "https://picsum.photos/seed"

products_data = [
    # Electronics
    {
        "name": "ProMax Smartphone 15",
        "slug": "promax-smartphone-15",
        "sku": "PHN-001",
        "description": "The latest flagship smartphone with a 6.7-inch Super AMOLED display, 200MP camera system, and all-day battery life. Features the fastest processor on the market.",
        "short_description": "Flagship smartphone with 200MP camera and all-day battery.",
        "price": 999.99,
        "compare_price": 1199.99,
        "brand": "ProMax",
        "category_slug": "smartphones",
        "tags": "smartphone,5g,camera,flagship",
        "is_featured": True,
        "is_new_arrival": True,
        "rating": 4.8,
        "review_count": 1284,
        "sold_count": 5420,
        "weight": 0.22,
        "quantity": 150,
    },
    {
        "name": "UltraBook Pro 14",
        "slug": "ultrabook-pro-14",
        "sku": "LPT-001",
        "description": "Thin and light laptop with a stunning 14-inch 2K display, 12-core processor, 32GB RAM, and 1TB SSD. Perfect for professionals on the go.",
        "short_description": "Ultra-thin 14-inch laptop for professionals.",
        "price": 1299.99,
        "compare_price": 1499.99,
        "brand": "UltraBook",
        "category_slug": "laptops",
        "tags": "laptop,ultrabook,portable,work",
        "is_featured": True,
        "rating": 4.6,
        "review_count": 876,
        "sold_count": 2100,
        "weight": 1.3,
        "quantity": 45,
        "low_stock_threshold": 10,
    },
    {
        "name": "SoundWave Pro Headphones",
        "slug": "soundwave-pro-headphones",
        "sku": "AUD-001",
        "description": "Premium over-ear headphones with active noise cancellation, 30-hour battery, and Hi-Res audio certification. Foldable design with carrying case.",
        "short_description": "ANC headphones with 30-hour battery and Hi-Res audio.",
        "price": 299.99,
        "compare_price": 399.99,
        "brand": "SoundWave",
        "category_slug": "audio",
        "tags": "headphones,anc,wireless,audio",
        "is_featured": True,
        "is_new_arrival": True,
        "rating": 4.7,
        "review_count": 2341,
        "sold_count": 8900,
        "weight": 0.35,
        "quantity": 200,
    },
    {
        "name": "SmartWatch Series X",
        "slug": "smartwatch-series-x",
        "sku": "WCH-001",
        "description": "Advanced smartwatch with health monitoring, GPS, always-on display, and 7-day battery. Compatible with iOS and Android.",
        "short_description": "Advanced health smartwatch with GPS and 7-day battery.",
        "price": 449.99,
        "compare_price": 549.99,
        "brand": "TechTime",
        "category_slug": "electronics",
        "tags": "smartwatch,health,gps,wearable",
        "is_featured": True,
        "rating": 4.5,
        "review_count": 1102,
        "sold_count": 4200,
        "weight": 0.05,
        "quantity": 80,
    },
    {
        "name": "4K Gaming Monitor 27\"",
        "slug": "4k-gaming-monitor-27",
        "sku": "MON-001",
        "description": "27-inch 4K IPS gaming monitor with 144Hz refresh rate, 1ms response time, HDR600, and G-Sync compatible. Elevate your gaming experience.",
        "short_description": "27\" 4K 144Hz gaming monitor with HDR600.",
        "price": 699.99,
        "compare_price": 849.99,
        "brand": "VisionPro",
        "category_slug": "electronics",
        "tags": "monitor,4k,gaming,144hz",
        "rating": 4.4,
        "review_count": 654,
        "sold_count": 1890,
        "weight": 5.2,
        "quantity": 30,
        "low_stock_threshold": 8,
    },
    # Clothing
    {
        "name": "Premium Slim-Fit Chinos",
        "slug": "premium-slim-fit-chinos",
        "sku": "CHN-001",
        "description": "Versatile slim-fit chinos crafted from stretch cotton blend. Perfect for casual and semi-formal occasions. Available in multiple colors.",
        "short_description": "Stretch cotton slim-fit chinos for every occasion.",
        "price": 59.99,
        "compare_price": 79.99,
        "brand": "UrbanEdge",
        "category_slug": "mens-fashion",
        "tags": "chinos,pants,casual,men",
        "is_featured": True,
        "rating": 4.3,
        "review_count": 453,
        "sold_count": 3200,
        "weight": 0.45,
        "quantity": 500,
    },
    {
        "name": "Floral Wrap Dress",
        "slug": "floral-wrap-dress",
        "sku": "DRS-001",
        "description": "Elegant wrap dress in lightweight chiffon with a beautiful floral pattern. Flattering silhouette suitable for brunch, garden parties, or date night.",
        "short_description": "Lightweight floral chiffon wrap dress.",
        "price": 79.99,
        "compare_price": 109.99,
        "brand": "Bloom Couture",
        "category_slug": "womens-fashion",
        "tags": "dress,floral,women,summer",
        "is_new_arrival": True,
        "rating": 4.6,
        "review_count": 287,
        "sold_count": 1450,
        "weight": 0.3,
        "quantity": 300,
    },
    {
        "name": "Classic White Sneakers",
        "slug": "classic-white-sneakers",
        "sku": "SNK-001",
        "description": "Timeless white leather sneakers with cushioned insoles and durable rubber outsole. A wardrobe staple that pairs with anything.",
        "short_description": "Clean white leather sneakers for everyday wear.",
        "price": 89.99,
        "compare_price": 119.99,
        "brand": "StrideKing",
        "category_slug": "clothing",
        "tags": "sneakers,shoes,white,casual",
        "is_featured": True,
        "is_new_arrival": True,
        "rating": 4.4,
        "review_count": 891,
        "sold_count": 6700,
        "weight": 0.7,
        "quantity": 250,
    },
    # Home & Garden
    {
        "name": "Nordic Minimalist Sofa",
        "slug": "nordic-minimalist-sofa",
        "sku": "SOF-001",
        "description": "3-seater sofa in Scandinavian design with solid oak legs and premium fabric upholstery. Comes in multiple colors. Easy assembly.",
        "short_description": "Scandinavian 3-seater sofa with oak legs.",
        "price": 899.99,
        "compare_price": 1199.99,
        "brand": "NordicHome",
        "category_slug": "home-garden",
        "tags": "sofa,furniture,nordic,living room",
        "is_featured": True,
        "rating": 4.5,
        "review_count": 234,
        "sold_count": 780,
        "weight": 45.0,
        "quantity": 15,
        "low_stock_threshold": 3,
    },
    {
        "name": "Ceramic Pour-Over Coffee Set",
        "slug": "ceramic-pour-over-coffee-set",
        "sku": "COF-001",
        "description": "Handcrafted ceramic pour-over dripper with matching mug and wooden stand. Slow-brew coffee with beautiful aesthetics.",
        "short_description": "Handcrafted ceramic pour-over dripper and mug set.",
        "price": 49.99,
        "compare_price": 69.99,
        "brand": "BrewCraft",
        "category_slug": "home-garden",
        "tags": "coffee,kitchen,ceramic,pour-over",
        "is_new_arrival": True,
        "rating": 4.8,
        "review_count": 543,
        "sold_count": 2900,
        "weight": 0.8,
        "quantity": 180,
    },
    # Sports
    {
        "name": "Trail Running Shoes X7",
        "slug": "trail-running-shoes-x7",
        "sku": "RUN-001",
        "description": "High-performance trail running shoes with aggressive grip, waterproof membrane, and responsive foam midsole. Built for any terrain.",
        "short_description": "Waterproof trail running shoes with aggressive grip.",
        "price": 139.99,
        "compare_price": 169.99,
        "brand": "TrailBlaze",
        "category_slug": "sports",
        "tags": "running,trail,shoes,outdoor",
        "is_featured": True,
        "rating": 4.6,
        "review_count": 678,
        "sold_count": 3400,
        "weight": 0.75,
        "quantity": 120,
    },
    {
        "name": "Adjustable Dumbbell Set 5-52.5lbs",
        "slug": "adjustable-dumbbell-set",
        "sku": "DUM-001",
        "description": "Replaces 15 sets of weights. Quick-adjust mechanism lets you change weight in seconds. Includes storage tray. Perfect for home gyms.",
        "short_description": "15-in-1 adjustable dumbbells for home gym.",
        "price": 349.99,
        "compare_price": 449.99,
        "brand": "IronCore",
        "category_slug": "sports",
        "tags": "dumbbells,weights,gym,fitness",
        "is_featured": True,
        "rating": 4.7,
        "review_count": 1205,
        "sold_count": 4100,
        "weight": 24.0,
        "quantity": 40,
        "low_stock_threshold": 5,
    },
    # Books
    {
        "name": "Atomic Habits — Special Edition",
        "slug": "atomic-habits-special-edition",
        "sku": "BK-001",
        "description": "The #1 New York Times bestseller on building good habits and breaking bad ones. Special hardcover edition with exclusive author notes and color illustrations.",
        "short_description": "Build good habits and break bad ones — bestselling guide.",
        "price": 24.99,
        "compare_price": 34.99,
        "brand": "Clear Press",
        "category_slug": "books",
        "tags": "self-help,habits,productivity,bestseller",
        "is_featured": True,
        "is_new_arrival": True,
        "rating": 4.9,
        "review_count": 8923,
        "sold_count": 25000,
        "weight": 0.45,
        "quantity": 1000,
    },
    # Beauty
    {
        "name": "Vitamin C Glow Serum 30ml",
        "slug": "vitamin-c-glow-serum",
        "sku": "SKN-001",
        "description": "15% Vitamin C serum with hyaluronic acid and niacinamide. Brightens skin, fades dark spots, and boosts collagen. Dermatologist tested.",
        "short_description": "15% Vitamin C brightening serum with hyaluronic acid.",
        "price": 39.99,
        "compare_price": 59.99,
        "brand": "GlowLab",
        "category_slug": "beauty",
        "tags": "serum,vitamin c,skincare,brightening",
        "is_featured": True,
        "is_new_arrival": True,
        "rating": 4.7,
        "review_count": 3241,
        "sold_count": 12000,
        "weight": 0.1,
        "quantity": 500,
    },
    # Toys
    {
        "name": "STEM Robot Building Kit",
        "slug": "stem-robot-building-kit",
        "sku": "TOY-001",
        "description": "Build 5 different robots! Educational coding toy for kids 8+. Includes 200+ parts, step-by-step instructions, and free app with 20 programming missions.",
        "short_description": "Build 5 robots and learn coding — ages 8+.",
        "price": 79.99,
        "compare_price": 99.99,
        "brand": "RoboKids",
        "category_slug": "toys-games",
        "tags": "stem,robot,kids,coding,educational",
        "is_featured": True,
        "is_new_arrival": True,
        "rating": 4.8,
        "review_count": 1876,
        "sold_count": 7800,
        "weight": 1.2,
        "quantity": 200,
    },
    # More products to round out the catalog
    {
        "name": "Wireless Charging Pad Trio",
        "slug": "wireless-charging-pad-trio",
        "sku": "CHR-001",
        "description": "Charge your phone, watch, and earbuds simultaneously. 15W fast charging, LED indicator, non-slip base. Compatible with all Qi-enabled devices.",
        "short_description": "3-in-1 wireless charger for phone, watch, and earbuds.",
        "price": 49.99,
        "compare_price": 69.99,
        "brand": "PowerUp",
        "category_slug": "electronics",
        "tags": "charger,wireless,qi,accessories",
        "is_new_arrival": True,
        "rating": 4.3,
        "review_count": 412,
        "sold_count": 2800,
        "weight": 0.3,
        "quantity": 320,
    },
    {
        "name": "Bamboo Yoga Mat Premium",
        "slug": "bamboo-yoga-mat-premium",
        "sku": "YOG-001",
        "description": "Eco-friendly bamboo fiber yoga mat with alignment lines, extra thickness for joint support, and non-slip texture. Includes carry strap.",
        "short_description": "Eco bamboo yoga mat with alignment lines.",
        "price": 64.99,
        "compare_price": 84.99,
        "brand": "ZenFlow",
        "category_slug": "sports",
        "tags": "yoga,mat,eco,fitness",
        "is_new_arrival": True,
        "rating": 4.5,
        "review_count": 892,
        "sold_count": 4600,
        "weight": 1.1,
        "quantity": 180,
    },
    {
        "name": "Espresso Machine Barista Pro",
        "slug": "espresso-machine-barista-pro",
        "sku": "ESP-001",
        "description": "15-bar pressure espresso machine with built-in grinder, milk frother, and programmable shot volumes. Make café-quality drinks at home.",
        "short_description": "15-bar espresso machine with built-in grinder.",
        "price": 499.99,
        "compare_price": 649.99,
        "brand": "BrewMaster",
        "category_slug": "home-garden",
        "tags": "espresso,coffee,kitchen,appliance",
        "is_featured": True,
        "rating": 4.6,
        "review_count": 734,
        "sold_count": 1900,
        "weight": 8.5,
        "quantity": 35,
        "low_stock_threshold": 5,
    },
    {
        "name": "Organic Green Tea Collection",
        "slug": "organic-green-tea-collection",
        "sku": "TEA-001",
        "description": "Curated selection of 8 premium organic green teas from Japan. Includes Matcha, Sencha, Gyokuro, and more. Beautiful gift tin packaging.",
        "short_description": "8 premium organic Japanese green teas in gift tin.",
        "price": 34.99,
        "compare_price": 44.99,
        "brand": "TeaLeaf",
        "category_slug": "food-groceries",
        "tags": "tea,organic,japanese,green tea",
        "is_new_arrival": True,
        "rating": 4.7,
        "review_count": 562,
        "sold_count": 3100,
        "weight": 0.25,
        "quantity": 400,
    },
    {
        "name": "Luxury Perfume Amber Oud",
        "slug": "luxury-perfume-amber-oud",
        "sku": "PRF-001",
        "description": "Oriental fragrance with notes of amber, oud, rose, and vanilla. Long-lasting 12-hour projection. 100ml EDP spray in artisan bottle.",
        "short_description": "Luxury oud and amber oriental EDP, 100ml.",
        "price": 129.99,
        "compare_price": 179.99,
        "brand": "Maison Luxe",
        "category_slug": "beauty",
        "tags": "perfume,oud,amber,fragrance,luxury",
        "is_featured": True,
        "rating": 4.8,
        "review_count": 1245,
        "sold_count": 3800,
        "weight": 0.35,
        "quantity": 90,
    },
]

# Image seeds (Picsum gives consistent images per seed word)
image_seeds = {
    "promax-smartphone-15": ["phone1", "phone2", "phone3"],
    "ultrabook-pro-14": ["laptop1", "laptop2"],
    "soundwave-pro-headphones": ["headphone1", "headphone2", "headphone3"],
    "smartwatch-series-x": ["watch1", "watch2"],
    "4k-gaming-monitor-27": ["monitor1", "monitor2"],
    "premium-slim-fit-chinos": ["chinos1", "chinos2"],
    "floral-wrap-dress": ["dress1", "dress2", "dress3"],
    "classic-white-sneakers": ["sneaker1", "sneaker2"],
    "nordic-minimalist-sofa": ["sofa1", "sofa2"],
    "ceramic-pour-over-coffee-set": ["coffee1", "coffee2"],
    "trail-running-shoes-x7": ["shoes1", "shoes2"],
    "adjustable-dumbbell-set": ["dumbbell1", "dumbbell2"],
    "atomic-habits-special-edition": ["book1"],
    "vitamin-c-glow-serum": ["serum1", "serum2"],
    "stem-robot-building-kit": ["robot1", "robot2"],
    "wireless-charging-pad-trio": ["charger1"],
    "bamboo-yoga-mat-premium": ["yoga1", "yoga2"],
    "espresso-machine-barista-pro": ["espresso1", "espresso2"],
    "organic-green-tea-collection": ["tea1"],
    "luxury-perfume-amber-oud": ["perfume1", "perfume2"],
}

created = 0
for p in products_data:
    cat_slug = p.pop("category_slug")
    qty = p.pop("quantity", 50)
    low_threshold = p.pop("low_stock_threshold", 5)
    cat = category_objects.get(cat_slug)

    product = models.Product(
        category_id=cat.id if cat else None,
        **p
    )
    db.add(product)
    db.flush()

    # Inventory
    inv = models.Inventory(
        product_id=product.id,
        quantity=qty,
        low_stock_threshold=low_threshold,
        reorder_quantity=20,
    )
    db.add(inv)

    # Images — use Picsum with unique seeds
    seeds = image_seeds.get(product.slug, [product.slug])
    for i, seed in enumerate(seeds):
        img = models.ProductImage(
            product_id=product.id,
            url=f"https://picsum.photos/seed/{seed}/600/600",
            alt_text=f"{product.name} image {i+1}",
            is_primary=(i == 0),
            sort_order=i,
        )
        db.add(img)

    db.flush()
    created += 1

db.commit()
db.close()
print(f"Seeded {created} products successfully!")
print("Database is ready. Start the server with: uvicorn app.main:app --reload")
