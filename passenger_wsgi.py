import sys, os

# Tells Passenger where your code lives
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

# Imports 'app' from your backend/index.py
from backend.index import app as application