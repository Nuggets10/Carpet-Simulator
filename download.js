document.addEventListener('DOMContentLoaded', () => {
  const downloadButton = document.getElementById('downloadButton');
  const downloadOverlay = document.getElementById('downloadOverlay');
  const closeDownloadOverlay = document.getElementById('closeDownloadOverlay');
  const downloadDataButton = document.getElementById('downloadDataButton');

  const API_AlphaVantage = "DNFQJTCEAMFK2HW7";
  const API_FMP = "Oys57Sq8PF40oVXlJgrpwFdzr6VrVyru";

  if (!downloadButton || !downloadOverlay || !closeDownloadOverlay || !downloadDataButton) {
    console.error('One or more elements not found:', {
      downloadButton,
      downloadOverlay,
      closeDownloadOverlay,
      downloadDataButton
    });
    return;
  }

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

      // Convert to CSV and keep only Date, MaxPrice, MinPrice columns
      const timeSeries = data['Time Series (Daily)'];
      const headers = ['Date', 'MaxPrice', 'MinPrice'];
      const csvRows = [headers.join(',')];

      // Filter data by date range and convert to CSV rows
      for (const [date, values] of Object.entries(timeSeries)) {
        if (date >= startDate && date <= endDate) {
          const row = [
            date,
            values['2. high'],
            values['3. low']
          ];
          csvRows.push(row.join(','));
        }
      }

      const csvContent = csvRows.join('\n');

      // Trigger download
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
      console.error('Error fetching or processing Alpha Vantage data:', error);
      alert('Error while downloading from Alpha Vantage. The API key may have hit request limits, or the data format is invalid.');
    }
  }

  async function downloadFromFMP(ticker, startDate, endDate) {
    try {
      const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?from=${startDate}&to=${endDate}&apikey=${API_FMP}`;
      const response = await fetch(url);
      const data = await response.json();
      // TODO: Implement FMP data conversion to CSV and download
      return data;
    } catch (error) {
      console.error('Error fetching FMP data:', error);
      alert('Error while downloading from FMP. The API key has probably hit the request per minute or daily limits.');
    }
  }

  downloadDataButton.addEventListener('click', async () => {
    const dataSource = document.getElementById('dataSource').value;
    const ticker = document.getElementById('ticker').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!dataSource || !ticker || !startDate || !endDate) {
      alert('Please fill in all fields.');
      return;
    }

    console.log('Downloading data:', { dataSource, ticker, startDate, endDate });

    // Call the function based on the selected data source
    if (dataSource === 'alphavantage') {
      await downloadFromAlphaVantage(ticker, startDate, endDate);
    } else if (dataSource === 'fmp') {
      await downloadFromFMP(ticker, startDate, endDate);
    } else {
      alert('Invalid data source selected.');
      return;
    }

    // Close the overlay after downloading data
    downloadOverlay.style.display = 'none';
    document.body.style.pointerEvents = 'auto';
  });
});
