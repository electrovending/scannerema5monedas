
const fetchKline = async (symbol) => {
  const url = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=1`;
  const response = await fetch(url);
  const data = await response.json();
  const kline = data.result.list;
  const numericValues = kline.map(entry => parseFloat(entry[1]));
  const ema = EMA(numericValues, 59);
  const emaDist = ((numericValues[0] - ema[0]) / numericValues[0]) * 100;
  if(emaDist>=1){
  console.log(symbol, emaDist); 
  } 
  return { symbol, EMA_dist: emaDist };
};

const analyzeCoins = async () => {
  const coinsResponse = await fetch('https://api.bybit.com/v5/market/instruments-info?category=linear');
  const coinsData = await coinsResponse.json();
  const coins = coinsData.result.list.filter(coin => coin.status === 'Trading').map(coin => coin.symbol);

  const results = await Promise.all(coins.map(coin => fetchKline(coin)));
  const positiveDF = results.filter(({ EMA_dist }) => EMA_dist > 1.2).sort((a, b) => b.EMA_dist - a.EMA_dist).slice(0, 5);
  const negativeDF = results.filter(({ EMA_dist }) => EMA_dist < -1.2).sort((a, b) => a.EMA_dist - b.EMA_dist).slice(0, 5);

  populateTable('positiveTable', positiveDF);
  populateTable('negativeTable', negativeDF);
}; 

const populateTable = (tableId, data) => {
  const tableBody = document.getElementById(tableId).getElementsByTagName('tbody')[0];

  // Limpiar el cuerpo de la tabla antes de agregar nuevos datos
  tableBody.innerHTML = '';

  data.forEach(({ symbol, EMA_dist }) => {
      const row = tableBody.insertRow();
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);
      cell1.textContent = symbol;
      cell2.textContent = EMA_dist;
  });
};

setInterval(analyzeCoins, 10000);
analyzeCoins();