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

  it("Should set and get the storedData correctly", async function () {
    const initialData = await simpleStorage.get();
    expect(initialData).to.equal(42);

    const newData = 100;
    await simpleStorage.set(newData);
    const updatedData = await simpleStorage.get();
    expect(updatedData).to.equal(newData);
  });

  it("Should emit an event when storedData is set", async function () {
    await expect(simpleStorage.set(100))
      .to.emit(simpleStorage, "StoredDataSet")
      .withArgs(100);
  });

  it("Should handle edge cases for storedData", async function () {
    const maxUint256 = ethers.constants.MaxUint256;
    await simpleStorage.set(maxUint256);
    const data = await simpleStorage.get();
    expect(data).to.equal(maxUint256);

    await simpleStorage.set(0);
    const zeroData = await simpleStorage.get();
    expect(zeroData).to.equal(0);
  });

  it("Should revert if set function is called with invalid data", async function () {
    await expect(simpleStorage.set(ethers.constants.MaxUint256.add(1))).to.be.revertedWith("uint256 overflow");
  });
});