import sys, os
from a2wsgi import ASGIMiddleware

# Insert the project root in the path so we can import 'backend'
sys.path.insert(0, os.path.dirname(__file__))

# Import the FastAPI 'app' from backend/index.py
from backend.index import app as application_asgi

# Wrap the ASGI app with ASGIMiddleware to make it WSGI compatible
application = ASGIMiddleware(application_asgi)