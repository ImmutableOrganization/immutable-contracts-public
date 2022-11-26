import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    arbitrum: {
      url: 'https://arb1.arbitrum.io/rpc',
      accounts: [process.env.PRIVATE_KEY || '']
    },
    goerli: {
      url: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      accounts: [process.env.PRIVATE_KEY || '']
    }
  },
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ARBISCAN_API_KEY || '',
    }
  }
};

export default config;
