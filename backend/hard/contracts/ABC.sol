// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CrowdFund {
    address public owner;
    uint256 public fundingGoal;
    uint256 public deadline;
    mapping(address => uint256) public contributions;
    uint256 public totalContributions;

    event ContributionReceived(address indexed contributor, uint256 amount);
    event GoalReached();
    event FundsWithdrawn(uint256 amount);
    event Refund(address indexed contributor, uint256 amount);

    error Unauthorized();

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }

    constructor(uint256 _fundingGoal, uint256 _deadline) {
        owner = msg.sender;
        fundingGoal = _fundingGoal;
        deadline = _deadline;
    }

    receive() external payable {}

    fallback() external payable {}

    function contribute() external payable {
        contributions[msg.sender] += msg.value;
        totalContributions += msg.value;
        emit ContributionReceived(msg.sender, msg.value);
        checkGoalReached();
    }

    function checkGoalReached() internal {
        if (totalContributions >= fundingGoal) {
            emit GoalReached();
        }
    }

    function withdrawFunds() external onlyOwner {
        require(block.timestamp <= deadline, "Deadline passed");
        require(totalContributions >= fundingGoal, "Goal not reached");
        (bool success, ) = address(this).call{value: totalContributions}("");
        require(success, "Transfer failed");
        emit FundsWithdrawn(totalContributions);
        totalContributions = 0;
    }

    function refund() external {
        require(block.timestamp > deadline, "Deadline not passed");
        require(totalContributions < fundingGoal, "Goal reached");
        uint256 amount = contributions[msg.sender];
        require(amount > 0, "No contribution to refund");
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        contributions[msg.sender] = 0;
        totalContributions -= amount;
        emit Refund(msg.sender, amount);
    }
}