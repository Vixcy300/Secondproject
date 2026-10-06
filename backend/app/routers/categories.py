"""Categories router."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("/", response_model=List[schemas.CategoryOut])
def list_categories(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
):
    """Return all active categories. Pass ?include_inactive=true to also get inactive ones."""
    return crud.get_categories(db, include_inactive=include_inactive)


@router.get("/tree", response_model=List[schemas.CategoryOut])
def category_tree(db: Session = Depends(get_db)):
    """Return only top-level categories; children are nested inside each."""
    return crud.get_root_categories(db)


@router.get("/{category_id}", response_model=schemas.CategoryOut)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = crud.get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.get("/slug/{slug}", response_model=schemas.CategoryOut)
def get_category_by_slug(slug: str, db: Session = Depends(get_db)):
    category = crud.get_category_by_slug(db, slug)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post("/", response_model=schemas.CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(data: schemas.CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category. Slug is auto-generated from name if omitted."""
    # Check for slug conflict
    if crud.get_category_by_slug(db, data.slug or ""):
        raise HTTPException(status_code=400, detail="A category with this slug already exists")
    return crud.create_category(db, data)


@router.patch("/{category_id}", response_model=schemas.CategoryOut)
def update_category(
    category_id: int, data: schemas.CategoryUpdate, db: Session = Depends(get_db)
):
    updated = crud.update_category(db, category_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    if not crud.delete_category(db, category_id):
        raise HTTPException(status_code=404, detail="Category not found")
