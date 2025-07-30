document.getElementById('startButton').addEventListener('click', function () {
  // Take user input values
  const lowestBuyPrice = document.getElementById('LowestBuyPrice').value.replace(',', '.');
  const highestBuyPrice = document.getElementById('HighestBuyPrice').value.replace(',', '.');
  const buyStep = document.getElementById('BuyStep').value.replace(',', '.');
  const sellTake = document.getElementById('SellTake').value.replace(',', '.');
  const sharesPerPacket = document.getElementById('SharesPerPacket').value.replace(',', '.');
  let funds = document.getElementById('Funds').value.replace(',', '.');
  const commissions = document.getElementById('Commissions').value.replace(',', '.');
  const csvFile = document.getElementById('csvFile').files[0];
  const checkbox = document.getElementById("reverseCheckbox");
  
  const isReverse = checkbox.checked;

  // Convert to numbers
  const lowestBuyPriceNum = parseFloat(lowestBuyPrice);
  const highestBuyPriceNum = parseFloat(highestBuyPrice);
  const buyStepNum = parseFloat(buyStep);
  const sellTakeNum = parseFloat(sellTake);
  const sharesPerPacketNum = parseInt(sharesPerPacket);
  const fundsNum = parseFloat(funds);
  const commissionsNum = parseFloat(commissions);

  if (!csvFile) {
    alert('Please upload a CSV file.');
    return;
  }

  validateAndCleanCSV(csvFile, function (error, cleanedCSV) {
    if (error) {
      alert(error);
      return;
    }

    runSimulation(cleanedCSV, {
      lowestBuyPrice: lowestBuyPriceNum,
      highestBuyPrice: highestBuyPriceNum,
      buyStep: buyStepNum,
      sellTake: sellTakeNum,
      sharesPerPacket: sharesPerPacketNum,
      funds: fundsNum,
      commissions: commissionsNum,
      isReverse: isReverse
    });
  });
});

function validateAndCleanCSV(file, callback) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    // Normalize line endings and trim whitespace
    const lines = text.replace(/\r\n/g, '\n').trim().split('\n').map(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());

    const requiredHeaders = ['Date', 'MaxPrice', 'MinPrice', 'ClosePrice'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      callback(`Error: missing columns in CSV file: ${missingHeaders.join(', ')}. The file must at least have a column named Date, one named MaxPrice, one named MinPrice, and one named ClosePrice. The order does not matter. For examples, check the GitHub repo.`, null);
      return;
    }

    const indices = requiredHeaders.map(h => headers.indexOf(h));

    const cleanedCSV = lines.map((line, index) => {
      const cells = line.split(',').map(cell => cell.trim());
      if (index === 0) {
        // Keep only required headers
        return indices.map(i => cells[i]).join(',');
      } else {
        return indices.map((i, colIndex) => {
          // Treat Date column as a string, no validation
          return cells[i];
        }).join(',');
      }
    }).join('\n');

    callback(null, cleanedCSV);
  };

  reader.onerror = function () {
    callback('Error while reading CSV file.', null);
  };

  reader.readAsText(file);
}

