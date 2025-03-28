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

    // function buyTokens() external view returns(uint256) {
    //     require(msg.value > 0, "Must send ETH");

    //     uint256 supply = totalSupply();
    //     uint256 tokensToMint = bondingCurve.calculatePurchaseReturn(supply, reserveBalance, reserveRatio, msg.value);
    //     // if (tokensToMint == 0) {
    //     // tokensToMint = 1;
    //     // }
    //     // reserveBalance += msg.value;
    //     // _mint(msg.sender, tokensToMint);
    //     return tokensToMint;

    // }
      function calculateBuy(uint256 ethAmount) public view returns (uint256) {
        require(ethAmount > 0, "Must send ETH");
        uint256 supply = totalSupply();
        return bondingCurve.calculatePurchaseReturn(supply, reserveBalance, reserveRatio, ethAmount);
    }
    // function sellTokens(uint256 tokenAmount) external view returns(uint256) {
    //     require(balanceOf(msg.sender) >= tokenAmount, "Not enough tokens");
    //     require(totalSupply() > 0, "No tokens in supply");
    //     require(reserveBalance > 0, "No ETH in reserve");
        
    //     uint256 supply = totalSupply();
    //     uint256 ethToReturn = bondingCurve.calculateSaleReturn(supply, reserveBalance, reserveRatio, tokenAmount);
    //     require(ethToReturn > 0, "ETH return too small"); 
    //     require(ethToReturn <= reserveBalance, "Not enough ETH in reserve");  
    //     return ethToReturn;
    //     // reserveBalance -= ethToReturn;
    //     // _burn(msg.sender, tokenAmount);
    //     // // // require(ERC20.allowance(msg.sender, address(this)) >= tokenAmount, "Allowance too low");
    //     // // require(ERC20.transferFrom(msg.sender, treasury, tokenAmount),"Transfer failed"); 
    //     // payable(msg.sender).transfer(ethToReturn);
    //     //  (bool success, ) = payable(msg.sender).call{value: ethToReturn}("");
    //     //  require(success,"ETH transfer failed.");
    // }
     function calculateSell(uint256 tokenAmount) public view returns (uint256) {
        require(tokenAmount > 0, "Token amount must be greater than 0");
        // require(balanceOf(msg.sender) >= tokenAmount, "Not enough tokens");
        require(totalSupply() > 0, "No tokens in supply");
        require(reserveBalance > 0, "No ETH in reserve");

        uint256 supply = totalSupply();
        return bondingCurve.calculateSaleReturn(supply, reserveBalance, reserveRatio, tokenAmount);
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
