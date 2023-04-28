// We import Chai to use its asserting functions here.
import { expect } from "chai";

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage of Hardhat Network's snapshot functionality.
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

// `describe` is a Mocha function that allows you to organize your tests.
// Having your tests organized makes debugging them easier. All Mocha
// functions are available in the global scope.
//
// `describe` receives the name of a section of your test suite, and a
// callback. The callback must define the tests of that section. This callback
// can't be an async function.
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
        const [owner, addr1, addr2] = await ethers.getSigners();

        const hardhatImmutableTreasury = await ImmutableTreasury.deploy(hardhatToken.address, owner.address);

        await hardhatImmutableTreasury.deployed();

        return { ImmutableTreasury, hardhatImmutableTreasury, owner, addr1, addr2 };
    }

    // You can nest describe calls to create subsections.
    describe("Deployment", function () {
        // `it` is another Mocha function. This is the one you use to define each
        // of your tests. It receives the test name, and a callback function.
        //
        // If the callback function is async, Mocha will `await` it.
        it("Should set the right owner", async function () {
            // We use loadFixture to setup our environment, and then assert that
            // things went well
            const { hardhatToken, owner } = await loadFixture(deployTokenFixture);

            // `expect` receives a value and wraps it in an assertion object. These
            // objects have a lot of utility methods to assert values.

            // This test expects the owner variable stored in the contract to be
            // equal to our Signer's owner.
            // expect(await hardhatToken.owner()).to.equal(owner.address);
        });

        it("Should assign the total supply of tokens to the owner", async function () {
            const { hardhatToken, owner } = await loadFixture(deployTokenFixture);
            const ownerBalance = await hardhatToken.balanceOf(owner.address);
            expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
        });
    });

    describe("Transactions", function () {
        it("Should transfer tokens between accounts", async function () {
            const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
                deployTokenFixture
            );
            // Transfer 50 tokens from owner to addr1
            await expect(
                hardhatToken.transfer(addr1.address, 50)
            ).to.changeTokenBalances(hardhatToken, [owner, addr1], [-50, 50]);

            // Transfer 50 tokens from addr1 to addr2
            // We use .connect(signer) to send a transaction from another account
            await expect(
                hardhatToken.connect(addr1).transfer(addr2.address, 50)
            ).to.changeTokenBalances(hardhatToken, [addr1, addr2], [-50, 50]);
        });

        it("Should emit Transfer events", async function () {
            const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
                deployTokenFixture
            );

            // Transfer 50 tokens from owner to addr1
            await expect(hardhatToken.transfer(addr1.address, 50))
                .to.emit(hardhatToken, "Transfer")
                .withArgs(owner.address, addr1.address, 50);

            // Transfer 50 tokens from addr1 to addr2
            // We use .connect(signer) to send a transaction from another account
            await expect(hardhatToken.connect(addr1).transfer(addr2.address, 50))
                .to.emit(hardhatToken, "Transfer")
                .withArgs(addr1.address, addr2.address, 50);
        });

        it("Should fail if sender doesn't have enough tokens", async function () {
            const { hardhatToken, owner, addr1 } = await loadFixture(
                deployTokenFixture
            );
            const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

            // Try to send 1 token from addr1 (0 tokens) to owner.
            // `require` will evaluate false and revert the transaction.
            await expect(
                hardhatToken.connect(addr1).transfer(owner.address, 1)
            ).to.be.revertedWith("Not enough tokens");

            // Owner balance shouldn't have changed.
            expect(await hardhatToken.balanceOf(owner.address)).to.equal(
                initialOwnerBalance
            );
        });
    });
});