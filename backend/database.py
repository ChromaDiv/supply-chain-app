import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load from the root directory
# Currently in database.py
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("❌ FATAL: DATABASE_URL not found!")

# Explicit check to catch the error early
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("❌ FATAL: DATABASE_URL not found! Ensure your .env file is in the root folder and named correctly.")

engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()