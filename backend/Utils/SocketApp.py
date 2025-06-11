from flask import Flask, request
from flask_socketio import SocketIO
app = Flask(__name__)
socketio = SocketIO(app,
                  cors_allowed_origins="*",
                  ping_timeout=300,
                  ping_interval=15,
                  max_http_buffer_size=100 * 1024 * 1024,
                  engineio_logger=True,
                  async_mode='threading')