// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CrowdFunding {
    // State variables
    address public owner;
    address public beneficiary;
    uint256 public goal;
    uint256 public raised;
    bool public isFunded;

    // Event to log contributions
    event Contribution(address indexed contributor, uint256 amount);

    // Constructor to initialize the contract
    constructor(address _beneficiary, uint256 _goal) {
        owner = msg.sender;
        beneficiary = _beneficiary;
        goal = _goal;
    }

    // Function to contribute to the campaign
    function contribute() external payable {
        require(msg.value > 0, "Contribution must be greater than 0");
        raised += msg.value;
        emit Contribution(msg.sender, msg.value);

        // Check if the goal has been reached
        if (raised >= goal) {
            isFunded = true;
            // Transfer the raised amount to the beneficiary
            (bool success, ) = beneficiary.call{value: raised}("");
            require(success, "Transfer failed");
        }
    }

    // Function to withdraw funds if the goal is not reached
    function withdraw() external {
        require(msg.sender == owner, "Only the owner can withdraw");
        require(!isFunded, "Funding goal has been reached");
        (bool success, ) = owner.call{value: raised}("");
        require(success, "Withdrawal failed");
        raised = 0;
    }
}