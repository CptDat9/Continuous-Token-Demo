import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { ContinuousToken, BancorBondingCurve } from "../typechain-types";

describe("ContinuousToken", function () {
    let continuousToken: ContinuousToken;
    let bondingCurve: BancorBondingCurve;
    let owner: Signer, addr1: Signer, addr2: Signer;
    const reserveRatio: number = 500000; // 50%

    before(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const BancorBondingCurveFactory = await ethers.getContractFactory("BancorBondingCurve");
        bondingCurve = (await BancorBondingCurveFactory.deploy()) as BancorBondingCurve;
        await bondingCurve.waitForDeployment();

        const ContinuousTokenFactory = await ethers.getContractFactory("ContinuousToken");
        continuousToken = (await ContinuousTokenFactory.deploy(
            "Thorn Continuous", "THORN", await bondingCurve.getAddress(), reserveRatio
        )) as ContinuousToken;
        await continuousToken.waitForDeployment();
    });

    it("Should deploy ContinuousToken correctly", async function () {
        expect(await continuousToken.name()).to.equal("Thorn Continuous");
        expect(await continuousToken.symbol()).to.equal("THORN");
        expect(await continuousToken.reserveRatio()).to.equal(reserveRatio);

        const reserveBalance = await continuousToken.reserveBalance();
        console.log("Reserve Balance:", ethers.formatEther(reserveBalance));
    });

    it("Should allow users to buy tokens", async function () {
        const buyAmount = ethers.parseEther("10"); // send 1 eth
        await continuousToken.connect(addr1).buyTokens({ value: buyAmount });

        const addr1Balance = await continuousToken.balanceOf(await addr1.getAddress());
        console.log("[After Buy] Addr1 Token Balance:", ethers.formatEther(addr1Balance));
        console.log("[After Buy] Reserve Balance:", ethers.formatEther(await continuousToken.reserveBalance()));

        expect(addr1Balance).to.be.gt(0);
    });

    it("Should allow users to sell tokens (case 1)", async function () {
        let sellAmount = await continuousToken.balanceOf(await addr1.getAddress());
        console.log("[Before Sell] Addr1 Token Balance:", ethers.formatEther(sellAmount));
        console.log("[Before Sell] Reserve Balance:", ethers.formatEther(await continuousToken.reserveBalance()));

        if (sellAmount > ethers.parseEther("0.0001")) {
            await continuousToken.connect(addr1).sellTokens(sellAmount);
            console.log("Sell transaction executed successfully");
        } else {
            console.log("Sell amount too low, skipping transaction.");
        }

        console.log("[After Sell] Addr1 Token Balance:", ethers.formatEther(await continuousToken.balanceOf(await addr1.getAddress())));
        console.log("[After Sell] Reserve Balance:", ethers.formatEther(await continuousToken.reserveBalance()));
    });

    it("Should allow users to sell tokens (case 2)", async function () {
        await continuousToken.connect(addr1).buyTokens({ value: ethers.parseEther("1") });
        const sellAmount = await continuousToken.balanceOf(await addr1.getAddress());
        console.log("[Before Sell] Addr1 Token Balance:", ethers.formatEther(sellAmount));
        console.log("[Before Sell] Reserve Balance:", ethers.formatEther(await continuousToken.reserveBalance()));

        await continuousToken.connect(addr1).sellTokens(sellAmount);

        console.log("[After Sell] Addr1 Token Balance:", ethers.formatEther(await continuousToken.balanceOf(await addr1.getAddress())));
        console.log("[After Sell] Reserve Balance:", ethers.formatEther(await continuousToken.reserveBalance()));

        expect(await continuousToken.balanceOf(await addr1.getAddress())).to.equal(0);
    });

    it("Should allow owner to withdraw ETH", async function () {
        const initialBalance = await ethers.provider.getBalance(await owner.getAddress());
        const withdrawAmount = ethers.parseEther("0.5");

        console.log("[Before Withdraw] Owner Balance:", ethers.formatEther(initialBalance));
        console.log("[Before Withdraw] Contract Reserve Balance:", ethers.formatEther(await continuousToken.reserveBalance()));

        await continuousToken.connect(owner).withdraw(withdrawAmount);
        const finalBalance = await ethers.provider.getBalance(await owner.getAddress());

        console.log("[After Withdraw] Owner Balance:", ethers.formatEther(finalBalance));
        console.log("[After Withdraw] Contract Reserve Balance:", ethers.formatEther(await continuousToken.reserveBalance()));

        expect(finalBalance).to.be.gt(initialBalance);
    });
});