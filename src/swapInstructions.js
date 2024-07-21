const { TOKEN_PROGRAM_ID } = require('@raydium-io/raydium-sdk');
const { PublicKey } = require('@solana/web3.js');
const SPL_ACCOUNT_LAYOUT = require('@solana/spl-token').SPL_ACCOUNT_LAYOUT;

async function getWalletTokenAccount(connection, wallet) {
  const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
    programId: TOKEN_PROGRAM_ID,
  });
  return walletTokenAccount.value.map((i) => ({
    pubkey: i.pubkey,
    programId: i.account.owner,
    accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
  }));
}

async function buildSwapInstructions(
  connection,
  poolKeys,
  tokenAccountRawInfos_Swap,
  keypair,
  inputTokenAmount,
  minAmountOut
) {
  const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
    connection,
    poolKeys,
    userKeys: {
      tokenAccounts: tokenAccountRawInfos_Swap,
      owner: keypair.publicKey,
    },
    amountIn: inputTokenAmount,
    amountOut: minAmountOut,
    fixedSide: "in",
    makeTxVersion: undefined, // Set appropriate version if necessary
    computeBudgetConfig: await getComputeBudgetConfigHigh(),
  });

  return innerTransactions;
}

module.exports = { getWalletTokenAccount, buildSwapInstructions };