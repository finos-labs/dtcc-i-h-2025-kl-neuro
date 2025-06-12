from flask import Flask, request, jsonify
from flask_socketio import SocketIO
import threading
import time
import logging
from Writers.Solwriter import WriteSol
from Utils.getinp import extract_constructor_parameters
from Writers.Writedeploy import generate_deploy_script
from Writers.WriteHardHatConfig import generate_hardhat_config
from Writers.TestWriter import generate_tests
from Utils.SocketApp import app,socketio
from Utils.ZipCreater import create_zip_from_files
import subprocess
from langchain_groq import ChatGroq
import re
import os
from dotenv import load_dotenv
load_dotenv()
BASE_PATH = os.getenv("BASE_PATH")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
from flask_cors import CORS
CORS(app)
llm = ChatGroq(
    model="mistral-saba-24b",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY2")
)
active_connections = {}

# Store session-specific context (e.g., for each client/session ID)
session_context = {}

def wsend(event: str, data: str):
    socketio.emit(event, {'data': data})
    socketio.sleep(0)

@socketio.on('connect')
def handle_connect():
    sid = request.sid
    active_connections[sid] = time.time()
    session_context[sid] = {}  # Initialize context for this client
    logger.info(f"Client connected: {sid}")

    def keepalive_task():
        while sid in active_connections:
            try:
                socketio.emit('heartbeat', {'ts': time.time()}, room=sid)
                time.sleep(20)
            except:
                break

    threading.Thread(target=keepalive_task, daemon=True).start()

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    active_connections.pop(sid, None)
    session_context.pop(sid, None)
    logger.info(f"Client disconnected: {sid}")

@socketio.on('client_keepalive')
def handle_client_keepalive(data):
    sid = request.sid
    if sid in active_connections:
        active_connections[sid] = time.time()
        socketio.emit('keepalive_ack', {'server_time': time.time()}, room=sid)

@socketio.on('prompt')
def handle_prompt(data):
    print("got request")
    sid = request.sid
    name = data['name']
    prompt = data['prompt']

    wsend("update", "Writing Solidity code")
    WriteSol(name, prompt)

    wsend("update", "saving contract file")
    filepath = f"{BASE_PATH}\\contracts\\{name}.sol"
    with open(filepath, "r") as file:
        code = file.read()

    wsend("update", "extracting constructor inputs")
    constructor_fields = extract_constructor_parameters(code)
    wsend("workflowt", "> Extracting inputs")
    wsend("request_inputs", {"fields": constructor_fields})

    contract_match = re.search(r'contract\s+(\w+)', code)
    contract_name = contract_match.group(1) if contract_match else "Generated"
    print("CONTRACT NAME \n\n")
    print(contract_name)

    # Store values for later
    session_context[sid] = {
        "name": name,
        "working_code": code,
        "inp": constructor_fields,
        "contract_name": contract_name
    }

@socketio.on('inputs_response')
def handle_input_response(data):
    sid = request.sid
    context = session_context.get(sid, {})
    if not context:
        wsend("workflowt", "Error: No context found for session.")
        return

    inp = context.get("inp", [])
    contract_name = context.get("contract_name", "Unknown")
    working_code = context.get("working_code", "")
    name = context.get("name", "Unknown")

    print("CONTRACT NAME\n", contract_name)

    try:
        construct_values = [data[field] for field in inp]
    except KeyError as e:
        wsend("workflowt", f"Missing input value for field: {e}")
        return

    wsend("update", "generating deploy script")
    print("Constructor values:", construct_values)
    print(contract_name)
    generate_deploy_script(name=contract_name, args=construct_values)
    wsend("update", "generating hardhat config")
    generate_hardhat_config()
    wsend("update", "creating Test cases")
    generate_tests(working_code, name)
    
    session_context[sid].update({
        "construct_values": construct_values
    })

    wsend("request_deploy_decision", "Do you want to deploy the contract? (yes/no)")

