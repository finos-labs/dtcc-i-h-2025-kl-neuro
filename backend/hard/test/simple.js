const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleStorage", function () {
  let SimpleStorage;
  let simpleStorage;
  let owner;

  beforeEach(async function () {
    SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    [owner] = await ethers.getSigners();
    simpleStorage = await SimpleStorage.deploy(42);
    await simpleStorage.deployed();
  });

  describe("Deployment", function () {
    it("Should set the initial storedData correctly", async function () {
      expect(await simpleStorage.get()).to.equal(42);
    });
  });

  describe("set", function () {
    it("Should set the storedData correctly", async function () {
      await simpleStorage.set(100);
      expect(await simpleStorage.get()).to.equal(100);
    });

    it("Should emit the StoredDataSet event", async function () {
      await expect(simpleStorage.set(200))
        .to.emit(simpleStorage, "StoredDataSet")
        .withArgs(200);
    });
  });

  describe("get", function () {
    it("Should return the correct storedData", async function () {
      await simpleStorage.set(300);
      expect(await simpleStorage.get()).to.equal(300);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle the maximum uint256 value", async function () {
      const maxUint256 = ethers.BigNumber.from(2).pow(256).sub(1);
      await simpleStorage.set(maxUint256);
      expect(await simpleStorage.get()).to.equal(maxUint256);
    });

    it("Should handle the minimum uint256 value", async function () {
      await simpleStorage.set(0);
      expect(await simpleStorage.get()).to.equal(0);
    });
  });
});