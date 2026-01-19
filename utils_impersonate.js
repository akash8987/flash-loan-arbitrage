const { ethers, network } = require("hardhat");

// Helper to fund our account with DAI for testing (if needed to pay fee manually)
async function getDAI(recipient) {
    const DAI_WHALE = "0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf";
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [DAI_WHALE],
    });

    const whale = await ethers.getSigner(DAI_WHALE);
    const token = await ethers.getContractAt("IERC20", DAI, whale);
    
    await token.transfer(recipient, ethers.parseEther("1000"));
}

module.exports = { getDAI };
