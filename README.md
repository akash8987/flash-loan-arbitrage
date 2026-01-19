# Flash Loan Arbitrage Bot

![Solidity](https://img.shields.io/badge/solidity-^0.8.20-blue)
![DeFi](https://img.shields.io/badge/strategy-arbitrage-red)
![License](https://img.shields.io/badge/license-MIT-green)

## Overview

**Flash Loans** allow you to borrow uncapped amounts of liquidity without collateral, as long as the funds are returned in the same block. This bot uses this mechanism to perform arbitrage (buying low on Exchange A, selling high on Exchange B) without using your own capital.

**Note**: To test this, you must use **Mainnet Forking** (simulating the real Ethereum state locally), as Flash Loans require deep liquidity pools (Aave/Uniswap) that don't exist on empty testnets.

## Workflow

1.  **Request**: Contract calls Aave Pool to borrow 1,000,000 DAI.
2.  **Receive**: Aave sends funds and calls your `executeOperation` function.
3.  **Arbitrage**:
    * Buy WETH on Uniswap V2 with borrowed DAI.
    * Sell WETH on SushiSwap for DAI.
4.  **Repay**: Return 1,000,000 DAI + 0.09% fee to Aave.
5.  **Profit**: Keep the remaining DAI.

## Usage

```bash
# 1. Install
npm install

# 2. Configure Mainnet Forking (in hardhat.config.js)
# You need an Alchemy/Infura API key for this.

# 3. Deploy Contract
npx hardhat run deploy.js --network localhost

# 4. Execute Flash Loan
npx hardhat run execute.js --network localhost
