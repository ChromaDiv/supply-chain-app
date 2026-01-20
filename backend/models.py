from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey # Added ForeignKey
from sqlalchemy.orm import relationship # Added for easier access
from database import Base

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    contact_email = Column(String)
    lead_time_days = Column(Integer, default=7)
    
    # Optional: allows you to see all products for a supplier (e.g., supplier.products)
    products = relationship("Product", back_populates="supplier")

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
    
    # LINK TO SUPPLIER:
    # We use "suppliers.id" (table_name.column_name)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    
    # Access the supplier object directly in Python
    supplier = relationship("Supplier", back_populates="products")