const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with:", deployer.address);

    // Aave V3 PoolAddressesProvider on Ethereum Mainnet
    const AAVE_PROVIDER = "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e";

    const FlashLoan = await ethers.getContractFactory("FlashLoanReceiver");
    const flashLoan = await FlashLoan.deploy(AAVE_PROVIDER);
    await flashLoan.waitForDeployment();
    const address = await flashLoan.getAddress();

    console.log("FlashLoan Receiver Deployed:", address);

    const config = { contract: address };
    fs.writeFileSync("flash_config.json", JSON.stringify(config));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
