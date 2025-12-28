import axios from 'axios';

// Untrusted exchanges to exclude
const EXCLUDED_EXCHANGES = ['Meteora', 'Orca', 'Gate', 'AscendEX (BitMax)', 'UniSat (Runes)', 'Kraken'];

// Threshold for price difference to trigger notification (in percentage)
const PRICE_DIFF_THRESHOLD = 10; // 10%

export async function checkPriceDifference(tokenId = 'rune-pups') {
  try {
    // Fetch market data
    const apiUrl = `https://api.coingecko.com/api/v3/coins/${tokenId}?localization=false&tickers=true&market_data=false&community_data=false&developer_data=false&x_cg_demo_api_key=CG-15UFGRkXhyq9yGWGpxksHWr5`;
    
    // Use corsproxy.io - fast and reliable free proxy
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
    
    console.log(`🔍 Checking ${tokenId} prices...`);
    
    const response = await axios.get(proxyUrl, {
      timeout: 15000
    });
    
    // Extract only price and exchange (use raw USD, no rounding)
    const markets = (response.data.tickers || [])
      .map(ticker => ({
        exchange: ticker?.market?.name,
        exchangeUrl: ticker?.trade_url || `https://www.coingecko.com/en/coins/${tokenId}`,
        price: ticker?.converted_last?.usd
      }))
      .filter(m => (
        !!m.exchange &&
        !EXCLUDED_EXCHANGES.includes(m.exchange) &&
        typeof m.price === 'number' &&
        isFinite(m.price) &&
        m.price > 0
      ));
    
    if (markets.length === 0) {
      console.log('⚠️ No markets found');
      return null;
    }
    
    // Find the highest and lowest markets precisely
    const highestMarket = markets.reduce((a, b) => (a.price >= b.price ? a : b));
    const lowestMarket = markets.reduce((a, b) => (a.price <= b.price ? a : b));
    const highestPrice = highestMarket.price;
    const lowestPrice = lowestMarket.price;
    
    // Calculate percentage difference
    const priceDiff = ((highestPrice - lowestPrice) / lowestPrice * 100);
    
    console.log(`📊 Price difference: ${priceDiff.toFixed(2)}%`);
    
    return {
      tokenId: tokenId,
      tokenName: response.data.name,
      highest: highestMarket,
      lowest: lowestMarket,
      priceDiff: priceDiff,
      shouldNotify: priceDiff >= PRICE_DIFF_THRESHOLD
    };
  } catch (error) {
    console.error(`❌ Error fetching price data for ${tokenId}:`, error.message);
    throw error;
  }
}

export function formatPriceAlert(data) {
  const { tokenName, tokenId, highest, lowest, priceDiff } = data;
  
  const message = `
🚨 <b>${tokenName.toUpperCase()} PRICE ALERT</b> 🚨

💰 <b>Price Difference: ${priceDiff.toFixed(2)}%</b>

📈 <b>HIGHEST PRICE</b>
Exchange: ${highest.exchange}
Price: $${highest.price}

📉 <b>LOWEST PRICE</b>
Exchange: ${lowest.exchange}
Price: $${lowest.price}

💡 <b>Arbitrage Opportunity!</b>
Buy on ${lowest.exchange} and sell on ${highest.exchange}

⏰ Time: ${new Date().toLocaleString()}
  `.trim();
  
  return message;
}
