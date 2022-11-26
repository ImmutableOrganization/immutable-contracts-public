import { ethers } from "hardhat";

async function main() {
  const token = await ethers.getContractFactory("ImutableToken");
  const tokenContract = await token.deploy();
  await tokenContract.deployed();

  console.log("Token deployed to:", tokenContract.address);


  const Governor = await ethers.getContractFactory("ImmutableGovernor");
  const governor = await Governor.deploy("0x17482Fae07cF2fF29233C4c4e29B5deF5130B7a1", "0x0000000000000000000000000000000000000000");
  await governor.deployed();

  console.log("Governor deployed to:", governor.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
