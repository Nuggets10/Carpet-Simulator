window.addEventListener('DOMContentLoaded', () => {
  const commonOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: 'white' } }
    }
  };

  const soldPacketsChartData = {
    labels: ['Sold packets', 'Leftover packets'],
    datasets: [{
      data: [1, 1],
      backgroundColor: ['#00d619', '#6e6e6e']
    }],
    options: {
      responsive: true,
      maintainAspectRatio: true
    }
  };

  const taxesChartData = {
    labels: ["Commisions", "Capital gains tax"],
    datasets: [{
      data: [1, 1],
      backgroundColor: ['#fcd303', '#00d6a3']
    }],
    options: {
      responsive: true,
      maintainAspectRatio: true
    }
  };

  const valenceChartData = {
    labels: ['Plusvalence packets', 'Minusvalence packets'],
    datasets: [{
      data: [1, 1],
      backgroundColor: ['#d60000', '#035afc']
    }],
    options: {
      responsive: true,
      maintainAspectRatio: true
    }
  };

  const packetsChart = document.getElementById('packetsChart');
  const taxesChart = document.getElementById('taxesChart');
  const valenceChart = document.getElementById('valenceChart');

  if (packetsChart && taxesChart && valenceChart && Chart) {
    new Chart(packetsChart, { type: 'pie', data: soldPacketsChartData, options: commonOptions });
    new Chart(taxesChart, { type: 'pie', data: taxesChartData, options: commonOptions });
    new Chart(valenceChart, { type: 'pie', data: valenceChartData, options: commonOptions });
  } else {
    alert('Chart.js or pie charts elements not loaded properly.');
  }
});

const ctx = document.getElementById('profitLineChart').getContext('2d');

const profitLineChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ["Start", "End"],
    datasets: [{
      label: 'Equity line',
      data: [0, 0],
      borderColor: 'white',
      borderWidth: 4,
      fill: false,
      tension: 0,
      pointRadius: 3,
      pointBackgroundColor: 'white',
      segment: {
        borderColor: ctx => {
          const currentValue = ctx.p1.parsed.y;
          const previousValue = ctx.p0.parsed.y;
          return currentValue > previousValue ? 'green' : 'red';
        }
      }
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        type: 'category',
        ticks: { 
          color: '#ffffff',
          maxTicksLimit: 20,
          autoSkip: true,
          maxRotation: 45,
          minRotation: 45
        },
        grid: { color: '#444' }
      },
      y: {
        ticks: { color: '#ffffff' },
        grid: { color: '#444' }
      }
    },
    plugins: {
      legend: {
        labels: { color: '#ffffff' }
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems) {
            return tooltipItems[0].label;
          }
        }
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy'
        },
        zoom: {
          wheel: {
            enabled: true
          },
          pinch: {
            enabled: true
          },
          mode: 'xy'
        }
      }
    }
  }
});

document.getElementById('resetButton').addEventListener('click', function () {
  profitLineChart.resetZoom();
});