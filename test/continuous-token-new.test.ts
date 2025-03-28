import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { ContinuousToken, ERC20ContinuousToken, BancorBondingCurve, MockERC20 } from "../typechain-types";

describe("ERC20ContinuousToken", function () {
    let continuousToken: ContinuousToken;
    let erc20ContinuousToken: ERC20ContinuousToken;
    let bondingCurve: BancorBondingCurve;
    let reserveToken: MockERC20;
    let owner: Signer, addr1: Signer, addr2: Signer;
    const reserveRatio = 500000; // 50%

    before(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const BondingCurveFactory = await ethers.getContractFactory("BancorBondingCurve");
        bondingCurve = await BondingCurveFactory.deploy();
        await bondingCurve.waitForDeployment();
        console.log("BondingCurve Address:", await bondingCurve.getAddress());

        const MockERC20Factory = await ethers.getContractFactory("MockERC20");
        reserveToken = await MockERC20Factory.deploy("Ethereum", "ETH");
        await reserveToken.waitForDeployment();
        console.log("ReserveToken Address:", await reserveToken.getAddress());

        await reserveToken.mint(await addr1.getAddress(), ethers.parseEther("1000"));
        console.log("[Init] Addr1 Reserve Token Balance:", ethers.formatEther(await reserveToken.balanceOf(await addr1.getAddress())));

        const ContinuousTokenFactory = await ethers.getContractFactory("ContinuousToken");
        continuousToken = await ContinuousTokenFactory.deploy(
            "Thorn Continuous", "THORN", await bondingCurve.getAddress(), reserveRatio
        );
        await continuousToken.waitForDeployment();
        console.log("ContinuousToken Address:", await continuousToken.getAddress());

        const ERC20ContinuousTokenFactory = await ethers.getContractFactory("ERC20ContinuousToken");
        erc20ContinuousToken = await ERC20ContinuousTokenFactory.deploy(
            "Thorn ERC20 Continuous", "THRN", await bondingCurve.getAddress(), reserveRatio, reserveToken.target
        );
        await erc20ContinuousToken.waitForDeployment();
        console.log("ERC20ContinuousToken Address:", await erc20ContinuousToken.getAddress());

        // Mint ban đầu cho addr1
        await continuousToken.connect(owner).mint(await addr1.getAddress(), ethers.parseEther("10"));
        console.log("[Init] Addr1 ContinuousToken Balance:", ethers.formatEther(await continuousToken.balanceOf(await addr1.getAddress())));
        console.log("[Init] ContinuousToken Total Supply:", ethers.formatEther(await continuousToken.totalSupply()));
        console.log("[Init] ContinuousToken Reserve Balance:", ethers.formatEther(await continuousToken.reserveBalance()));

        // Gửi ETH thực tế vào ContinuousToken để withdraw hoạt động
        await owner.sendTransaction({
            to: await continuousToken.getAddress(),
            value: ethers.parseEther("100")
        });
        console.log("[Init] ContinuousToken ETH Balance:", ethers.formatEther(await ethers.provider.getBalance(await continuousToken.getAddress())));
    });

    it("Should deploy contracts correctly", async function () {
        expect(await continuousToken.name()).to.equal("Thorn Continuous");
        expect(await continuousToken.symbol()).to.equal("THORN");
        expect(await continuousToken.reserveRatio()).to.equal(reserveRatio);
        console.log("ContinuousToken Name:", await continuousToken.name());
        console.log("ContinuousToken Symbol:", await continuousToken.symbol());
        console.log("ContinuousToken Reserve Ratio:", (await continuousToken.reserveRatio()).toString());
        console.log("ContinuousToken Reserve Balance:", ethers.formatEther(await continuousToken.reserveBalance()));
        console.log("ContinuousToken Total Supply:", ethers.formatEther(await continuousToken.totalSupply()));
        console.log("ContinuousToken ETH Balance:", ethers.formatEther(await ethers.provider.getBalance(await continuousToken.getAddress())));

        expect(await erc20ContinuousToken.name()).to.equal("Thorn ERC20 Continuous");
        expect(await erc20ContinuousToken.symbol()).to.equal("THRN");
        expect(await erc20ContinuousToken.reserveRatio()).to.equal(reserveRatio);
        console.log("ERC20ContinuousToken Name:", await erc20ContinuousToken.name());
        console.log("ERC20ContinuousToken Symbol:", await erc20ContinuousToken.symbol());
        console.log("ERC20ContinuousToken Reserve Ratio:", (await erc20ContinuousToken.reserveRatio()).toString());
        console.log("ERC20ContinuousToken Reserve Balance (ETH):", ethers.formatEther(await erc20ContinuousToken.checkReserveBalance()));
        console.log("ERC20ContinuousToken Total Supply:", ethers.formatEther(await erc20ContinuousToken.totalSupply()));
    });

    it("Should calculate buy correctly on ContinuousToken", async function () {
        const ethAmount = ethers.parseEther("5");
        const tokensToMint = await continuousToken.calculateBuy(ethAmount);
        console.log("Calculate Buy - ETH Amount:", ethers.formatEther(ethAmount));
        console.log("Calculate Buy - Tokens to Mint:", ethers.formatEther(tokensToMint));
        console.log("Current Total Supply:", ethers.formatEther(await continuousToken.totalSupply()));
        console.log("Current Reserve Balance:", ethers.formatEther(await continuousToken.reserveBalance()));
        expect(tokensToMint).to.be.gt(0);
    });

    it("Should allow minting on ERC20ContinuousToken", async function () {
        const ethAmount = ethers.parseEther("10");
        const initialBalance = await erc20ContinuousToken.balanceOf(await addr1.getAddress());
        const initialReserve = await erc20ContinuousToken.checkReserveBalance();
        const initialAddr1ReserveToken = await reserveToken.balanceOf(await addr1.getAddress());
        console.log("[Before Mint] Addr1 Token Balance (THRN):", ethers.formatEther(initialBalance));
        console.log("[Before Mint] Contract Reserve Balance (ETH):", ethers.formatEther(initialReserve));
        console.log("[Before Mint] Addr1 Reserve Token Balance (ETH):", ethers.formatEther(initialAddr1ReserveToken));

        await reserveToken.connect(addr1).approve(await erc20ContinuousToken.getAddress(), ethAmount);
        await erc20ContinuousToken.connect(addr1).mint(ethAmount);

        const finalBalance = await erc20ContinuousToken.balanceOf(await addr1.getAddress());
        const finalReserve = await erc20ContinuousToken.checkReserveBalance();
        const finalAddr1ReserveToken = await reserveToken.balanceOf(await addr1.getAddress());
        console.log("[After Mint] Addr1 Token Balance (THRN):", ethers.formatEther(finalBalance));
        console.log("[After Mint] Contract Reserve Balance (ETH):", ethers.formatEther(finalReserve));
        console.log("[After Mint] Addr1 Reserve Token Balance (ETH):", ethers.formatEther(finalAddr1ReserveToken));

        expect(finalBalance).to.be.gt(initialBalance);
        expect(finalReserve).to.equal(initialReserve + ethAmount);
    });

    it("Should calculate sell correctly on ContinuousToken", async function () {
        const tokenAmount = ethers.parseEther("5");
        const ethToReturn = await continuousToken.connect(addr1).calculateSell(tokenAmount);
        console.log("Calculate Sell - Token Amount:", ethers.formatEther(tokenAmount));
        console.log("Calculate Sell - ETH to Return:", ethers.formatEther(ethToReturn));
        console.log("Current Total Supply:", ethers.formatEther(await continuousToken.totalSupply()));
        console.log("Current Reserve Balance:", ethers.formatEther(await continuousToken.reserveBalance()));
        expect(ethToReturn).to.be.gt(0);
    });

    it("Should allow burning on ERC20ContinuousToken", async function () {
        const tokenAmount = ethers.parseEther("5");
        const initialBalance = await erc20ContinuousToken.balanceOf(await addr1.getAddress());
        const initialReserve = await erc20ContinuousToken.checkReserveBalance();
        const initialAddr1ReserveToken = await reserveToken.balanceOf(await addr1.getAddress());
        console.log("[Before Burn] Addr1 Token Balance (THRN):", ethers.formatEther(initialBalance));
        console.log("[Before Burn] Contract Reserve Balance (ETH):", ethers.formatEther(initialReserve));
        console.log("[Before Burn] Addr1 Reserve Token Balance (ETH):", ethers.formatEther(initialAddr1ReserveToken));

        await erc20ContinuousToken.connect(addr1).burn(tokenAmount);

        const finalBalance = await erc20ContinuousToken.balanceOf(await addr1.getAddress());
        const finalReserve = await erc20ContinuousToken.checkReserveBalance();
        const finalAddr1ReserveToken = await reserveToken.balanceOf(await addr1.getAddress());
        console.log("[After Burn] Addr1 Token Balance (THRN):", ethers.formatEther(finalBalance));
        console.log("[After Burn] Contract Reserve Balance (ETH):", ethers.formatEther(finalReserve));
        console.log("[After Burn] Addr1 Reserve Token Balance (ETH):", ethers.formatEther(finalAddr1ReserveToken));

        expect(finalBalance).to.equal(initialBalance - tokenAmount);
        expect(finalReserve).to.be.lt(initialReserve);
    });

    it("Should allow owner to withdraw ETH from ContinuousToken", async function () {
        const initialBalance = await ethers.provider.getBalance(await owner.getAddress());
        const initialReserve = await continuousToken.reserveBalance();
        const initialContractETH = await ethers.provider.getBalance(await continuousToken.getAddress());
        const withdrawAmount = ethers.parseEther("10");
        console.log("[Before Withdraw] Owner ETH Balance:", ethers.formatEther(initialBalance));
        console.log("[Before Withdraw] Contract Reserve Balance (ETH):", ethers.formatEther(initialReserve));
        console.log("[Before Withdraw] Contract ETH Balance:", ethers.formatEther(initialContractETH));

        await continuousToken.connect(owner).withdraw(withdrawAmount);

        const finalBalance = await ethers.provider.getBalance(await owner.getAddress());
        const finalReserve = await continuousToken.reserveBalance();
        const finalContractETH = await ethers.provider.getBalance(await continuousToken.getAddress());
        console.log("[After Withdraw] Owner ETH Balance:", ethers.formatEther(finalBalance));
        console.log("[After Withdraw] Contract Reserve Balance (ETH):", ethers.formatEther(finalReserve));
        console.log("[After Withdraw] Contract ETH Balance:", ethers.formatEther(finalContractETH));

        expect(finalReserve).to.equal(initialReserve - withdrawAmount);
        expect(finalBalance).to.be.gt(initialBalance);
        expect(finalContractETH).to.equal(initialContractETH - withdrawAmount);
    });
});