from SocketApp import socketio
import time
def usend(event:str,data:str):
    socketio.emit(event, {'data' : data})
    socketio.sleep(0)

def wsend(data:str):
    socketio.emit("workflow", {'data' : data})
    socketio.sleep(0)
    time.sleep(0.2)
def wtsend(data:str):
    socketio.emit("workflowt", {'data' : data})
    socketio.sleep(0)
    time.sleep(0.2)