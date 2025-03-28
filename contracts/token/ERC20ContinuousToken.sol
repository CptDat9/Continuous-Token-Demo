// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ContinuousToken.sol";

contract ERC20Continuous is ContinuousToken {
    constructor(
        string memory _name,
        string memory _symbol,
        address _bondingCurve,
        uint32 _reserveRatio
    ) ContinuousToken(_name, _symbol, _bondingCurve, _reserveRatio) {
    }
}
