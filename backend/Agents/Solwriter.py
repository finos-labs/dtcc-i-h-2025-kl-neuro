from langchain_groq import ChatGroq
import os
from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel
import re
import subprocess
from dotenv import load_dotenv
from Emit import *


load_dotenv()


model = ChatGroq(
    model="mistral-saba-24b",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)
wtsend("> Preparing Requirements for Smart Contract")
def WriteSol(name:str,prompt :str):
    result = model.invoke([HumanMessage(prompt),
                        SystemMessage("""
            You are a Solidity smart contract generator using version ^0.8.0.
            🔧 Instructions:
            - Generate clean, minimal, and working Solidity smart contracts.
            - Prefer simplicity and readability over advanced features.
            - Do NOT use external libraries like OpenZeppelin unless explicitly asked.
            - Avoid using abstract contracts, inheritance, or complex patterns.
            - If ETH transfer is requested, use `payable` and `(bool success, ) = to.call{value: amount}("");`.
            - Always include constructor, necessary state variables, and clear logic.
            - Add inline comments to explain each part of the code.
            - Do NOT include pseudocode, markdown formatting, or explanations.
            - Output ONLY the Solidity code.
            """)]).content

    match = re.search(r'```solidity\s*(.*?)```', result, re.DOTALL)
    code = match.group(1).strip() if match else result.strip()
    wtsend("Initial Solidity code")
    wsend(code)
    with open(f"X:\\DTCC_HACK\\work\\hard\\contracts\\{name}.sol", "w") as f:
        f.write(code)
    print("Code inserted into file")

    compileoutput = subprocess.run(
        [r"C:\\Users\\inrup\\AppData\\Roaming\\npm\\npx.cmd", "hardhat", "compile"],
        cwd="X:\\DTCC_HACK\\work\\hard",
        capture_output=True,
        text=True,
        check=False
    )
    wtsend("> Checking for compile errors and syntax error")
    if compileoutput.returncode != 0:
        print(f"\nHardhat compilation failed with exit code {compileoutput.returncode}!")
        wtsend(f">\nHardhat compilation failed with exit code {compileoutput.returncode}!")
        wsend("--- Compilation Standard Error ---")
        print("--- Compilation Standard Error ---")
        wtsend(compileoutput.stderr)
        print(compileoutput.stderr)
        wsend("--- Compilation Standard Output (if any) ---")
        print("--- Compilation Standard Output (if any) ---")
        wtsend(compileoutput.stdout)
        print(compileoutput.stdout)


        current_code = ""
        try:
            with open(f"X:\\DTCC_HACK\\work\\hard\\contracts\\{name}.sol", 'r') as file:
                current_code = file.read()
        except FileNotFoundError:
            print(f"Error: Contract file not found at X:\\DTCC_HACK\\work\\hard\\contracts\\{name}.sol")
            current_code = "Could not read the contract file."
        wsend("> Modifying Solidity contract code.....")
        messages = [
            SystemMessage("""
                You are a Solidity smart contract generator using version ^0.8.0.
                🔧 Instructions:
                - Generate clean, minimal, and working Solidity smart contracts.
                - Prefer simplicity and readability over advanced features.
                - Do NOT use external libraries like OpenZeppelin unless explicitly asked.
                - Avoid using abstract contracts, inheritance, or complex patterns.
                - If ETH transfer is requested, use `payable` and `(bool success, ) = to.call{value: amount}("");`.
                - Always include constructor, necessary state variables, and clear logic.
                - Add inline comments to explain each part of the code.
                - Do NOT include pseudocode, markdown formatting, or explanations.
                - Output ONLY the Solidity code.
                """),
            HumanMessage(f"""
                The previous Solidity contract you generated caused a compilation error.
                Please review the code and the error message to fix it.
                
                **Original Prompt:**
                {prompt}

                **Current Code:**
                ```solidity
                {current_code}
                ```

                **Compilation Error (stderr):**
                ```
                {compileoutput.stderr}
                ```
                
                **Compilation Output (stdout, if any):**
                ```
                {compileoutput.stdout}
                ```

                provide the corrected Solidity code.
                """)]
        wtsend("> Validated SOLIDITY CONTRACT")
        correction_result = model.invoke(messages).content
        


        match_correction = re.search(r'```solidity\s*(.*?)```', correction_result, re.DOTALL)
        corrected_code = match_correction.group(1).strip() if match_correction else correction_result.strip()
        wsend(corrected_code)
        print(corrected_code)


        with open(f"X:\\DTCC_HACK\\work\\hard\\contracts\\{name}.sol", "w") as f:
            f.write(corrected_code)
        print(f"\nCorrected code saved to X:\\DTCC_HACK\\work\\hard\\contracts\\{name}_corrected.sol")


    else:
        print(compileoutput.stdout)