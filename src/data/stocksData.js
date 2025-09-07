// Mock data for stocks
export const mockStocksData = {
    topGainers: [
        {
            id: 1,
            ticker: 'CNF',
            price: "4.76",
            change_amount: "2.36",
            change_percentage: "98.33%",
            volume: "1069162",
            color: '#007AFF',
        },
        {
            id: 2,
            ticker: 'AAPL',
            price: "182.75",
            change_amount: "5.42",
            change_percentage: "3.06%",
            volume: "1000000",
            color: '#34c759',
        },
        {
            id: 3,
            ticker: 'TSLA',
            price: "245.67",
            change_amount: "8.92",
            change_percentage: "3.77%",
            volume: "900000",
            color: '#ff3b30',
        },
        {
            id: 4,
            ticker: 'AMZN',
            price: "156.78",
            change_amount: "4.23",
            change_percentage: "2.77%",
            volume: "800000",
            color: '#ff9500',
        },
        {
            id: 5,
            ticker: 'GOOGL',
            price: "175.25",
            change_amount: "6.85",
            change_percentage: "4.07%",
            volume: "700000",
            color: '#5856d6',
        },
        {
            id: 6,
            ticker: 'META',
            price: "498.37",
            change_amount: "15.62",
            change_percentage: "3.24%",
            volume: "600000",
            color: '#af52de',
        },
    ],
    topLosers: [
        {
            id: 7,
            ticker: 'NFLX',
            price: "432.18",
            change_amount: "-18.45",
            change_percentage: "-4.10%",
            volume: "500000",
            color: '#ff2d92',
        },
        {
            id: 8,
            ticker: 'PYPL',
            price: "63.25",
            change_amount: "-2.87",
            change_percentage: "-4.34%",
            volume: "400000",
            color: '#64d2ff',
        },
        {
            id: 9,
            ticker: 'INTC',
            price: "28.94",
            change_amount: "-1.23",
            change_percentage: "-4.08%",
            volume: "300000",
            color: '#5ac8fa',
        },
        {
            id: 10,
            ticker: 'ZM',
            price: "68.77",
            change_amount: "-2.45",
            change_percentage: "-3.44%",
            volume: "200000",
            color: '#30b0c7',
        },
        {
            id: 11,
            ticker: 'PTON',
            price: "4.87",
            change_amount: "-0.23",
            change_percentage: "-4.51%",
            volume: "100000",
            color: '#32d74b',
        },
        {
            id: 12,
            ticker: 'DOCU',
            price: "52.31",
            change_amount: "-2.15",
            change_percentage: "-3.95%",
            volume: "50000",
            color: '#ffcc02',
        },
    ],
};

// Function to get random stock data (for future use)
export const generateRandomStock = () => {
    const companies = [
        { name: 'Apple Inc.', symbol: 'AAPL' },
        { name: 'Microsoft Corp.', symbol: 'MSFT' },
        { name: 'Amazon.com Inc.', symbol: 'AMZN' },
        { name: 'Google Class A', symbol: 'GOOGL' },
        { name: 'Tesla Inc.', symbol: 'TSLA' },
        { name: 'Meta Platforms', symbol: 'META' },
        { name: 'Netflix Inc.', symbol: 'NFLX' },
        { name: 'PayPal Holdings', symbol: 'PYPL' },
    ];

    const colors = [
        '#007AFF', '#34c759', '#ff3b30', '#ff9500',
        '#5856d6', '#af52de', '#ff2d92', '#64d2ff',
        '#5ac8fa', '#30b0c7', '#32d74b', '#ffcc02'
    ];

    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    const randomPrice = Math.random() * 500 + 10;
    const randomChange = (Math.random() - 0.5) * 20;
    const randomChangePercent = (randomChange / randomPrice) * 100;

    return {
        id: Date.now() + Math.random(),
        name: randomCompany.name,
        symbol: randomCompany.symbol,
        price: randomPrice,
        change: randomChange,
        changePercent: randomChangePercent,
        color: colors[Math.floor(Math.random() * colors.length)],
    };
};

// Function to search stocks
export const searchStocks = (query, stocks) => {
    if (!query.trim()) return stocks;

    const lowercaseQuery = query.toLowerCase();
    return stocks.filter(stock =>
        stock.ticker.toLowerCase().includes(lowercaseQuery)
    );
};
