
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
        