from typing import List
import os
from Utils.Emit import *
from dotenv import load_dotenv
load_dotenv()
BASE_PATH = os.getenv("BASE_PATH")
def generate_deploy_script(name: str, args: List[str]):
    os.makedirs(f"{BASE_PATH}\\Scripts", exist_ok=True)
    arg_string = ", ".join([f'"{a}"' if not a.isdigit() else a for a in args])
    wtsend("> Generating a deploy Script")
    content = f"""
    const {{ ethers }} = require("hardhat");
    require("dotenv").config();

    async function main() {{
    const provider = new ethers.JsonRpcProvider("http://35.95.15.31:8545/");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const ContractFactory = await ethers.getContractFactory("{name}", wallet);
    const contract = await ContractFactory.deploy({arg_string});
    await contract.waitForDeployment();
    console.log("✅ Deployed at:", contract.target);
        }}

    main().catch(console.error);"""
    with open(os.path.join(f"{BASE_PATH}\Scripts", "deploy.js"), "w", encoding="utf-8") as f:
        f.write(content)
        wsend(content)
    
    print("Deployment script written")
    

    