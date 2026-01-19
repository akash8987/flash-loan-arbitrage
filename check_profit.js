const { ethers } = require("hardhat");
const config = require("./flash_config.json");

async function main() {
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const dai = await ethers.getContractAt("IERC20", DAI);
    
    const bal = await dai.balanceOf(config.contract);
    console.log(`Bot Profit Balance: ${ethers.formatEther(bal)} DAI`);
}
main();
