// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Minimal Interface for a DEX Router (Uniswap V2 / SushiSwap)
interface IDexRouter {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

contract FlashLoanReceiver is FlashLoanSimpleReceiverBase {
    address public owner;

    constructor(address _addressProvider) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) {
        owner = msg.sender;
    }

    /**
     * @dev This function is called by Aave after sending the assets.
     */
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        
        // 1. We now hold the borrowed 'amount' of 'asset'
        
        // 2. Decode params to get trade details (Router addresses, token path, etc.)
        (address routerA, address routerB, address tokenB) = abi.decode(params, (address, address, address));

        // 3. EXECUTE ARBITRAGE
        // Step A: Buy TokenB on Router A
        IERC20(asset).approve(routerA, amount);
        
        address[] memory path1 = new address[](2);
        path1[0] = asset;
        path1[1] = tokenB;
        
        uint256[] memory amounts = IDexRouter(routerA).swapExactTokensForTokens(
            amount, 
            0, // Accept any amount for this example (Unsafe in prod!)
            path1, 
            address(this), 
            block.timestamp
        );
        uint256 amountTokenB = amounts[1];

        // Step B: Sell TokenB on Router B
        IERC20(tokenB).approve(routerB, amountTokenB);
        
        address[] memory path2 = new address[](2);
        path2[0] = tokenB;
        path2[1] = asset;

        IDexRouter(routerB).swapExactTokensForTokens(
            amountTokenB, 
            0, 
            path2, 
            address(this), 
            block.timestamp
        );

        // 4. Repay Aave (Amount + Premium)
        uint256 amountOwed = amount + premium;
        IERC20(asset).approve(address(POOL), amountOwed);

        return true;
    }

    // Trigger the flash loan
    function requestFlashLoan(address _token, uint256 _amount, bytes calldata _params) public {
        address receiverAddress = address(this);
        address asset = _token;
        uint256 amount = _amount;
        bytes memory params = _params;
        uint16 referralCode = 0;

        POOL.flashLoanSimple(
            receiverAddress,
            asset,
            amount,
            params,
            referralCode
        );
    }
    
    // Withdraw profits
    function withdraw(address _token) external {
        require(msg.sender == owner, "Only owner");
        IERC20(_token).transfer(msg.sender, IERC20(_token).balanceOf(address(this)));
    }
}
