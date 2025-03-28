// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IBondingCurve.sol";
import "../math/BancorFormula.sol";

contract BancorBondingCurve is IBondingCurve {
    using BancorFormula for uint256;

    function calculatePurchaseReturn(uint256 supply, uint256 reserveBalance, uint32 reserveRatio, uint256 depositAmount) public pure override returns (uint256) {
        return BancorFormula.calculatePurchaseReturn(supply, reserveBalance, reserveRatio, depositAmount);
    }

    function calculateSaleReturn(uint256 supply, uint256 reserveBalance, uint32 reserveRatio, uint256 sellAmount) public pure override returns (uint256) {
        return BancorFormula.calculateSaleReturn(supply, reserveBalance, reserveRatio, sellAmount);
    }
}
