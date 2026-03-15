import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Example Postgres URI format: postgresql://user:password@postgresserver/db
# We will use sqlite fallback for extremely easy local dev if psql isn't available outside docker
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./saas.db")

# Fix for Heroku/Railway postgres:// vs postgresql://
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# For sqlite connect_args is needed to share the DB connection between threads
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

try:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args=connect_args,
        pool_pre_ping=True # Health check for DB connections
    )
except Exception as e:
    print(f"CRITICAL: Failed to create database engine: {e}")
    # Fallback to local sqlite if Postgres fails to even initialize (optional)
    engine = create_engine("sqlite:///./fallback.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
