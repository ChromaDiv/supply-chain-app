from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base 
from pydantic import BaseModel # <--- Import Base from database directly
import models  # This stays so the tables are registered

import datetime  # Standard Python library for dates

from fastapi import Depends
from sqlalchemy.orm import Session
from database import SessionLocal

app = FastAPI()


# Dependency to get database access for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 2. DEFINE YOUR SCHEMAS FIRST (Must be above the routes)
class OrderRequest(BaseModel):
    product_id: int
    quantity: int

@app.post("/reorder")
def process_reorder(request: OrderRequest, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == request.product_id).first()
    
    # 1. Use the product's lead time (or 7 if not set)
    wait_days = product.lead_time_days if product.lead_time_days else 7
    
    # 2. Calculate the arrival date from TODAY
    projected_date = datetime.date.today() + datetime.timedelta(days=wait_days)
    
    # 3. Update the database record
    product.next_delivery = projected_date
    product.current_stock += request.quantity
    
    db.commit()
    return {"eta": projected_date.strftime("%B %d, %Y")}


@app.get("/inventory")
def get_inventory(db: Session = Depends(get_db)):
    items = db.query(models.Product).all()
    return items


@app.post("/reorder")
def process_reorder(request: OrderRequest, db: Session = Depends(get_db)):
    # 1. Find the product in the database
    product = db.query(models.Product).filter(models.Product.id == request.product_id).first()
    
    if not product:
        return {"error": "Product not found"}

    # 2. Update the stock level
    product.current_stock += request.quantity
    
    # 3. Save the changes
    db.commit()
    
    return {
        "message": f"Successfully ordered {request.quantity} units.",
        "new_stock": product.current_stock
    }


# CHANGE THIS LINE: Use Base directly, not models.Base
Base.metadata.create_all(bind=engine) 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Supply Chain API is Online"}


from pydantic import BaseModel

# A simple "Contract" for what the frontend must send us
class OrderRequest(BaseModel):
    product_id: int
    quantity: int




# A new schema for adding products
class ProductCreate(BaseModel):
    sku: str
    name: str
    current_stock: int
    reorder_point: int
    unit_cost: float
    lead_time_days: int = 7  # Default to 7 if the user doesn't provide it
    supplier_id: int | None = None

# 1. Add New Product
@app.post("/products")
def add_product(product: ProductCreate, db: Session = Depends(get_db)):

    product_data = product.dict()

    if "lead_time_days" in product_data and product_data["lead_time_days"]:
        days = product_data["lead_time_days"]
        product_data["next_delivery"] = datetime.date.today() + datetime.timedelta(days=days)


    new_item = models.Product(**product_data)
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

# 2. Delete Product
@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Product).filter(models.Product.id == product_id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"message": "Deleted"}