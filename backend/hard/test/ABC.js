const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFund", function () {
    let CrowdFund;
    let crowdFund;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        CrowdFund = await ethers.getContractFactory("CrowdFund");
        [owner, addr1, addr2] = await ethers.getSigners();
        crowdFund = await CrowdFund.deploy(1000, 1699046400); // 1000 ETH goal, deadline in the future
        await crowdFund.deployed();
    });

    it("Should deploy with the correct initial state", async function () {
        expect(await crowdFund.owner()).to.equal(owner.address);
        expect(await crowdFund.fundingGoal()).to.equal(1000);
        expect(await crowdFund.deadline()).to.equal(1699046400);
    });

    it("Should allow contributions", async function () {
        await crowdFund.connect(addr1).contribute({ value: 500 });
        expect(await crowdFund.contributions(addr1.address)).to.equal(500);
        expect(await crowdFund.totalContributions()).to.equal(500);
    });

    it("Should emit ContributionReceived event", async function () {
        await expect(crowdFund.connect(addr1).contribute({ value: 500 }))
            .to.emit(crowdFund, "ContributionReceived")
            .withArgs(addr1.address, 500);
    });

    it("Should emit GoalReached event when goal is reached", async function () {
        await crowdFund.connect(addr1).contribute({ value: 1000 });
        await expect(crowdFund.connect(addr2).contribute({ value: 1 }))
            .to.emit(crowdFund, "GoalReached");
    });

    it("Should allow owner to withdraw funds when goal is reached", async function () {
        await crowdFund.connect(addr1).contribute({ value: 1000 });
        await crowdFund.connect(addr2).contribute({ value: 1 });
        await crowdFund.withdrawFunds();
        expect(await crowdFund.totalContributions()).to.equal(0);
    });

    it("Should emit FundsWithdrawn event when funds are withdrawn", async function () {
        await crowdFund.connect(addr1).contribute({ value: 1000 });
        await crowdFund.connect(addr2).contribute({ value: 1 });
        await expect(crowdFund.withdrawFunds())
            .to.emit(crowdFund, "FundsWithdrawn")
            .withArgs(1001);
    });

    it("Should not allow non-owner to withdraw funds", async function () {
        await crowdFund.connect(addr1).contribute({ value: 1000 });
        await crowdFund.connect(addr2).contribute({ value: 1 });
        await expect(crowdFund.connect(addr1).withdrawFunds()).to.be.revertedWith("Unauthorized");
    });

    it("Should allow contributors to refund if goal is not reached", async function () {
        await crowdFund.connect(addr1).contribute({ value: 500 });
        await ethers.provider.send("evm_increaseTime", [86401]); // 1 day
        await ethers.provider.send("evm_mine");
        await crowdFund.refund();
        expect(await crowdFund.contributions(addr1.address)).to.equal(0);
        expect(await crowdFund.totalContributions()).to.equal(0);
    });

    it("Should emit Refund event when refund is processed", async function () {
        await crowdFund.connect(addr1).contribute({ value: 500 });
        await ethers.provider.send("evm_increaseTime", [86401]); // 1 day
        await ethers.provider.send("evm_mine");
        await expect(crowdFund.refund())
            .to.emit(crowdFund, "Refund")
            .withArgs(addr1.address, 500);
    });

    it("Should not allow refund if goal is reached", async function () {
        await crowdFund.connect(addr1).contribute({ value: 1000 });
        await crowdFund.connect(addr2).contribute({ value: 1 });
        await ethers.provider.send("evm_increaseTime", [86401]); // 1 day
        await ethers.provider.send("evm_mine");
        await expect(crowdFund.refund()).to.be.revertedWith("Goal reached");
    });

    it("Should not allow refund if deadline has not passed", async function () {
        await crowdFund.connect(addr1).contribute({ value: 500 });
        await expect(crowdFund.refund()).to.be.revertedWith("Deadline not passed");
    });

    it("Should not allow refund if no contribution was made", async function () {
        await ethers.provider.send("evm_increaseTime", [86401]); // 1 day
        await ethers.provider.send("evm_mine");
        await expect(crowdFund.refund()).to.be.revertedWith("No contribution to refund");
    });
});