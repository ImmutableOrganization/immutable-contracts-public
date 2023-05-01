import { ethers } from "hardhat";
import { token } from "../typechain-types/@openzeppelin/contracts";

async function main() {
  // const token = await ethers.getContractFactory("ImutableToken");
  // const tokenContract = await token.deploy();
  // await tokenContract.deployed();

  // console.log("Token deployed to:", tokenContract.address);


  // const ImmutableProfile = await ethers.getContractFactory("ImmutableProfile");
  // const profile = await ImmutableProfile.deploy();
  // await profile.deployed();
  // console.log("ImmutableProfile deployed to:", profile.address);

  // const ImmutableDividend = await ethers.getContractFactory("ImmutableDividend");
  // const dividend = await ImmutableDividend.deploy();
  // await dividend.deployed();
  // console.log("ImmutableDividend deployed to:", dividend.address);

  // const ImmutableGovernor = await ethers.getContractFactory("ImmutableGovernor");
  // const governor = await ImmutableGovernor.deploy("0x17482Fae07cF2fF29233C4c4e29B5deF5130B7a1");
  // await governor.deployed();
  // console.log("ImmutableGovernor deployed to:", governor.address);
  const ImmutableTreasury = await ethers.getContractFactory("ImmutableTreasury");

  // ImutableToken _token,
  // address _killSwitch,
  // address _liquidityPoolAddress,
  // uint256 _liquidityPoolDividendPercentage
  const treasury = await ImmutableTreasury.deploy("0x17482Fae07cF2fF29233C4c4e29B5deF5130B7a1", "0x531c4338794fDaC40532687dC6279d76ED8E090A", "0x36a524072f8f2ec359428df28e7ec169d3a82807", 10);
  await treasury.deployed();
  console.log("ImmutableTreasury deployed to:", treasury.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
