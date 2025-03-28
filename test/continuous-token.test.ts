// import { expect } from "chai";
// import { ethers } from "hardhat";
// import { Signer } from "ethers";
// import { ContinuousToken, BancorBondingCurve } from "../typechain-types";

// describe("ContinuousToken", function () {
//     let continuousToken: ContinuousToken;
//     let bondingCurve: BancorBondingCurve;
//     let owner: Signer, addr1: Signer, addr2: Signer;
//     const reserveRatio: number = 500000; // 50%

//     before(async function () {
//         [owner, addr1, addr2] = await ethers.getSigners();

//         const BancorBondingCurveFactory = await ethers.getContractFactory("BancorBondingCurve");
//         bondingCurve = (await BancorBondingCurveFactory.deploy()) as BancorBondingCurve;
//         await bondingCurve.waitForDeployment();

//         const ContinuousTokenFactory = await ethers.getContractFactory("ContinuousToken");
//         continuousToken = (await ContinuousTokenFactory.deploy(
//             "Thorn Continuous", "THORN", await bondingCurve.getAddress(), reserveRatio
//         )) as ContinuousToken;
//         await continuousToken.waitForDeployment();

//         // Mint ban đầu cho addr1 để có token
//         await continuousToken.connect(owner).mint(await addr1.getAddress(), ethers.parseEther("10"));
//         const addr1Balance = await continuousToken.balanceOf(await addr1.getAddress());
//         console.log("[Init] Addr1 Token Balance:", ethers.formatEther(addr1Balance));

//     });

//     xit("Should deploy ContinuousToken correctly", async function () {
//         expect(await continuousToken.name()).to.equal("Thorn Continuous");
//         expect(await continuousToken.symbol()).to.equal("THORN");
//         expect(await continuousToken.reserveRatio()).to.equal(reserveRatio);

//         const reserveBalance = await continuousToken.reserveBalance();
//         console.log("Reserve Balance:", ethers.formatEther(reserveBalance));
//     });

//     xit("Should allow users to buy tokens", async function () {
//         const buyAmount = ethers.parseEther("10"); // Gửi 10 ETH để mua token
//         await continuousToken.connect(addr1).buyTokens({ value: buyAmount });

//         const addr1Balance = await continuousToken.balanceOf(await addr1.getAddress());
//         console.log("[After Buy] Addr1 Token Balance:", ethers.formatEther(addr1Balance));
//         console.log("[After Buy] Reserve Balance:", ethers.formatEther(await continuousToken.reserveBalance()));

//         expect(addr1Balance).to.be.gt(ethers.parseEther("10")); // Đã có 10 từ mint + mua thêm
//     });

//     xit("Should allow users to sell tokens (case 1)", async function () {
//         const sellAmount = ethers.parseEther("5"); // Bán 5 token
//         console.log("[Before Sell] Addr1 Token Balance:", ethers.formatEther(await continuousToken.balanceOf(await addr1.getAddress())));
//         console.log("[Before Sell] Reserve Balance:", ethers.formatEther(await continuousToken.reserveBalance()));
//         await continuousToken.connect(addr1).approve(continuousToken.target, ethers.parseEther("100"));
//         await continuousToken.connect(addr1).sellTokens(sellAmount);
//         console.log("Sell transaction executed successfully");

//         console.log("[After Sell] Addr1 Token Balance:", ethers.formatEther(await continuousToken.balanceOf(await addr1.getAddress())));
//         console.log("[After Sell] Reserve Balance:", ethers.formatEther(await continuousToken.reserveBalance()));

//         expect(await continuousToken.balanceOf(await addr1.getAddress())).to.be.lt(ethers.parseEther("10")); // Giảm sau khi bán

//       });

//     xit("Should allow users to sell tokens (case 2)", async function () {
//         const sellAmount = await continuousToken.balanceOf(await addr1.getAddress()); // Bán toàn bộ token còn lại
//         console.log("[Before Sell] Addr1 Token Balance:", ethers.formatEther(sellAmount));
//         console.log("[Before Sell] Reserve Balance:", ethers.fonprmatEther(await continuousToken.reserveBalance()));
//         await continuousToken.connect(addr1).approve(continuousToken.target, ethers.parseEther("100"));
//         await continuousToken.connect(addr1).sellTokens(sellAmount);

//         console.log("[After Sell] Addr1 Token Balance:", ethers.formatEther(await continuousToken.balanceOf(await addr1.getAddress())));
//         console.log("[After Sell] Reserve Balance:", ethers.formatEther(await continuousToken.reserveBalance()));

//         expect(await continuousToken.balanceOf(await addr1.getAddress())).to.equal(0);
//     });

//     xit("Should allow owner to withdraw ETH", async function () {
//         const initialBalance = await ethers.provider.getBalance(await owner.getAddress());
//         const withdrawAmount = ethers.parseEther("0.5");

//         console.log("[Before Withdraw] Owner Balance:", ethers.formatEther(initialBalance));
//         console.log("[Before Withdraw] Contract Reserve Balance:", ethers.formatEther(await continuousToken.reserveBalance()));

//         await continuousToken.connect(owner).withdraw(withdrawAmount);
//         const finalBalance = await ethers.provider.getBalance(await owner.getAddress());

//         console.log("[After Withdraw] Owner Balance:", ethers.formatEther(finalBalance));
//         console.log("[After Withdraw] Contract Reserve Balance:", ethers.formatEther(await continuousToken.reserveBalance()));

//         expect(finalBalance).to.be.gt(initialBalance);
//     });
// });