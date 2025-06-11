
        const { ethers } = require("hardhat");
        require("dotenv").config();

        async function main() {
        const provider = new ethers.JsonRpcProvider("http://35.95.15.31:8545/");
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const ContractFactory = await ethers.getContractFactory("CrowdFunding", wallet);
        const contract = await ContractFactory.deploy("0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", 34);
        await contract.waitForDeployment();
        console.log("✅ Deployed at:", contract.target);
        }

        main().catch(console.error);
        