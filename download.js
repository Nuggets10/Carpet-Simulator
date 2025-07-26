document.addEventListener('DOMContentLoaded', () => {
    const downloadButton = document.getElementById('downloadButton');
    const downloadOverlay = document.getElementById('downloadOverlay');
    const closeDownloadOverlay = document.getElementById('closeDownloadOverlay');
    const downloadDataButton = document.getElementById('downloadDataButton');

    const API_AlphaVantage = config.AlphaVantage;
    const API_FMP = config.FMP;
    const API_EODHD = config.EODHD;

    downloadButton.addEventListener('click', () => {
        downloadOverlay.style.display = 'flex';
        document.body.style.pointerEvents = 'none';
        downloadOverlay.style.pointerEvents = 'auto';
    });

    closeDownloadOverlay.addEventListener('click', () => {
        downloadOverlay.style.display = 'none';
        document.body.style.pointerEvents = 'auto';
    });

  async function downloadFromAlphaVantage(ticker, startDate, endDate) {
      try {
          const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${API_AlphaVantage}&outputsize=full`;
          const response = await fetch(url);
          const data = await response.json();

          const timeSeries = data['Time Series (Daily)'];
          const headers = ['Date', 'MaxPrice', 'MinPrice', 'ClosePrice'];
          const csvRows = [headers.join(',')];

          for (const [date, values] of Object.entries(timeSeries)) {
              if (date >= startDate && date <= endDate) {
                  const row = [
                      date,
                      values['2. high'],
                      values['3. low'],
                      values['4. close']
                  ];
                  csvRows.push(row.join(','));
              }
          }

          const csvContent = csvRows.join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const urlBlob = URL.createObjectURL(blob);

          link.setAttribute('href', urlBlob);
          link.setAttribute('download', `${ticker}_stock_data.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(urlBlob);

          return data;
      } catch (error) {
          alert('Error fetching or processing Alpha Vantage data:', error);
          alert('Error while downloading from Alpha Vantage. The API key may have hit request limits, or the data format is invalid.');
      }
  }

    async function downloadFromFMP(ticker, startDate, endDate) {
        try {
            const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?from=${startDate}&to=${endDate}&apikey=${API_FMP}`;
            const response = await fetch(url);
            const data = await response.json();

            const headers = ['Date', 'MaxPrice', 'MinPrice', 'ClosePrice'];
            const csvRows = [headers.join(',')];

            const sortedData = data.historical.sort((a, b) => new Date(b.date) - new Date(a.date));

            for (const entry of sortedData) {
                if (entry.date >= startDate && entry.date <= endDate) {
                    const row = [
                        entry.date,
                        entry.high,
                        entry.low,
                        entry.close
                    ];
                    csvRows.push(row.join(','));
                }
            }

            const csvContent = csvRows.join('\n');

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const urlBlob = URL.createObjectURL(blob);

            link.setAttribute('href', urlBlob);
            link.setAttribute('download', `${ticker}_stock_data.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(urlBlob);

            return data;
        } catch (error) {
            alert('Error fetching or processing FMP data:', error);
            alert('Error while downloading from FMP. The API key has probably hit the request per minute or daily limits.');
        }
    }

    async function downloadFromEODHD(ticker, startDate, endDate) {
        try {
            const url = `https://eodhd.com/api/eod/${ticker}?from=${startDate}&to=${endDate}&period=d&api_token=${API_EODHD}&fmt=json`;
            const response = await fetch(url);
            const data = await response.json();

            const headers = ['Date', 'MaxPrice', 'MinPrice', 'ClosePrice'];
            const csvRows = [headers.join(',')];

            const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));

            for (const entry of sortedData) {
                if (entry.date >= startDate && entry.date <= endDate) {
                    const row = [
                        entry.date,
                        entry.high,
                        entry.low,
                        entry.close
                    ];
                    csvRows.push(row.join(','));
                }
            }

            const csvContent = csvRows.join('\n');

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const urlBlob = URL.createObjectURL(blob);

            link.setAttribute('href', urlBlob);
            link.setAttribute('download', `${ticker}_stock_data.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(urlBlob);

            return data;
        } catch (error) {
            alert('Error fetching or processing EODHD data:', error);
            alert('Error while downloading from EODHD. Check your API key, ticker format (e.g., AAPL.US), or request limits.');
        }
    }

    downloadDataButton.addEventListener('click', async () => {
        const dataSource = document.getElementById('dataSource').value;
        const ticker = document.getElementById('ticker').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (startDate > endDate) {
            alert('Start date must be before the end date.');
            return;
        }

        if (!dataSource || !ticker || !startDate || !endDate) {
            alert('Please fill in all fields.');
            return;
        }

        console.log('Downloading data:', { dataSource, ticker, startDate, endDate });

        if (dataSource === 'alphavantage') {
            await downloadFromAlphaVantage(ticker, startDate, endDate);
        } else if (dataSource === 'fmp') {
            await downloadFromFMP(ticker, startDate, endDate);
        } else if (dataSource === 'eodhd') {
            await downloadFromEODHD(ticker, startDate, endDate);
        } else {
            alert('Invalid data source selected.');
            return;
        }
    });
});
