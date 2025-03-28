// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../curves/BancorBondingCurve.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ContinuousToken is ERC20, Ownable {
    BancorBondingCurve public bondingCurve;
    uint256 public reserveBalance;
    uint32 public reserveRatio;
    address public treasury;

    constructor(
        string memory _name,
        string memory _symbol,
        address _bondingCurve,
        uint32 _reserveRatio
        ) ERC20(_name, _symbol)  Ownable(msg.sender)  {
        bondingCurve = BancorBondingCurve(_bondingCurve);
        reserveRatio = _reserveRatio;
        treasury = msg.sender;
        reserveBalance = 100 ether;

    }

    function buyTokens() external payable {
        require(msg.value > 0, "Must send ETH");

        uint256 supply = totalSupply();
        uint256 tokensToMint = bondingCurve.calculatePurchaseReturn(supply, reserveBalance, reserveRatio, msg.value);
        if (tokensToMint == 0) {
        tokensToMint = 1;
        }
        reserveBalance += msg.value;
        _mint(msg.sender, tokensToMint);
    }

    function sellTokens(uint256 tokenAmount) external {
        require(balanceOf(msg.sender) >= tokenAmount, "Not enough tokens");
        require(totalSupply() > 0, "No tokens in supply");
        require(reserveBalance > 0, "No ETH in reserve");
        
        uint256 supply = totalSupply();
        uint256 ethToReturn = bondingCurve.calculateSaleReturn(supply, reserveBalance, reserveRatio, tokenAmount);
        require(ethToReturn > 0, "ETH return too small"); 
        require(ethToReturn <= reserveBalance, "Not enough ETH in reserve");  
        reserveBalance -= ethToReturn;
        _burn(msg.sender, tokenAmount);
        payable(msg.sender).transfer(ethToReturn);
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= reserveBalance, "Not enough funds");
        reserveBalance -= amount;
        payable(owner()).transfer(amount);
    }
}
