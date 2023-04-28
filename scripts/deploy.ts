import { ethers } from "hardhat";

async function main() {
  // const token = await ethers.getContractFactory("ImutableToken");
  // const tokenContract = await token.deploy();
  // await tokenContract.deployed();

  // console.log("Token deployed to:", tokenContract.address);


  // const ImmutableProfile = await ethers.getContractFactory("ImmutableProfile");
  // const profile = await ImmutableProfile.deploy();
  // await profile.deployed();
  // console.log("ImmutableProfile deployed to:", profile.address);

  const ImmutableDividend = await ethers.getContractFactory("ImmutableDividend");
  const dividend = await ImmutableDividend.deploy();
  await dividend.deployed();
  console.log("ImmutableDividend deployed to:", dividend.address);


}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
