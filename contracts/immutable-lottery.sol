pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Not final copy, just a test
contract Lottery is VRFConsumerBase, Ownable {
    using SafeMathChainlink for uint256;

    uint256 public constant TICKET_PRICE = 1e18; // 1 LINK
    uint256 public constant LOTTERY_NUMBERS = 4;

    address payable[] public players;
    uint256 public lotteryPool;
    uint256 public lastDraw;
    uint256 public lotteryPeriod = 7 days; // Default period: one week

    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 public randomResult;

    event LotteryWinner(address winner, uint256 amount);
    event LotteryRoundOver(uint256 pool);

    constructor(
        address _vrfCoordinator,
        address _linkToken,
        bytes32 _keyHash,
        uint256 _fee
    ) public VRFConsumerBase(_vrfCoordinator, _linkToken) Ownable() {
        keyHash = _keyHash;
        fee = _fee;
        lastDraw = block.timestamp;
    }

    function enter() public payable {
        require(msg.value == TICKET_PRICE, "Invalid ticket price");
        players.push(payable(msg.sender));
        lotteryPool = lotteryPool.add(msg.value);

        // Automatically draw the winner if the lottery period has passed
        if (block.timestamp >= lastDraw + lotteryPeriod) {
            drawWinner();
        }
    }

    function drawWinner() public {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK to pay fee"
        );
        require(
            block.timestamp >= lastDraw + lotteryPeriod,
            "Cannot draw before the lottery period"
        );
        requestRandomness(keyHash, fee);
        lastDraw = block.timestamp;
    }

    function fulfillRandomness(
        bytes32 requestId,
        uint256 randomness
    ) internal override {
        randomResult = randomness.mod(players.length);
        address payable winner = players[randomResult];
        uint256 winnerShare = lotteryPool.mul(9).div(10); // 90% of the pool
        uint256 nextRoundPool = lotteryPool.sub(winnerShare);

        winner.transfer(winnerShare);
        emit LotteryWinner(winner, winnerShare);

        // Reset lottery state
        players = new address payable[](0);
        lotteryPool = nextRoundPool;

        emit LotteryRoundOver(nextRoundPool);
    }

    function addFunds() public payable {
        lotteryPool = lotteryPool.add(msg.value);
    }

    function withdrawBalance() public onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "No balance to withdraw");
        payable(owner()).transfer(contractBalance);
    }

    function setLotteryPeriod(uint256 _newPeriod) public onlyOwner {
        require(_newPeriod > 0, "Lottery period must be greater than 0");
        lotteryPeriod = _newPeriod;
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    function getLotteryPool() public view returns (uint256) {
        return lotteryPool;
    }
}