@socketio.on('deploy_decision')
def handle_deploy_decision(data):
    sid = request.sid
    context = session_context.get(sid, {})
    if data is True:
        wsend("update", "deploying code")
        s = subprocess.run(["node", "scripts/deploy.js"], cwd=BASE_PATH,capture_output=True,text=True)
        wsend("update",f"contract deployed at\n {s.stdout}")
        print(f"\n {s.stdout}")
    else:
        wsend("deployment skipped")
    name = context.get("name", "Unknown")
    contract_name = context.get("contract_name", "Unknown")
    print("\n\n")
    print(name)
    print(contract_name)
    print("\n\n")
    fil = [
    f"{BASE_PATH}\\contracts\\{name}.sol",
    f"{BASE_PATH}\\Scripts\\deploy.js",
    f"{BASE_PATH}\\test\\{name}.js",
    f"{BASE_PATH}\\artifacts\\contracts\\{name}.sol\\{contract_name}.json",
    f"{BASE_PATH}\\artifacts\\contracts\\{name}.sol\\{contract_name}.dbg.json"
    ]

    zip_data = create_zip_from_files(fil)

    socketio.emit('zip_response', zip_data, room=sid)
    socketio.sleep(0)
    for file_path in fil:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Deleted: {file_path}")
        else:
            print(f"Not found for deletion: {file_path}")

    wsend("update", "end")

GENERATED_DIR = os.path.join(app.static_folder, "generated")
os.makedirs(GENERATED_DIR, exist_ok=True)

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    abi = data['abi']
    address = data['address']

    # Build the prompt
    prompt = f"""
            Write a clean, working HTML page that:

            Connects to an Ethereum contract using ethers.js v6.14.3 from CDN
            Uses this ABI: {abi} (replace with your contract ABI)
            Uses this contract address: {address} (replace with your contract address)

            Requirements:

            Connect Wallet button (MetaMask) showing connected address when connected
            Use only: <script src="https://cdn.jsdelivr.net/npm/ethers@6.14.3/dist/ethers.umd.min.js"></script>
            Show all supported functions to interact with the contract based on the ABI
            Use ethers.js v6 syntax (not v5)
            No external CSS frameworks - use inline styles or minimal internal CSS only
            Clean, modern layout - the page should be modern and full-page with appealing look
            Handle errors gracefully with user-friendly error messages
            Responsive design that works on mobile and desktop
            Loading states for async operations
            Transaction status feedback (pending, success, failed)
            Input validation for function parameters
            Network detection (show current network)

            Technical Specifications:

            Use ethers.BrowserProvider for wallet connection
            Implement proper async/await error handling
            Show gas estimates where applicable
            Display transaction hashes with links to explorer
            Format addresses and large numbers properly
            Include disconnect wallet functionality
            Auto-detect and display all contract functions (read and write)
            Show function parameters with appropriate input types

            UI/UX Requirements:

            Modern gradient background
            Glass-morphism effects
            Smooth animations and transitions
            Clear visual hierarchy
            Status indicators (connected/disconnected)
            Loading spinners for pending operations
            Success/error notifications
            Mobile-responsive design

            Deliverable:
            Return a complete, single HTML file with all CSS and JavaScript inline. The code should be production-ready and work immediately when opened in a browser with MetaMask installed.
            Format: Provide only the HTML code in triple backticks html ...  with no explanations.
        """
    # Call LLM
    response = llm.invoke(prompt)
    content = response.content
    print(content)
    match_correction = re.search(r'```html(.*?)```', content, re.DOTALL)
    html_code = match_correction.group(1).strip() if match_correction else content.strip()
    print(html_code)

    

    html_file_path = os.path.join(GENERATED_DIR, "dapp.html")
    with open(html_file_path, 'w', encoding='utf-8') as f:
        f.write(html_code)
        print("file written")
    print(html_file_path)
    return jsonify({"url": "http://127.0.0.1:5000/static/generated/dapp.html"})


if __name__ == '__main__':
    logger.info("Starting backend server")
    socketio.run(app, host='127.0.0.1', port=5000, debug=True, use_reloader=False)
