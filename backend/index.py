from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import datetime

# Sahi imports jo backend folder ke andar se files uthayengi
from backend import models
from backend.database import engine, Base, SessionLocal

# 1. Initialize App (Sirf aik baar)
app = FastAPI()

# 2. CORS Configuration (Aapki Vite app ke liye)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Database Tables Create Karein (with error handling)
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables initialized successfully")
except Exception as e:
    print(f"⚠️  Warning: Could not connect to database at startup: {e}")
    print("   Server will start, but database operations may fail until connection is restored.")

# 4. Dependency to get database access
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 5. Pydantic Schemas (Routes se hamesha upar)
class OrderRequest(BaseModel):
    product_id: int
    quantity: int

class ProductCreate(BaseModel):
    sku: str
    name: str
    current_stock: int
    reorder_point: int
    unit_cost: float
    lead_time_days: int = 7
    supplier_id: int | None = None

class SupplierCreate(BaseModel):
    name: str
    contact_email: str
    lead_time_days: int

# 6. API Routes

@app.get("/")
def read_root():
    return {"status": "Supply Chain API is Online"}

@app.get("/inventory")
def get_inventory(db: Session = Depends(get_db)):
    return db.query(models.Product).all()

@app.post("/reorder")
def process_reorder(request: OrderRequest, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == request.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    wait_days = product.lead_time_days if product.lead_time_days else 7
    projected_date = datetime.date.today() + datetime.timedelta(days=wait_days)
    
    product.next_delivery = projected_date
    product.current_stock += request.quantity
    db.commit()
    return {"message": "Order processed successfully", "new_stock": product.current_stock}

@app.post("/products")
def add_product(product: ProductCreate, db: Session = Depends(get_db)):
    product_data = product.model_dump()
    if product_data.get("lead_time_days"):
        product_data["next_delivery"] = datetime.date.today() + datetime.timedelta(days=product_data["lead_time_days"])
    
    new_item = models.Product(**product_data)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.get("/suppliers")
def get_suppliers(db: Session = Depends(get_db)):
    return db.query(models.Supplier).all()

@app.post("/suppliers")
def add_supplier(supplier: SupplierCreate, db: Session = Depends(get_db)):
    new_sup = models.Supplier(**supplier.model_dump())
    db.add(new_sup)
    db.commit()
    db.refresh(new_sup)
    return new_sup

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Product).filter(models.Product.id == product_id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"message": "Deleted"}