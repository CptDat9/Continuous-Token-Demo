// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ContinuousToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20ContinuousToken is ContinuousToken {
    ERC20 public reserveToken;

    constructor(
        string memory _name, 
        string memory _symbol, 
        address _bondingCurve,
        uint32 _reserveRatio,
        ERC20 _reserveToken
    ) ContinuousToken(_name, _symbol, _bondingCurve, _reserveRatio) {
        reserveToken = _reserveToken;
    }

    function mint(uint256 ethAmount) public {
        uint256 tokensToMint = calculateBuy(ethAmount);
        // require(tokensToMint > 0, "Mint amount too low");

        require(reserveToken.transferFrom(msg.sender, address(this), ethAmount), "Transfer failed");
        _mint(msg.sender, tokensToMint);
    }

    function burn(uint256 tokenAmount) public {
        uint256 refundAmount = calculateSell(tokenAmount);
        require(refundAmount > 0, "Burn amount too low");

        _burn(msg.sender, tokenAmount);
        require(reserveToken.transfer(msg.sender, refundAmount), "Transfer failed");
    }

    function checkReserveBalance() public view returns (uint256) {
        return reserveToken.balanceOf(address(this));
    }
}