function runSimulation(cleanedCSV, params) {

  console.log("Inizio simulazione")
  
  const {
    lowestBuyPrice,
    highestBuyPrice,
    buyStep,
    sellTake,
    sharesPerPacket,
    funds,
    commissions,
    isReverse
  } = params;

  let data = parseCSV(cleanedCSV);

  if (isReverse == true) {
      data = data.reverse();
  }

  let packets = [];
  let ownedPackets = []; // MODIFICATO CAPITAL GAINS TAX
  let capital = funds;
  let totalGain = 0;
  let packetsBought = 0;
  let packetsSold = 0;
  let commissionsPaid = 0;
  let capitalGainsTaxPaid = 0;
  let packetsInPlus = 0;
  let packetsInMinus = 0;
  let capitalHistory = [{ date: 'Start', capital: funds }];
  let equity = capital;

  // Generate buy levels
  let buyLevels = [];
  for (let price = highestBuyPrice; price >= lowestBuyPrice; price -= buyStep) {
    buyLevels.push(price);
  }

  console.log("")
  console.log("Livelli di acquisto: " + buyLevels)

  // Simulate for each day
  data.forEach(day => {
    let { Date: date, MaxPrice, MinPrice, ClosePrice } = day;
    console.log(date, MaxPrice, MinPrice, ClosePrice)

    // Buy
    buyLevels.forEach(level => {
      let packetCost = level * sharesPerPacket;
      let totalCost = packetCost + commissions;
      let isLevelAlreadyBought = packets.some(p => p.purchasePrice === level);
      if (MinPrice <= level && level <= MaxPrice && capital >= totalCost && !isLevelAlreadyBought) {
        console.log("Comprato pacchetto a livello " + level + " il " + date + " per (con commissioni) " + totalCost)
        addLogEntry(date, "Buy", "Bought packet at " + level + " for " + totalCost)
        packets.push({
          purchasePrice: level,
          shares: sharesPerPacket,
          purchaseDate: date
        });
        ownedPackets.push({
            purchasePrice: level,
            shares: sharesPerPacket,
            purchaseDate: date
        });
        capital -= totalCost;
        packetsBought++;
        commissionsPaid += commissions;
      }
    });

    console.log("Capitale pari a " + capital + " dopo acquisti della giornata: " + date)

    // Sell
    let packetsToSell = packets.filter(p => MaxPrice >= p.purchasePrice + sellTake);
    if (packetsToSell.length > 0) {
      const sumPurchasePrices = ownedPackets.reduce((sum, p) => sum + p.purchasePrice, 0); // MODIFICATO CAPITAL GAINS TAX
      const averagePurchasePrice = sumPurchasePrices / ownedPackets.length; // MODIFICATO CAPITAL GAINS TAX

      packetsToSell.forEach(p => {
        const targetSellPrice = p.purchasePrice + sellTake;
        const isInPlus = targetSellPrice > averagePurchasePrice;
        const grossProceeds = targetSellPrice * p.shares;
        const profit = grossProceeds - (p.purchasePrice * p.shares);
        const capitalGainTax = (profit > 0 && isInPlus) ? profit * 0.26 : 0; // MODIFICATO CAPITAL GAINS TAX
        const netProceeds = grossProceeds - commissions - capitalGainTax;

        console.log("Venduto pacchetto acquistato a " + p.purchasePrice + " il " + date + " per " + (p.purchasePrice + sellTake) + " Dopo tasse: " + netProceeds)
        addLogEntry(date, "Sell", "Sold packet at " + p.purchasePrice + " for " + netProceeds)

        totalGain += (netProceeds - (p.purchasePrice * p.shares));
        capital += netProceeds;

        console.log("Capitale pari a " + capital + " dopo vendita della giornata: " + date + " del pacchetto con profitto netto di: " + netProceeds)
        
        commissionsPaid += commissions;
        capitalGainsTaxPaid += capitalGainTax;

        if (isInPlus) {
          packetsInPlus++;
        } else {
          packetsInMinus++;
        }

        packetsSold++;
      });

      // Remove sold packets
      packets = packets.filter(p => !packetsToSell.includes(p));
    }
    equity = capital + packets.length * sharesPerPacket * ClosePrice;
    capitalHistory.push({ date: date, capital: equity });
  });

  const residualValue = packets.reduce((sum, p) => sum + (p.purchasePrice * p.shares), 0);
  const packetsLeft = packets.length;
  console.log("")
  console.log("Fine simulazione")
  console.log("Capitale residuo: " + capital)
  console.log("Pacchetti residui: " + packetsLeft + " il cui valore è: " + residualValue)
  const finalGain = capital - funds;

  displayResults({
    packetsBought,
    packetsSold,
    packetsLeft,
    residualValue,
    capital,
    totalGain,
    commissionsPaid,
    capitalGainsTaxPaid,
    packetsInPlus,
    packetsInMinus,
    finalGain,
    capitalHistory,
    equity
  });
}

function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim());
    const obj = headers.reduce((obj, header, index) => {
      if (header === 'Date') {
        obj[header] = values[index];
      } else {
        obj[header] = parseFloat(values[index]) || values[index];
      }
      return obj;
    }, {});
    return obj;
  });
}

function addLogEntry(date, type, content) {
  const tableBody = document.querySelector('#logTable tbody');
  const row = document.createElement('tr');

  const dateCell = document.createElement('td');
  dateCell.textContent = date;

  const typeCell = document.createElement('td');
  typeCell.textContent = type;

  const contentCell = document.createElement('td');
  contentCell.textContent = content;

  row.appendChild(dateCell);
  row.appendChild(typeCell);
  row.appendChild(contentCell);

  tableBody.appendChild(row);
}

