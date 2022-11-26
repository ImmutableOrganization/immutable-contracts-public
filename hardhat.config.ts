import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
      initialBaseFeePerGas: 0,
    },
    local: { url: "http://localhost:8545" },
    // export the NODE_URL environment variable to use remote nodes like Alchemy or Infura. ge
    // export NODE_URL=https://eth-mainnet.alchemyapi.io/v2/yourApiKey
    ropsten: {
      url: process.env.NODE_URL || "",
    },
    polygon_testnet: {
      url: process.env.NODE_URL || "https://rpc-mumbai.maticvigil.com",
    },
    polygon_mainnet: {
      url: process.env.NODE_URL || "https://rpc-mainnet.matic.quiknode.pro",
    },
    mainnet: {
      url: process.env.NODE_URL || "https://main-light.eth.linkpool.io",
    },
  },
};

export default config;
