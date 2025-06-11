from langchain_groq import ChatGroq
import os
from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel
import re
import subprocess
from dotenv import load_dotenv
from Utils.Emit import *
load_dotenv()
load_dotenv()
BASE_PATH = os.getenv("BASE_PATH")
model = ChatGroq(
    model="mistral-saba-24b",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)
wtsend("Generating a testing Code for Solidity contract")
def generate_tests(code:str,name:str):
    mess =[
        HumanMessage(f" solidity contract code {code} "),
        SystemMessage("""
            You are a smart contract testing expert.
            You will be given a Solidity contract source code.
            Generate Hardhat JavaScript test code that thoroughly tests this contract.
            Focus on deployment, important functions, edge cases, and events.
            - Do NOT include pseudocode, markdown formatting, or explanations.
            - Output ONLY the Solidity code.
            """)
    ]


    testcode = model.invoke(mess).content
    match = re.search(r'```javascript\s*(.*?)```', testcode, re.DOTALL)
    code = match.group(1).strip() if match else testcode.strip()
    with open(f"{BASE_PATH}\\test\\{name}.js", "w") as f:
        f.write(code)
        wtsend("> Generated test code and saved the file")
        wsend(code)
        wsend("\n\n")
    print("Test inserted into file")
    wtsend(" > ✅ Deployed Smart Contract")