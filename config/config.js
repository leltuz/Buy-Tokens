const { Connection, clusterApiUrl } = require('@solana/web3.js');

const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

module.exports = { connection };