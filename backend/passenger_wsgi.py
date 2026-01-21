import os
import sys

# Tell the server where the files are
sys.path.insert(0, os.path.dirname(__file__))

# Import 'app' from main.py and rename it to 'application'
# Phusion Passenger (Hostinger's server) looks for 'application'
from main import app as application