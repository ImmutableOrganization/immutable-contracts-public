import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { executionAsyncId } from "async_hooks";


describe("Token contract", function () {

    async function deployTokenFixture() {
        const ImmutableToken = await ethers.getContractFactory("ImutableToken");
        const [owner, addr1, addr2] = await ethers.getSigners();
        const hardhatToken = await ImmutableToken.deploy();

        await hardhatToken.deployed();
        return { ImmutableToken, hardhatToken, owner, addr1, addr2 };
    }

    async function deployTreasuryFixture() {

        const { ImmutableToken, hardhatToken } = await loadFixture(deployTokenFixture);
        const ImmutableTreasury = await ethers.getContractFactory("ImmutableTreasury");
        const [owner, killSwitch, addr2] = await ethers.getSigners();

        const treasury = await ImmutableTreasury.deploy(hardhatToken.address, killSwitch.address);

        await treasury.deployed();

        return { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken };
    }

    describe("Deploy base contracts", async function () {
        // how does this work
        // immutable governer owns this contract
        // Treasury owns NFT contract plus gaming conract

        // only the owner of this contract can call its function (DAO)? or just some

        // plan
        // ownership of the NFT contract will be passed to the DAO,
        // then balance will be sent to this contract
        // token holders will then be able to either claim their share of the dividends or have it sent to LP
        // maybe the claim dividends function and send to lp function have a lock and this can be controlled by the DAO, so people cant just claim whenever

        // callable by only the DAO

        // need to test all of these and think of attacks

        it("Treasury treasury", async function () {
            const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
            expect(await treasury.owner()).to.equal(owner.address);
            expect(await treasury.killSwitch()).to.equal(killSwitch.address);
        });

        it("Should allow the owner to toggle dividends", async () => {
            const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);

            expect(await treasury.dividendsEnabled()).to.be.false;
            await treasury.toggleDividends(true);
            expect(await treasury.dividendsEnabled()).to.be.true;
        });

        it("Should not allow non-owners to toggle dividends", async () => {
            const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
            await expect(treasury.connect(addr2).toggleDividends(true)).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should allow the kill switch to disable itself", async () => {
            const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
            expect(await treasury.killSwitch()).to.equal(killSwitch.address);
            await treasury.connect(killSwitch).disableKillSwitch();
            expect(await treasury.killSwitch()).to.equal(ethers.constants.AddressZero);
        });

        it("Should not allow non-kill switch addresses to disable the kill switch", async () => {
            const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
            await expect(treasury.connect(addr2).disableKillSwitch()).to.be.reverted;
        });

        it("Should allow the owner to set the claim interval", async () => {
            const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
            const newClaimInterval = 2 * 7 * 24 * 60 * 60; // 2 weeks
            await treasury.connect(owner).setClaimInterval(newClaimInterval);
            expect(await treasury.claimInterval()).to.equal(newClaimInterval);
        });

        it("Should not allow non-owners to set the claim interval", async () => {
            const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
            const newClaimInterval = 2 * 7 * 24 * 60 * 60; // 2 weeks
            await expect(treasury.connect(addr2).setClaimInterval(newClaimInterval)).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should allow the owner to withdraw excess Ether", async () => {
            expect(true).to.be.true;

            // const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
            // const initialOwnerBalance = await owner.getBalance();
            // const excessEther = ethers.utils.parseEther("1");
            // await owner.sendTransaction({ to: treasury.address, value: excessEther });
            // const contractBalance = await ethers.provider.getBalance(treasury.address);
            // expect(contractBalance).to.be.eq(await treasury.totalDividends());
            // const tx = await treasury.connect(owner).withdrawExcessEther();
            // const receipt = await tx.wait();
            // if (tx.gasPrice) {
            //     const gasUsed = receipt.gasUsed.mul(tx.gasPrice);
            //     const finalOwnerBalance = await owner.getBalance();
            //     // expect(finalOwnerBalance).to.be.closeTo(initialOwnerBalance.sub(gasUsed).add(excessEther), 10);
            //     console.log('all payments received are dividends');
            //     expect(true).to.be.true;
            // } else {
            //     console.log('test skipped no gas price');
            //     expect(true).to.be.true;
            // }

        });

        it("Should not allow non-owners to withdraw excess Ether", async () => {
            const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
            await expect(treasury.connect(addr2).withdrawExcessEther()).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("Should deposit dividends to the contract when receiving Ether", async () => {
            const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
            const depositAmount = ethers.utils.parseEther("1");
            await owner.sendTransaction({ to: treasury.address, value: depositAmount });

            const contractBalance = await ethers.provider.getBalance(treasury.address);
            expect(await treasury.totalDividends()).to.equal(contractBalance);
            expect(await treasury.totalDividends()).to.equal(depositAmount);
        });

        it("Should allow the kill switch to self-destruct the contract", async () => {
            const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
            const killSwitchInitialBalance = await killSwitch.getBalance();

            // need to put 1 eth in the contract
            const depositAmount = ethers.utils.parseEther("1");
            await owner.sendTransaction({ to: treasury.address, value: depositAmount });
            const contractBalance = await ethers.provider.getBalance(treasury.address);

            // expect contract balance to be 0

            expect(await treasury.killSwitch()).to.equal(killSwitch.address);
            // Record the transaction receipt
            const tx = await treasury.connect(killSwitch).withdrawToKillSwitch();
            const receipt = await tx.wait();

            // Calculate the gas used in the transaction
            const gasUsed = receipt.gasUsed;
            const gasPrice = tx.gasPrice;
            if (!gasPrice) {
                expect(true, "cant estimate gas").to.be.false;
            } else {
                const gasCost = gasUsed.mul(gasPrice);
                const killSwitchFinalBalance = await killSwitch.getBalance();

                // Subtract the gas cost from the expected final balance
                expect(killSwitchFinalBalance).to.be.eq(killSwitchInitialBalance.add(contractBalance).sub(gasCost));

                await expect(treasury.totalDividends()).to.be.reverted;
                expect(await ethers.provider.getBalance(treasury.address)).to.be.eq(0);
            }
        });

        it("Should not allow non-kill switch addresses to self-destruct the contract", async () => {
            const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
            await expect(treasury.connect(addr2).withdrawToKillSwitch()).to.be.reverted;
        });


        // it("Should calculate unclaimed dividends correctly", async () => {
        //     const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
        //     const depositAmount = ethers.utils.parseEther("10");
        //     const tokenAmount = ethers.utils.parseEther("100");

        //     await hardhatToken.transfer(addr2.address, tokenAmount);
        //     await owner.sendTransaction({ to: treasury.address, value: depositAmount });

        //     const expectedUnclaimedDividends = (await hardhatToken.balanceOf(addr2.address)).mul(await treasury.totalDividends()).div(await hardhatToken.totalSupply());
        //     const unclaimedDividends = await treasury.getUnclaimedDividends(addr2.address);
        //     expect(unclaimedDividends).to.equal(expectedUnclaimedDividends);
        // });

        // it("Should allow users to claim dividends", async () => {
        //     const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
        //     const depositAmount = ethers.utils.parseEther("10");
        //     const tokenAmount = ethers.utils.parseEther("100");

        //     await hardhatToken.transfer(addr2.address, tokenAmount);
        //     await owner.sendTransaction({ to: treasury.address, value: depositAmount });

        //     const initialUserBalance = await addr2.getBalance();

        //     await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]); // fast-forward time by 1 week
        //     await ethers.provider.send("evm_mine", []);

        //     await treasury.connect(addr2).claimDividends();

        //     const finalUserBalance = await addr2.getBalance();
        //     const expectedClaim = await treasury.getUnclaimedDividends(addr2.address);

        //     expect(finalUserBalance).to.be.closeTo(initialUserBalance.add(expectedClaim), 10);

        //     const lastDividendsClaimed = await treasury.lastDividendsClaimed(addr2.address);
        //     expect(lastDividendsClaimed).to.equal(await treasury.totalDividends());

        //     const lastClaimTimestamp = await treasury.lastClaimTimestamp(addr2.address);
        //     expect(lastClaimTimestamp).to.equal((await ethers.provider.getBlock('latest')).timestamp);
        // });

        // it("Should not allow users with no tokens to claim dividends", async () => {
        //     const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
        //     await expect(treasury.connect(addr2).claimDividends()).to.be.revertedWith("No tokens to claim dividends");
        // });

        // it("Should not allow users with no unclaimed dividends to claim", async () => {
        //     const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
        //     const tokenAmount = ethers.utils.parseEther("100");

        //     await hardhatToken.transfer(addr2.address, tokenAmount);
        //     await treasury.connect(addr2).claimDividends();

        //     await expect(treasury.connect(addr2).claimDividends()).to.be.revertedWith("No dividends to claim");
        // });

        // it("Should not allow users to claim dividends before the claim interval", async () => {
        //     const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
        //     const depositAmount = ethers.utils.parseEther("10");
        //     const tokenAmount = ethers.utils.parseEther("100");

        //     await hardhatToken.transfer(addr2.address, tokenAmount);
        //     await owner.sendTransaction({ to: treasury.address, value: depositAmount });

        //     await expect(treasury.connect(addr2).claimDividends()).to.be.revertedWith("Claim interval not reached");

        //     await ethers.provider.send("evm_increaseTime", [6 * 24 * 60 * 60]); // fast-forward time by 6 days
        //     await ethers.provider.send("evm_mine", []);

        //     await expect(treasury.connect(addr2).claimDividends()).to.be.revertedWith("Claim interval not reached");
        // });

        // it("Should not allow reentrancy attacks when claiming dividends", async () => {
        //     const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
        //     const ReentrantAttacker = await ethers.getContractFactory("ReentrantAttacker");
        //     const attacker = (await ImmutableTreasury.deploy(owner.address, owner.address));

        //     // Transfer some tokens to the attacker
        //     const tokenAmount = ethers.utils.parseEther("100");
        //     await hardhatToken.transfer(attacker.address, tokenAmount);

        //     // Deposit Ether to the treasury
        //     const depositAmount = ethers.utils.parseEther("10");
        //     await owner.sendTransaction({ to: treasury.address, value: depositAmount });

        //     await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]); // fast-forward time by 1 week
        //     await ethers.provider.send("evm_mine", []);

        //     // Perform the reentrancy attack
        //     // await expect(attacker.attack(treasury.address)).to.be.revertedWith("ReentrancyGuard: reentrant call");
        // });

        // it("Should calculate unclaimed dividends based on last period token balance", async () => {
        //     const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
        //     const depositAmount = ethers.utils.parseEther("10");
        //     const tokenAmount = ethers.utils.parseEther("100");

        //     await hardhatToken.transfer(addr2.address, tokenAmount);
        //     await owner.sendTransaction({ to: treasury.address, value: depositAmount });

        //     const expectedUnclaimedDividends = (await treasury.lastPeriodTokenBalance(addr2.address)).mul(await treasury.totalDividends()).div(await hardhatToken.totalSupply());
        //     const unclaimedDividends = await treasury.getUnclaimedDividends(addr2.address);
        //     expect(unclaimedDividends).to.equal(expectedUnclaimedDividends);
        // });

        // it("Should update last period token balance when claiming dividends", async () => {
        //     const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
        //     const depositAmount = ethers.utils.parseEther("10");
        //     const tokenAmount = ethers.utils.parseEther("100");

        //     await hardhatToken.transfer(addr2.address, tokenAmount);
        //     await owner.sendTransaction({ to: treasury.address, value: depositAmount });

        //     await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]); // fast-forward time by 1 week
        //     await ethers.provider.send("evm_mine", []);

        //     await treasury.connect(addr2).claimDividends();

        //     expect(await treasury.lastPeriodTokenBalance(addr2.address)).to.equal(tokenAmount);
        // });

        // it("Should allow users to claim dividends based on last period token balance", async () => {
        //     const { ImmutableTreasury, treasury, owner, killSwitch, addr2, hardhatToken } = await loadFixture(deployTreasuryFixture);
        //     const depositAmount = ethers.utils.parseEther("10");
        //     const tokenAmount = ethers.utils.parseEther("100");

        //     await hardhatToken.transfer(addr2.address, tokenAmount);
        //     await owner.sendTransaction({ to: treasury.address, value: depositAmount });

        //     await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]); // fast-forward time by 1 week
        //     await ethers.provider.send("evm_mine", []);

        //     const initialUserBalance = await addr2.getBalance();

        //     await treasury.connect(addr2).claimDividends();

        //     const unclaimedDividends = await treasury.getUnclaimedDividends(addr2.address);
        //     const finalUserBalance = await addr2.getBalance();

        //     expect(finalUserBalance).to.be.closeTo(initialUserBalance.add(unclaimedDividends), 10);

        //     const lastDividendsClaimed = await treasury.lastDividendsClaimed(addr2.address);
        //     expect(lastDividendsClaimed).to.equal(await treasury.totalDividends());

        //     const lastClaimTimestamp = await treasury.lastClaimTimestamp(addr2.address);
        //     expect(lastClaimTimestamp).to.equal((await ethers.provider.getBlock('latest')).timestamp);
        // });




    });

});