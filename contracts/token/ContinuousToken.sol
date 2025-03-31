// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../curves/BancorBondingCurve.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ContinuousToken is ERC20, Ownable {
    BancorBondingCurve public bondingCurve;
    uint256 public reserveBalance; // Lượng dự trữ 
    uint32 public reserveRatio;    // Tỷ lệ dự trữ 
    address public treasury;

    constructor(
        string memory _name,
        string memory _symbol,
        address _bondingCurve,
        uint32 _reserveRatio
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        bondingCurve = BancorBondingCurve(_bondingCurve);
        reserveRatio = _reserveRatio;
        treasury = msg.sender;
        reserveBalance = 0; 
    }

    function calculateBuy(uint256 ethAmount) public view virtual returns (uint256) {
        require(ethAmount > 0, "Must send ETH");
        uint256 supply = totalSupply();
        
        if (supply == 0) {
            return ethAmount * 1000; // I use 1 ETH = 1000 token
        }
        return bondingCurve.calculatePurchaseReturn(
            supply,
            reserveBalance, 
            reserveRatio,
            ethAmount
        );
    }

    function calculateSell(uint256 tokenAmount) public view virtual returns (uint256) {
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(totalSupply() > 0, "No tokens in supply");
        require(reserveBalance > 0, "No reserve available");

        uint256 supply = totalSupply();
        return bondingCurve.calculateSaleReturn(
            supply,
            reserveBalance,
            reserveRatio,
            tokenAmount
        );
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= reserveBalance, "Not enough funds");
        reserveBalance -= amount;
        payable(owner()).transfer(amount);
    }

    receive() external payable {
        reserveBalance += msg.value;
    }
}