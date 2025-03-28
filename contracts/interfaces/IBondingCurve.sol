// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBondingCurve {
    function calculatePurchaseReturn(uint256 supply, uint256 reserveBalance, uint32 reserveRatio, uint256 depositAmount) external pure returns (uint256);
    function calculateSaleReturn(uint256 supply, uint256 reserveBalance, uint32 reserveRatio, uint256 sellAmount) external pure returns (uint256);
}
