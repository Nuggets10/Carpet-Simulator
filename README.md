# Carpet Simulator
"Carpet Simulator" is an online trading system simulator. The "Carpet" trading system consists in buying fixed-size stock batches within a price range  at set intervals and selling each batch at a fixed profit.

## 📚 | Sections 

- [🔑 | Get an access token](#--get-an-access-token)
- [📈 | Usage](#--usage)
- [✏️ | CSV Format](#--csv-format)
- [🎯 | Changelog](#--changelog)
- [🖼 | Flaticon](#--flaticon)

## 🔑 | Get an access token

To access the website you'll need an access token. A new token is generated once every 3 days. You can find the newest token on X [here](https://www.example.com).
Tokens are made by both letters and numbers. Trying logging in with an expired or non-existing token will trigger an error, as show in the screenshot below:

<p align="center">
  <img width="750" height="375" alt="Image" src="https://github.com/user-attachments/assets/8a652a21-9cfa-4b75-8055-d8b09b104d72" />
</p>

## 📈 | Usage
Once logged into the website, you'll be met with the following screen:
<p align="center">
  <img width="1365" height="596" alt="Image" src="https://github.com/user-attachments/assets/adf62645-43db-41d0-804e-36c05f278825" />
</p>

The left panel is where you'll have to type or upload the desired values:
- **Lowest buy price.** The starting price where the packets will be bought.
- **Highest buy price.** The final price where the packets will be bought
- **Buy step.** The price distance between each packet.
- **Sell take.** The value to add to each packet's buy price to determine its sell price.
- **Number of shares per packet.** The number of shares contained in each of the packets.
- **Available funds.** Your starting capital.
- **Commissions tax.** The value used as commissions tax. Commissions are applied whenever you buy or sell shares.
- **CSV file.** The file with .csv extension you want to use as price data.

Once ready you can click the "Start" button. If you made any mistake when typing the values, the website will warn you and stop the simulation. Else, everything will work as normally.
Once the simulation finishes, you will be met with a message from your browser. The message contains the extended result of the simulation. Some of the included values are the price of the residual packets or the total capital gains tax paid.
If you prefer a more compact view, you can click "OK" on the browser pop-up message and every chart will be updated with the results of the simulation.
There are three pie chart, representing:
- How many packets you sold, and how many you didn't manage to sell.
- How many taxes you paid. Both commissions and capital gains are listed in the chart.
- How many of the packets you sold were in plus valence and how many in minus valence.

Then, you will be met with the value of rou capital at the end of the simulation. Here you can check if you lost money or had a gain.
The line chart displays the equity line. In other words, how your capital changed during the simulation. 


## ✏️ | CSV Format
CSV files are used to store tabular data. For the program to run properly, the CSV must meet the following requirements:
- At least 3 columns, named "Date", "MaxPrice, "MinPrice" without the quotes. The order of the columns does NOT matter. The "Date" field is self explanatory, "MaxPrice" is the max price registered at the current date, while "MinPrice" is the minimum price registered at the current date.
- Dates sorted in a reverse chronological order. For example, the first row after the header must have the most recent data. This is the default format provided by Finance Data websites such as Yahoo Finance and Borsa italiana.

The following are a couple examples of correct CSV files:

| Date  | MaxPrice | MinPrice |
| ------------- | ------------- | ------------- |
| 01/01/2025  | 5.00  | 3.70 |
| 02/01/2025  | 4.80  | 4 |

| MinPrice | MaxPrice | Date |
| ------------- | ------------- | ------------- |
| 3.70  | 5.00  | 01/01/2025 |
| 4 | 4.80  | 02/01/2025 |

(Please note that the CSV file can be of any lenght you desire)

## 🎯 | Changelog

Planned updates & fixes:
- Download data button

Changelog:
- v1.0:
  - First release
## 🖼 | Flaticon
Flaticon icon:
<a href="https://www.flaticon.com/free-icons/rebranding" title="rebranding icons">Rebranding icons created by Freepik - Flaticon</a>

X/Twitter logo icon:
<a href="https://www.flaticon.com/free-icons/twitter-logo" title="twitter logo icons">Twitter logo icons created by khulqi Rosyid - Flaticon</a>

Github icon:
<a href="https://www.flaticon.com/free-icons/github" title="github icons">Github icons created by Alfredo Creates - Flaticon</a>

Website icon:
<a href="https://www.flaticon.com/free-icons/carpet" title="carpet icons">Carpet icons created by Freepik - Flaticon</a>
