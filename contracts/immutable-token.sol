// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

// spelt immutable wrong I cannot redeploy this
contract ImutableToken is ERC20, ERC20Permit, ERC20Votes {
    uint constant TOKEN_BASE_UNITS = 10 ** 18;
    uint256 constant TOTAL_SUPPLY = 20000000;

    constructor() ERC20("ImutableToken", "IMT") ERC20Permit("ImutableToken") {
        // 20 million total supply
        _mint(msg.sender, TOTAL_SUPPLY * TOKEN_BASE_UNITS);
    }

    // The functions below are overrides required by Solidity.
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(
        address account,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }
}
