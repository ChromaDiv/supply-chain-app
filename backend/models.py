from sqlalchemy import Column, Integer, String, Float, Date # Ensure Date is imported
from backend.database import Base # Ensure this matches

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    contact_email = Column(String)
    lead_time_days = Column(Integer, default=7)

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True)
    name = Column(String)
    current_stock = Column(Integer)
    reorder_point = Column(Integer)
    unit_cost = Column(Float)
    lead_time_days = Column(Integer, default=7)
    next_delivery = Column(Date, nullable=True)
    # ADD THIS LINE:
    supplier_id = Column(Integer, nullable=True)