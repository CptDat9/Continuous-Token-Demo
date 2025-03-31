// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library BancorFormula {
    uint256 constant PRECISION = 10**18;
    uint256 constant MAX_EXPONENT = 10**20; // Giới hạn exponent để tránh overflow

    function calculatePurchaseReturn(
        uint256 supply,
        uint256 reserveBalance,
        uint32 reserveRatio,
        uint256 depositAmount
    ) internal pure returns (uint256) {
        if (supply == 0 || reserveBalance == 0 || depositAmount == 0 || reserveRatio == 0) {
            return 0;
        }
        uint256 base = PRECISION + (depositAmount * PRECISION) / reserveBalance;
        uint256 exponent = uint256(reserveRatio) * PRECISION / 1000000;
        uint256 powerResult = fixedExp(base, exponent);
        return (supply * (powerResult - PRECISION)) / PRECISION;
    }

    function calculateSaleReturn(
        uint256 supply,
        uint256 reserveBalance,
        uint32 reserveRatio,
        uint256 sellAmount
    ) internal pure returns (uint256) {
        if (supply == 0 || reserveBalance == 0 || sellAmount == 0 || reserveRatio == 0 || sellAmount > supply) {
            return 0;
        }

        uint256 temp = sellAmount * PRECISION;
        require(temp / sellAmount == PRECISION, "Overflow in multiplication");
        uint256 baseNumerator = PRECISION * supply - temp;
        uint256 base = baseNumerator / supply;

        uint256 exponentNumerator = 1000000 * PRECISION;
        require(exponentNumerator / 1000000 == PRECISION, "Overflow in exponent");
        uint256 exponent = exponentNumerator / uint256(reserveRatio);
        require(exponent <= MAX_EXPONENT, "Exponent too large"); 

        uint256 powerResult = fixedExp(base, exponent);
        return (reserveBalance * (PRECISION - powerResult)) / PRECISION;
    }

    function fixedExp(uint256 base, uint256 exponent) internal pure returns (uint256) {
        if (exponent > MAX_EXPONENT) return 0; 
        uint256 result = PRECISION;
        uint256 term = exponent;
        uint256 x = base;

        for (uint8 i = 1; i <= 10; i++) {
            uint256 product = x * term;
            if (product / x != term) return 0; // Nếu overflow, trả về 0
            result += product / PRECISION / i;
            term = (term * exponent) / PRECISION;
            if (term == 0) break; 
        }
        return result;
    }
}