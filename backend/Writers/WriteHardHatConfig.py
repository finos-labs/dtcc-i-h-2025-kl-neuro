from Utils.Emit import *
from dotenv import load_dotenv
load_dotenv()
import os
BASE_PATH = os.getenv("BASE_PATH")
def generate_hardhat_config():
    wtsend("> Creating a Hardhat config file")
    content = """
        require("@nomicfoundation/hardhat-toolbox");
        require("dotenv").config();

        module.exports = {
        solidity: "0.8.20",
        networks: {
            custom: {
            url: "http://35.95.15.31:8545/",
            accounts: [process.env.PRIVATE_KEY]
            }
        }
        };
        """
    with open(f"{BASE_PATH}\\hardhat.config.js", "w", encoding="utf-8") as f:
        wsend("> ✅ Hardhat config file created")
        f.write(content)
        wsend(content)
    print("✅ hardhat.config.js created")