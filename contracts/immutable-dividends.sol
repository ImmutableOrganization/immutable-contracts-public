// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./ImutableToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract ImmutableTreasury is Ownable, ReentrancyGuard {
    // how does this work
    // immutable governer owns this contract
    // Treasury owns NFT contract plus gaming conract

    // only the owner of this contract can call its function (DAO)? or just some

    bool public dividendsEnabled = false;

    // plan
    // ownership of the NFT contract will be passed to the DAO,
    // then balance will be sent to this contract
    // token holders will then be able to either claim their share of the dividends or have it sent to LP
    // maybe the claim dividends function and send to lp function have a lock and this can be controlled by the DAO, so people cant just claim whenever

    // needs to be ownable contract

    // also lp cant claim dividends, this
    // means we must have a lp claim dividends function?
    // or maybe after dividend period we auto send to LP?
    // idk the game theory

    // callable by only the DAO

    // need to test all of these and think of attacks

    function toggleDividends(bool toggle) public {
        // toggle dividends
        dividendsEnabled = toggle;
    }

    // need a kill switch address that my wallet can call to what?
    address public killSwitch;

    // This is in place incase of a hostile takeover before we are complete
    // worry about it too much
    function withdrawToKillSwitch() public {
        require(msg.sender == killSwitch);
        selfdestruct(payable(msg.sender));
    }

    function removeKillSwitch() public {
        require(msg.sender == killSwitch);
        killSwitch = address(0);
    }

    ImutableToken public token;
    uint256 public totalDividends;

    uint256 public claimInterval = 1 weeks;

    mapping(address => uint256) public lastDividendsClaimed;
    mapping(address => uint256) public lastClaimTimestamp;

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

    function claimDividends() external nonReentrant {
        uint256 tokenBalance = token.balanceOf(msg.sender);
        require(tokenBalance > 0, "No tokens to claim dividends");

        uint256 unclaimedDividends = getUnclaimedDividends(msg.sender);
        require(unclaimedDividends > 0, "No dividends to claim");

        require(
            block.timestamp >= lastClaimTimestamp[msg.sender] + claimInterval,
            "Claim interval not reached"
        );

        lastDividendsClaimed[msg.sender] = totalDividends;
        lastClaimTimestamp[msg.sender] = block.timestamp;

        Address.sendValue(payable(msg.sender), unclaimedDividends);
        emit DividendsClaimed(msg.sender, unclaimedDividends);
    }

    function getUnclaimedDividends(
        address account
    ) public view nonZeroAddress(account) returns (uint256) {
        uint256 tokenBalance = token.balanceOf(account);
        uint256 lastClaimed = lastDividendsClaimed[account];
        uint256 newDividends = totalDividends - lastClaimed;
        return (tokenBalance * newDividends) / token.totalSupply();
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
