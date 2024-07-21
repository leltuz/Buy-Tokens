const { bulkPurchaseTokens } = require('./bulkPurchaseTokens');
const { Keypair } = require('@solana/web3.js');

// Replace with your actual wallet
/*
  const wallet = Keypair.fromSecretKey(...);
*/

// List of market IDs for bulk purchase
const marketIDs = ["J4fQTRN13MKpXhVE74t99msKJLbrjegjEgLBnzEv2YH1",
"C49Ut3om3QFTDrMZ5Cr8VcTKPpHDcQ2Fv8mmuJHHigDt",
"CmomKM8iPKRSMN7y1jqyW1QKj5bGoZmbvNZXWBJSUdnZ",
"8x17zMmVjJxqswjX4hNpxVPc7Tr5UabVJF3kv8TKq8Y3",
"3C2SN1FjzE9MiLFFVRp7Jhkp8Gjwpk29S2TCSJ2jkHn2",
"3JsSsmGzjWDNe9XCw2L9vznC5JU9wSqQeB6ns5pAkPeE",
"GhFiFrExPY3proVF96oth1gESWA5QPQzdtb8cy8b1YZv",
"8Cd7wXoPb5Yt9cUGtmHNqAEmpMDrhfcVqnGbLC48b8Qm",
"EjkkxYpfSwS6TAtKKuiJuNMMngYvumc1t1v9ZX1WJKMp",
"ARiZfq6dK19uNqxWyRudhbM2MswLyYhVUHdndGkffdGc",
"7Zt2KUh5mkpEpPGcNcFy51aGkh9Ycb5ELcqRH1n2GmAe",
"Ez4bst5qu5uqX3AntYWUdafw9XvtFeJ3gugytKKbSJso"];

// Execute bulk purchase
bulkPurchaseTokens(wallet, marketIDs);
