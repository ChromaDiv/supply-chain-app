from database import SessionLocal, engine, Base
from models import Supplier, Product
from datetime import date

def run_test():
    # 1. Create tables in Supabase
    print("--- Step 1: Creating Tables ---")
    Base.metadata.create_all(bind=engine)
    print("Tables verified/created.")

    # 2. Create a session
    db = SessionLocal()

    try:
        # 3. Add a Test Supplier
        print("\n--- Step 2: Adding Test Data ---")
        test_supplier = Supplier(
            name="Global Logistics Corp", 
            contact_email="supply@global.com", 
            lead_time_days=5
        )
        db.add(test_supplier)
        db.commit()
        db.refresh(test_supplier)
        print(f"Added Supplier: {test_supplier.name} (ID: {test_supplier.id})")

        # 4. Add a Test Product linked to that Supplier
        test_product = Product(
            sku="SC-001",
            name="Industrial Widget",
            current_stock=100,
            reorder_point=20,
            unit_cost=15.50,
            supplier_id=test_supplier.id,
            next_delivery=date(2026, 2, 1)
        )
        db.add(test_product)
        db.commit()
        print(f"Added Product: {test_product.name} linked to Supplier ID: {test_product.supplier_id}")

        # 5. Query and Verify Relationship
        print("\n--- Step 3: Verifying Relationships ---")
        product = db.query(Product).filter(Product.sku == "SC-001").first()
        print(f"Verified: Product '{product.name}' is supplied by '{product.supplier.name}'")

    except Exception as e:
        print(f"\nError occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_test()