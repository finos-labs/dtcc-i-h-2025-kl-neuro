const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFunding", function () {
    let CrowdFunding;
    let crowdFunding;
    let owner;
    let beneficiary;
    let addr1;
    let addr2;

    beforeEach(async function () {
        CrowdFunding = await ethers.getContractFactory("CrowdFunding");
        [owner, beneficiary, addr1, addr2] = await ethers.getSigners();
        crowdFunding = await CrowdFunding.deploy(beneficiary.address, ethers.utils.parseEther("1"));
        await crowdFunding.deployed();
    });

    it("Should deploy with the correct initial state", async function () {
        expect(await crowdFunding.owner()).to.equal(owner.address);
        expect(await crowdFunding.beneficiary()).to.equal(beneficiary.address);
        expect(await crowdFunding.goal()).to.equal(ethers.utils.parseEther("1"));
        expect(await crowdFunding.raised()).to.equal(0);
        expect(await crowdFunding.isFunded()).to.equal(false);
    });

    it("Should allow contributions and emit Contribution event", async function () {
        await crowdFunding.connect(addr1).contribute({ value: ethers.utils.parseEther("0.5") });
        expect(await crowdFunding.raised()).to.equal(ethers.utils.parseEther("0.5"));
        await expect(crowdFunding.connect(addr1).contribute({ value: ethers.utils.parseEther("0.5") }))
            .to.emit(crowdFunding, "Contribution")
            .withArgs(addr1.address, ethers.utils.parseEther("0.5"));
    });

    it("Should fund the project if the goal is reached", async function () {
        await crowdFunding.connect(addr1).contribute({ value: ethers.utils.parseEther("1") });
        expect(await crowdFunding.isFunded()).to.equal(true);
        expect(await crowdFunding.raised()).to.equal(0);
        expect(await ethers.provider.getBalance(beneficiary.address)).to.equal(ethers.utils.parseEther("1"));
    });

    it("Should not allow contributions after the goal is reached", async function () {
        await crowdFunding.connect(addr1).contribute({ value: ethers.utils.parseEther("1") });
        await expect(crowdFunding.connect(addr2).contribute({ value: ethers.utils.parseEther("0.5") }))
            .to.be.revertedWith("Transfer failed");
    });

    it("Should allow the owner to withdraw funds if the goal is not reached", async function () {
        await crowdFunding.connect(addr1).contribute({ value: ethers.utils.parseEther("0.5") });
        await crowdFunding.connect(owner).withdraw();
        expect(await crowdFunding.raised()).to.equal(0);
        expect(await ethers.provider.getBalance(owner.address)).to.equal(ethers.utils.parseEther("0.5"));
    });

    it("Should not allow non-owner to withdraw funds", async function () {
        await crowdFunding.connect(addr1).contribute({ value: ethers.utils.parseEther("0.5") });
        await expect(crowdFunding.connect(addr1).withdraw())
            .to.be.revertedWith("Only the owner can withdraw");
    });

    it("Should not allow withdrawal after the goal is reached", async function () {
        await crowdFunding.connect(addr1).contribute({ value: ethers.utils.parseEther("1") });
        await expect(crowdFunding.connect(owner).withdraw())
            .to.be.revertedWith("Funding goal has been reached");
    });

    it("Should revert if contribution is zero", async function () {
        await expect(crowdFunding.connect(addr1).contribute({ value: 0 }))
            .to.be.revertedWith("Contribution must be greater than 0");
    });
});