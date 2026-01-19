const { ethers } = require("hardhat");
const { getDAI } = require("./utils_impersonate");
const config = require("./flash_config.json");

async function main() {
    const [deployer] = await ethers.getSigners();
    
    // 1. Send some DAI to the contract to cover the fee (just in case the arb fails but we want to test loan logic)
    const DAI_ADDR = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    await getDAI(config.contract); 
    
    const dai = await ethers.getContractAt("IERC20", DAI_ADDR);
    const bal = await dai.balanceOf(config.contract);
    console.log(`Contract funded with ${ethers.formatEther(bal)} DAI for fees.`);

    // 2. Now run the arbitrage execution...
}
main();
