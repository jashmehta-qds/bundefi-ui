# BunDefi UI

## Chainlink Integration for Hackathon Judges

### 1. How is Chainlink used?
BunDefi leverages Chainlink's Cross-Chain Interoperability Protocol (CCIP) to enable secure, automated, and composable cross-chain DeFi strategies. Chainlink CCIP is used to:
- Transfer assets and execute DeFi actions across multiple blockchains.
- Orchestrate complex, multi-step DeFi strategies that require cross-chain execution.
- Estimate and pay cross-chain execution fees securely.

### 2. Where is Chainlink executing in the UI?
- The core logic for interacting with Chainlink CCIP is implemented in [`lib/services/ccip.service.ts`](./lib/services/ccip.service.ts).
- The UI components that trigger and display CCIP execution are located in [`components/features/deploy/`](./components/features/deploy/), especially:
  - `hooks/useCCIPExecution.tsx`: Orchestrates the CCIP execution flow from the UI.
  - `CCIPStatus.tsx` and `ChainlinkLoadingOverlay.tsx`: Provide real-time feedback and status to users during cross-chain operations.
- Users interact with these features when deploying or managing cross-chain strategies in the app's deployment/automation flows.

### 3. What exactly are we doing with Chainlink?
- **Predicting Executor Addresses:** The UI predicts the address that will execute the cross-chain transaction on the destination chain using Chainlink CCIP.
- **Preparing and Approving Transactions:** The app prepares all necessary calldata for token approvals and DeFi actions, both on the source and destination chains.
- **Generating and Executing Cross-Chain Calls:** The UI assembles all steps into a single CCIP transaction, which is then sent via Chainlink's protocol to the destination chain for execution.
- **Estimating Fees:** The app uses Chainlink's contracts to estimate the required fee for cross-chain execution, displaying this to the user before confirmation.
- **User Experience:** Throughout the process, the UI provides clear feedback (loading overlays, status updates, error handling) to ensure users understand the cross-chain execution powered by Chainlink.

---

**For more details, see the code in [`lib/services/ccip.service.ts`](./lib/services/ccip.service.ts) and the deployment UI in [`components/features/deploy/`](./components/features/deploy/).** 