const { connection } = require("./config");
const {
  MARKET_STATE_LAYOUT_V3,
  Liquidity,
  MAINNET_PROGRAM_ID,
  jsonInfo2PoolKeys,
} = require("@raydium-io/raydium-sdk");
const { unpackMint } = require("@solana/spl-token");
const { PublicKey } = require("@solana/web3.js");

async function getPoolKeys(marketID) {
  try {
    // Fetch market account information
    const marketBufferInfo = await connection.getAccountInfo(marketID);
    if (!marketBufferInfo) {
      console.log("!marketBufferInfo");
      return;
    }

    // Decode market state
    const {
      baseMint,
      quoteMint,
      baseVault: marketBaseVault,
      quoteVault: marketQuoteVault,
      bids: marketBids,
      asks: marketAsks,
      eventQueue: marketEventQueue,
    } = MARKET_STATE_LAYOUT_V3.decode(marketBufferInfo.data);

    console.log("Base mint: ", baseMint.toString());
    console.log("Quote mint: ", quoteMint.toString());

    // Fetch and decode base token mint info
    const accountInfoBase = await connection.getAccountInfo(baseMint);
    if (!accountInfoBase) {
      console.log("!accountInfo_base");
      return;
    }
    const baseTokenProgramId = accountInfoBase.owner;
    const baseDecimals = unpackMint(
      baseMint,
      accountInfoBase,
      baseTokenProgramId
    ).decimals;
    console.log("Base Decimals: ", baseDecimals);

    // Fetch and decode quote token mint info
    const accountInfoQuote = await connection.getAccountInfo(quoteMint);
    if (!accountInfoQuote) {
      console.log("!accountInfo_quote");
      return;
    }
    const quoteTokenProgramId = accountInfoQuote.owner;
    const quoteDecimals = unpackMint(
      quoteMint,
      accountInfoQuote,
      quoteTokenProgramId
    ).decimals;
    console.log("Quote Decimals: ", quoteDecimals);

    // Get associated pool keys
    const associatedPoolKeys = await Liquidity.getAssociatedPoolKeys({
      version: 4,
      marketVersion: 3,
      baseMint,
      quoteMint,
      baseDecimals,
      quoteDecimals,
      marketId: new PublicKey(marketID),
      programId: MAINNET_PROGRAM_ID.AmmV4,
      marketProgramId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
    });
    const { id: ammId, lpMint } = associatedPoolKeys;
    console.log("AMM ID: ", ammId.toString());
    console.log("lpMint: ", lpMint.toString());

    // Prepare pool info object
    const targetPoolInfo = {
      id: associatedPoolKeys.id.toString(),
      baseMint: associatedPoolKeys.baseMint.toString(),
      quoteMint: associatedPoolKeys.quoteMint.toString(),
      lpMint: associatedPoolKeys.lpMint.toString(),
      baseDecimals: associatedPoolKeys.baseDecimals,
      quoteDecimals: associatedPoolKeys.quoteDecimals,
      lpDecimals: associatedPoolKeys.lpDecimals,
      version: 4,
      programId: associatedPoolKeys.programId.toString(),
      authority: associatedPoolKeys.authority.toString(),
      openOrders: associatedPoolKeys.openOrders.toString(),
      targetOrders: associatedPoolKeys.targetOrders.toString(),
      baseVault: associatedPoolKeys.baseVault.toString(),
      quoteVault: associatedPoolKeys.quoteVault.toString(),
      withdrawQueue: associatedPoolKeys.withdrawQueue.toString(),
      lpVault: associatedPoolKeys.lpVault.toString(),
      marketVersion: 3,
      marketProgramId: associatedPoolKeys.marketProgramId.toString(),
      marketId: associatedPoolKeys.marketId.toString(),
      marketAuthority: associatedPoolKeys.marketAuthority.toString(),
      marketBaseVault: marketBaseVault.toString(),
      marketQuoteVault: marketQuoteVault.toString(),
      marketBids: marketBids.toString(),
      marketAsks: marketAsks.toString(),
      marketEventQueue: marketEventQueue.toString(),
      lookupTableAccount: PublicKey.default.toString(),
    };

    // Convert to pool keys
    const poolKeys = jsonInfo2PoolKeys(targetPoolInfo);
    return poolKeys;

  } catch (error) {
    console.error("Error getting pool keys:", error);
  }
}

module.exports = { getPoolKeys };