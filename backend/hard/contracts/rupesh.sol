// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Goats {
    // State variables
    string public name = "Goats";
    string public symbol = "Rupesh";
    uint8 public decimals = 0;
    uint256 public totalSupply;

    // Mapping to keep track of token balances
    mapping(address => uint256) public balanceOf;

    // Event to log token transfers
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Constructor to initialize the contract
    constructor(address initialAddress) {
        // Set the total supply to 450
        totalSupply = 450 * 10 ** decimals;

        // Assign 450 tokens to the contract deployer
        balanceOf[msg.sender] = totalSupply;

        // Transfer 100 tokens to the specified address
        balanceOf[initialAddress] = 100 * 10 ** decimals;
        emit Transfer(msg.sender, initialAddress, 100 * 10 ** decimals);
    }

    // Function to transfer tokens
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "Invalid address");
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }
}