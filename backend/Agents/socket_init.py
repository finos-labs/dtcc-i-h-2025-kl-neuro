# socketio_instance.py
# to use same socket in whole application
from flask_socketio import SocketIO

SOCKET = SocketIO(cors_allowed_origins="*")
