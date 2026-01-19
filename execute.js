const { ethers } = require("hardhat");
const config = require("./flash_config.json");

async function main() {
    const flashLoan = await ethers.getContractAt("FlashLoanReceiver", config.contract);
    const [signer] = await ethers.getSigners();

    // Addresses (Mainnet)
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const UNISWAP_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const SUSHISWAP_ROUTER = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";

    const BORROW_AMOUNT = ethers.parseEther("10000"); // Borrow 10,000 DAI

    // Encode params for the receiver contract
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "address", "address"],
        [UNISWAP_ROUTER, SUSHISWAP_ROUTER, WETH]
    );

    console.log("Requesting Flash Loan...");
    console.log(`Borrowing: ${ethers.formatEther(BORROW_AMOUNT)} DAI`);

    try {
        const tx = await flashLoan.requestFlashLoan(DAI, BORROW_AMOUNT, params);
        await tx.wait();
        console.log("Flash Loan Executed Successfully!");
        console.log("Note: Profit depends on actual spread between Uni/Sushi at this block.");
    } catch (e) {
        console.error("Execution Failed:", e.message);
        console.log("Reason: Likely unprofitable trade (repaid amount > trade output).");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
