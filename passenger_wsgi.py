import sys, os

# Add your project directory to the sys.path
sys.path.append(os.getcwd())

# Import your FastAPI app
from main import app

# Passenger expects an object named 'application'
application = app