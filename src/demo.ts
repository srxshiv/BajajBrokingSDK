import { BajajBrokingSDK } from './sdk/BajajBrokingSDK';

async function main() {
  const sdk = new BajajBrokingSDK();

  try {
    // View Instruments
    console.log("Fetching Instruments...");
    const instruments = await sdk.getInstruments();
    console.table(instruments);

    // Check Wallet before trading 
    console.log("\n fetching Wallet and portfolio and total portfolio value...");
    let portfolio = await sdk.getPortfolio();
    console.log(`💰 Cash Balance: ₹${portfolio.cash}`);
    console.log(`\n portfolio: ${portfolio.holdings}`);
    console.log(`\n total value: ${portfolio.totalPortfolioValue}`);

    // Buy BAJAJ (Market Order)
    console.log("\nPlacing BUY Order for BAJAJ (10 Qty)...");
    const buyOrder = await sdk.placeOrder("BAJAJ", "BUY", 10 , "MARKET");
    console.log(`Order Executed, ID: ${buyOrder.id} at Price: ₹${buyOrder.price}`);

    // Check Wallet again
    portfolio = await sdk.getPortfolio();
    console.log(`New Cash Balance: ₹${portfolio.cash}`);
    console.log("Holdings:", portfolio.holdings);

    // Sell Some Shares
    console.log("\nSelling 5 BAJAJ shares...");
    const sellOrder = await sdk.placeOrder("BAJAJ", "SELL", 5);
    console.log(`Order Sold, ID: ${sellOrder.id}`);

    // Final Portfolio Check
    portfolio = await sdk.getPortfolio();
    console.table(portfolio.holdings);
    console.log(`Final Cash: ₹${portfolio.cash}`);

  } catch (error: any) {
    console.error("demo Failed:", error.message);
  }
}

main();