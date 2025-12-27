"""
Server package for AI Agent Server.
Organizes settings, app initialization, utilities, routes, and domain logic.
"""

# Expose Flask app for external import
from .app import app  # noqa: F401

# Ensure routes are registered on import of package
from . import routes  # noqa: F401
from . import routes_auxiliary  # noqa: F401


