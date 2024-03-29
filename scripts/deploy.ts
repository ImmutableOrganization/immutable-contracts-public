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
  // const ImmutableTreasury = await ethers.getContractFactory("ImmutableTreasury");

  // ImutableToken _token,
  // address _killSwitch,
  // address _liquidityPoolAddress,
  // uint256 _liquidityPoolDividendPercentage
  const ImmutableVotingToken = await ethers.getContractFactory("ImmutableVotingToken");

  const voting = await ImmutableVotingToken.deploy("0x17482Fae07cF2fF29233C4c4e29B5deF5130B7a1");
  await voting.deployed();
  console.log("ImmutableVotingToken deployed to:", voting.address);
  // await treasury.deployed();
  // console.log("ImmutableTreasury deployed to:", treasury.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