function displayResults(results) {
  const {
    packetsBought,
    packetsSold,
    packetsLeft,
    residualValue,
    capital,
    totalGain,
    commissionsPaid,
    capitalGainsTaxPaid,
    packetsInPlus,
    packetsInMinus,
    capitalHistory,
    equity
  } = results;

  const resultMessage = `
Simulation Results:

Packets Bought: ${packetsBought}
Packets Sold: ${packetsSold}
Packets Left: ${packetsLeft}
Residual Packets Value: ${residualValue.toFixed(2)}
Remaining Capital: ${capital.toFixed(2)}
Total Net Gain: ${totalGain.toFixed(2)}
Total Commissions Paid: ${commissionsPaid.toFixed(2)}
Total Capital Gains Tax Paid: ${capitalGainsTaxPaid.toFixed(2)}
Packets Sold in Plus Valence: ${packetsInPlus}
Packets Sold in Minus Valence: ${packetsInMinus}
  `.trim();

  alert(resultMessage);

  updateCharts({
    packetsSold,
    packetsLeft,
    commissionsPaid,
    capitalGainsTaxPaid,
    packetsInPlus,
    packetsInMinus,
    totalGain,
    capital,
    capitalHistory,
    equity
  });
}

function updateCharts({
  packetsSold,
  packetsLeft,
  commissionsPaid,
  capitalGainsTaxPaid,
  packetsInPlus,
  packetsInMinus,
  capitalHistory,
  equity
}) {
  // Packets chart
  const packetsChart = Chart.getChart('packetsChart');
  if (packetsChart) {
    packetsChart.data.datasets[0].data = [packetsSold, packetsLeft];
    packetsChart.update();
  } else {
    console.error('Packets Chart not found.');
  }

  // Taxes chart
  const taxesChart = Chart.getChart('taxesChart');
  if (taxesChart) {
    taxesChart.data.datasets[0].data = [commissionsPaid, capitalGainsTaxPaid];
    taxesChart.update();
  } else {
    console.error('Taxes Chart not found.');
  }

  // Valence chart
  const valenceChart = Chart.getChart('valenceChart');
  if (valenceChart) {
    valenceChart.data.datasets[0].data = [packetsInPlus, packetsInMinus];
    valenceChart.update();
  } else {
    console.error('Valence Chart not found.');
  }

  equity = Math.round(equity)

  const profitLossElement = document.getElementById('profitText');
  profitLossElement.textContent = `Final capital: ${equity}`;

  const profitLineChart = Chart.getChart('profitLineChart');
  if (profitLineChart) {
    const labels = capitalHistory.map(entry => {
      if (entry.date === 'Start') return 'Start';
      return entry.date;
    });
    const dataPoints = capitalHistory.map(entry => entry.capital);
  
    profitLineChart.data.labels = labels;
    profitLineChart.data.datasets[0].data = dataPoints;
  
    // Calcolo dei nuovi limiti
    const xMin = 0;
    const xMax = labels.length - 1;
    const yMin = Math.min(...dataPoints);
    const yMax = Math.max(...dataPoints);
    const yRange = yMax - yMin || 1;
  
    // Aggiornamento delle scale e dei limiti di zoom/pan
    profitLineChart.options.scales.x = {
      type: 'category',
      ticks: {
        maxTicksLimit: 20,
        autoSkip: true,
        maxRotation: 45,
        minRotation: 45,
        color: '#ffffff'
      },
      grid: { color: '#444' }
    };
    profitLineChart.options.scales.y = {
      ticks: { color: '#ffffff' },
      grid: { color: '#444' }
    };
  
    profitLineChart.options.plugins.zoom = {
      pan: {
        enabled: true,
        mode: 'xy',
        limits: {
          x: { min: xMin, max: xMax },
          y: { min: yMin, max: yMax }
        }
      },
      zoom: {
        wheel: { enabled: true },
        pinch: { enabled: true },
        mode: 'xy',
        limits: {
          x: {
            minRange: 1,
            maxRange: labels.length
          },
          y: {
            minRange: yRange * 0.1,
            maxRange: yRange
          }
        }
      }
    };    
  
    profitLineChart.update();
  } else {
    console.error('Profit Line Chart not found.');
  }
  
}
