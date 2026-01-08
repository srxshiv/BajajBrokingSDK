import { BajajBrokingSDK } from './sdk/BajajBrokingSDK';

async function main() {
  const sdk = new BajajBrokingSDK();
  
  console.log("🚀 Starting Trading Simulation...\n");

  try {
    // 1. View Market Data
    console.log("1. Fetching Instruments...");
    const instruments = await sdk.getInstruments();
    console.table(instruments);

    // 2. Check Wallet before trading
    console.log("\n2. Checking Wallet...");
    let portfolio = await sdk.getPortfolio();
    console.log(`💰 Cash Balance: ₹${portfolio.cash}`);

    // 3. Buy RELIANCE (Market Order)
    console.log("\n3. Placing BUY Order for RELIANCE (10 Qty)...");
    const buyOrder = await sdk.placeOrder("RELIANCE", "BUY", 10);
    console.log(`✅ Order Executed! ID: ${buyOrder.id} at Price: ₹${buyOrder.price}`);

    // 4. Check Wallet again
    portfolio = await sdk.getPortfolio();
    console.log(`💰 New Cash Balance: ₹${portfolio.cash}`);
    console.log("📦 Holdings:", portfolio.holdings);

    // 5. Sell Some Shares
    console.log("\n5. Selling 5 RELIANCE shares...");
    const sellOrder = await sdk.placeOrder("RELIANCE", "SELL", 5);
    console.log(`✅ Order Sold! ID: ${sellOrder.id}`);

    // 6. Final Portfolio Check
    portfolio = await sdk.getPortfolio();
    console.table(portfolio.holdings);
    console.log(`💰 Final Cash: ₹${portfolio.cash}`);

  } catch (error: any) {
    console.error("❌ Simulation Failed:", error.message);
  }
}

main();