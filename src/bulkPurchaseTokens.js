const { PublicKey, VersionedTransaction, TransactionMessage, sendAndConfirmTransaction, LAMPORTS_PER_SOL} = require('@solana/web3.js');
const { getWalletTokenAccount, buildSwapInstructions } = require('./swapInstructions');
const { getPoolKeys } = require('./poolKeys');
const { connection } = require('../config/config');

async function bulkPurchaseTokens(keypair, marketIDs, tokenAmounts) { // Added tokenAmounts parameter
  try {
    const blockhash = await connection.getLatestBlockhash('finalized');
    const messageInstructions = [];
    const transactions = []; // to hold versioned transactions
    let transactionCap = 0; // to divide up inner transactions

    for (let i = 0; i < marketIDs.length; i++) {
      const marketID = marketIDs[i];
      transactionCap++;

      // Retrieve pool keys using the provided market ID
      const poolKeys = await getPoolKeys(new PublicKey(marketID));
      if (!poolKeys) {
        console.log(`Failed to get pool keys for market ${marketID}`);
        continue;
      }

      // Retrieve token account information
      const sourceTokenAccounts = await getWalletTokenAccount(connection, keypair.publicKey); 
      const tokenAccountRawInfos_Swap = sourceTokenAccounts.map(account => ({
        pubkey: account.pubkey,
        programId: account.programId,
        accountInfo: account.accountInfo,
      }));
      
      // Handle varying amounts for each transaction
      const amountInSOL = tokenAmounts[i] || 0.001; // get the amount from the tokenAmounts array or default to 0.001 SOL
      const amountIn = amountInSOL * LAMPORTS_PER_SOL; // convert SOL to lamports
      const minAmountOut = 0; // adjust min amount to receive in SOL as needed

      const { swapInstruction } = await Swap.buildSwapInstructions({
        connection,
        poolKeys,
        tokenAccountRawInfos_Swap,  
        keypair,
        amountIn,
        minAmountOut
      });

      messageInstructions.push(swapInstruction);

      if (transactionCap % 4 === 0) {
        // Versioned Transactions
        const transactionMessage = new TransactionMessage({
          payerKey: keypair.publicKey,
          recentBlockhash: blockhash.blockhash,
          instructions: messageInstructions,
        });
      
        const versionedTransaction = new VersionedTransaction(transactionMessage);  // overcomes need for .add transactions
        versionedTransaction.sign(keypair);
      
        try {
          const signature = await sendAndConfirmTransaction(
            connection,
            versionedTransaction,
            [keypair],
            { skipPreflight: false, commitment: 'confirmed' }
          );
          console.log(`Transaction successful with signature: ${signature}`);
        } catch (error) {
          console.error('Transaction failed:', error);
        }
        transactions.push(versionedTransaction); // Add transaction to array
        messageInstructions.length = 0; // Clear instructions after sending
      }
      return transactions;  // array of versioned transations, 4 instructions each
    }
  } catch (error) {
    console.error('Error performing bulk purchase:', error);
  }
}

module.exports = bulkPurchaseTokens; // Export function
