import sys, os

# Add project directory to path
sys.path.append(os.getcwd())

# Import your FastAPI app from main.py
from main import app

# Passenger looks for 'application'
application = app