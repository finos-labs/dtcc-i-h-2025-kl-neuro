const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Goats", function () {
    let Goats;
    let goats;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        Goats = await ethers.getContractFactory("Goats");
        [owner, addr1, addr2] = await ethers.getSigners();
        goats = await Goats.deploy(addr1.address);
        await goats.deployed();
    });

    it("Should set the right owner", async function () {
        expect(await goats.name()).to.equal("Goats");
        expect(await goats.symbol()).to.equal("Rupesh");
        expect(await goats.decimals()).to.equal(0);
        expect(await goats.totalSupply()).to.equal(450);
        expect(await goats.balanceOf(owner.address)).to.equal(450);
        expect(await goats.balanceOf(addr1.address)).to.equal(100);
    });

    it("Should transfer tokens between accounts", async function () {
        await goats.transfer(addr2.address, 50);
        expect(await goats.balanceOf(owner.address)).to.equal(400);
        expect(await goats.balanceOf(addr2.address)).to.equal(150);
    });

    it("Should emit Transfer event", async function () {
        await expect(goats.transfer(addr2.address, 50))
            .to.emit(goats, "Transfer")
            .withArgs(owner.address, addr2.address, 50);
    });

    it("Should fail if transfer to the zero address", async function () {
        await expect(goats.transfer(ethers.constants.AddressZero, 50)).to.be.revertedWith("Invalid address");
    });

    it("Should fail if transfer amount exceeds balance", async function () {
        await expect(goats.transfer(addr2.address, 500)).to.be.revertedWith("Insufficient balance");
    });

    it("Should handle edge case of transferring 0 tokens", async function () {
        await expect(goats.transfer(addr2.address, 0)).to.be.revertedWith("Insufficient balance");
    });
});