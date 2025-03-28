// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library BancorFormula {
    function power(uint256 baseN, uint256 baseD, uint256 expN, uint256 expD) internal pure returns (uint256, uint8) {
        // Tính base^(expN/expD)
        uint256 result = baseN ** expN / baseD ** expD;
        return (result, 18);
    }

    function calculatePurchaseReturn(uint256 supply, uint256 reserveBalance, uint32 reserveRatio, uint256 depositAmount) internal pure returns (uint256) {
        uint256 result = (depositAmount * supply) / reserveBalance;
        return result * reserveRatio / 1000000;
    }

    function calculateSaleReturn(uint256 supply, uint256 reserveBalance, uint32 reserveRatio, uint256 sellAmount) internal pure returns (uint256) {
        uint256 result = (sellAmount * reserveBalance) / supply;
        return result * reserveRatio / 1000000;
    }
}
