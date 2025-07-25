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
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const requiredHeaders = ['Date', 'MaxPrice', 'MinPrice', "ClosePrice"];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      callback("Error: missing columns in CSV file: ${missingHeaders.join(', ')} The file must at least have a column named Date, one named MaxPrice and one MinimumPrice. The order does not matter. For examples check the Github repo.", null);
      return;
    }

    const indices = requiredHeaders.map(h => headers.indexOf(h));
    const dateIndex = indices[requiredHeaders.indexOf('Date')];

    const cleanedCSV = lines.map((line, index) => {
      const cells = line.split(',');
      if (index === 0) {
        return indices.map(i => cells[i]).join(',');
      } else {

        return indices.map((i, colIndex) => {
          if (colIndex === requiredHeaders.indexOf('Date')) {

            const dateParts = cells[i].split('-');
            return dateParts.length === 3 ? dateParts[2] : cells[i]; // Return DD or original if format is invalid
          }
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
    let { Date, MaxPrice, MinPrice, ClosePrice } = day;

    // Buy
    buyLevels.forEach(level => {
      let packetCost = level * sharesPerPacket;
      let totalCost = packetCost + commissions;
      let isLevelAlreadyBought = packets.some(p => p.purchasePrice === level);
      if (MinPrice <= level && level <= MaxPrice && capital >= totalCost && !isLevelAlreadyBought) {
        console.log("Comprato pacchetto a livello " + level + " il " + Date + " per (con commissioni) " + totalCost)
        packets.push({
          purchasePrice: level,
          shares: sharesPerPacket,
          purchaseDate: Date
        });
        ownedPackets.push({
            purchasePrice: level,
            shares: sharesPerPacket,
            purchaseDate: Date
        });
        capital -= totalCost;
        packetsBought++;
        commissionsPaid += commissions;
      }
    });

    console.log("Capitale pari a " + capital + " dopo acquisti della giornata: " + Date)

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

        console.log("Venduto pacchetto acquistato a " + p.purchasePrice + " il " + Date + " per " + (p.purchasePrice + sellTake) + " Dopo tasse: " + netProceeds)

        totalGain += (netProceeds - (p.purchasePrice * p.shares));
        capital += netProceeds;

        console.log("Capitale pari a " + capital + " dopo vendita della giornata: " + Date + " del pacchetto con profitto netto di: " + netProceeds)
        
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
    capitalHistory.push({ date: Date, capital: equity });
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
  const headers = lines[0].split(',');
  return lines.slice(1).map((line, index) => {
    const values = line.split(',');
    const obj = headers.reduce((obj, header, index) => {
      obj[header] = parseFloat(values[index]) || values[index];
      return obj;
    }, {});
    // Verify date format
    //if (!/^\d{4}-\d{2}-\d{2}$/.test(obj.Date)) {
      //console.warn(`Date format not valid at line ${index + 2}: ${obj.Date}`);
    //}
    return obj;
  });
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

  // Line chart
  const profitLineChart = Chart.getChart('profitLineChart');
  if (profitLineChart) {
    const labels = capitalHistory.map(entry => {
      if (entry.date === 'Start') return 'Start';
      return `D:${entry.date}`;
    });
    const dataPoints = capitalHistory.map(entry => entry.capital);

    profitLineChart.data.labels = labels;
    profitLineChart.data.datasets[0].data = dataPoints;
    profitLineChart.options.scales.x = {
      type: 'category',
      ticks: {
        maxTicksLimit: 20,
        autoSkip: true,
        maxRotation: 45,
        minRotation: 45
      }
    };
    profitLineChart.update();
  } else {
    console.error('Profit Line Chart not found.');
  }
}
