// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    // State variable to store a single uint value
    uint256 public storedData;

    // Constructor to initialize the storedData
    constructor(uint256 _initialData) {
        storedData = _initialData;
    }

    // Function to set a new value for storedData
    function set(uint256 _data) public {
        storedData = _data;
    }

    // Function to get the current value of storedData
    function get() public view returns (uint256) {
        return storedData;
    }
}