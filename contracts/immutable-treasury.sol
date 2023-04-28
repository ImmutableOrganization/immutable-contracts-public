// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./immutable-token.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ImmutableTreasury is Ownable, ReentrancyGuard {
    // Consider performing a security audit

    bool public dividendsEnabled = false;

    function toggleDividends(bool toggle) public onlyOwner {
        // Toggle dividends
        dividendsEnabled = toggle;
    }

    address public killSwitch;

    ImutableToken public token;
    uint256 public totalDividends;

    uint256 public claimInterval = 1 weeks;

    mapping(address => uint256) public lastDividendsClaimed;
    mapping(address => uint256) public lastClaimTimestamp;
    mapping(address => uint256) public lastPeriodTokenBalance;

    event DividendsDeposited(address indexed depositor, uint256 amount);
    event DividendsClaimed(address indexed claimer, uint256 amount);

    modifier nonZeroAddress(address account) {
        require(account != address(0), "Address is zero");
        _;
    }

    constructor(ImutableToken _token, address _killSwitch) {
        token = _token;
        killSwitch = _killSwitch;
    }

    receive() external payable {
        totalDividends += msg.value;
        emit DividendsDeposited(msg.sender, msg.value);
    }

    function withdrawToKillSwitch() public {
        require(msg.sender == killSwitch);
        // Implement a time lock or multi-signature mechanism for added security
        selfdestruct(payable(msg.sender));
    }

    function disableKillSwitch() public {
        require(msg.sender == killSwitch);
        killSwitch = address(0);
    }

    function claimDividends() external nonReentrant {
        uint256 tokenBalance = token.balanceOf(msg.sender);
        require(tokenBalance > 0, "No tokens to claim dividends");

        // Calculate the dividends based on the token balance from the last period
        uint256 unclaimedDividends = getUnclaimedDividends(msg.sender);
        require(unclaimedDividends > 0, "No dividends to claim");

        require(
            block.timestamp >= lastClaimTimestamp[msg.sender] + claimInterval,
            "Claim interval not reached"
        );

        // Update the last period token balance and other data
        lastPeriodTokenBalance[msg.sender] = tokenBalance;
        lastDividendsClaimed[msg.sender] = totalDividends;
        lastClaimTimestamp[msg.sender] = block.timestamp;

        Address.sendValue(payable(msg.sender), unclaimedDividends);
        emit DividendsClaimed(msg.sender, unclaimedDividends);
    }

    function getUnclaimedDividends(
        address account
    ) public view nonZeroAddress(account) returns (uint256) {
        uint256 lastPeriodBalance = lastPeriodTokenBalance[account];
        uint256 lastClaimed = lastDividendsClaimed[account];
        uint256 newDividends = totalDividends - lastClaimed;

        // Calculate the dividends based on the last period token balance
        return (lastPeriodBalance * newDividends) / token.totalSupply();
    }

    function setClaimInterval(uint256 _claimInterval) external onlyOwner {
        claimInterval = _claimInterval;
    }

    function withdrawExcessEther() external onlyOwner {
        uint256 contractBalance = address(this).balance;
        uint256 excess = contractBalance - totalDividends;

        require(excess > 0, "No excess Ether to withdraw");

        Address.sendValue(payable(owner()), excess);
    }
}
