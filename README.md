# Stoxy

A professional, theme-aware stock market app built with Expo (React Native) featuring:

- Real-time stock data and charts (Alpha Vantage API)
- Multi-watchlist support
- Professional UI/UX with light/dark mode
- Caching, error handling, and smooth navigation

---

## 🚀 Features

- **Explore Stocks:** Search and browse stocks with live data
- **Stock Details:** Company info, price chart (Victory Native), key metrics
- **Watchlists:** Create, manage, and add stocks to multiple watchlists
- **Add to Watchlist Modal:** Modern, lightweight modal for quick actions
- **Professional Chart:** Interactive, animated line chart with time range selector (1D, 1W, 1M, 3M, 1Y)
- **Theme Toggle:** Full light/dark mode support
- **Caching:** Fast, offline-friendly experience
- **API Proxy Support:** Secure API key handling

---

## 🛠️ Getting Started

### 1. **Clone the Repository**

```sh
git clone https://github.com/Bit-Mayank/Stoxy.git
cd Stoxy
```

### 2. **Install Dependencies**

```sh
npm install
```

### 3. **Set Up Environment Variables**

- Copy `.env.example` to `.env` and add your Alpha Vantage API key:
  ```
  API_KEY=your_alpha_vantage_key
  ```
- **Never commit your real API key to GitHub!**

### 4. **Start the App (Expo)**

```sh
npx expo start
```

---

## ⚙️ Project Structure

```
Stoxy/
  App.js
  .env
  package.json
  src/
    components/
      AddToWatchlistModal.js
      BookmarkIcon.js
      StockChart.js
    context/
      UserPreferences.js
      WatchlistContext.js
    navigation/
      Navigator.js
    network/
      AxiosConfig.js
    screens/
      ExploreScreen.js
      StockDetailsScreen.js
    services/
      api.js
      CacheService.js
    ...
```

---

## 🔑 API Key Management

- **Alpha Vantage API key** is required for real data.
- For testing, `API_KEY=demo` (only IBM data is available).
- For production, use a backend proxy for sensitive keys.
- **Never commit your real API key to version control!**

---

## 🧩 Key Technologies

- **React Native** (Expo)
- **Victory Native** (charts)
- **Alpha Vantage API** (stock data)
- **AsyncStorage** (caching)
- **react-native-svg** (SVG support)
- **expo-constants** (env config)

---

## 🏗️ Building the App

### **Android**

```sh
eas build -p android
```

### **iOS**

```sh
eas build -p ios
```

See [Expo EAS Build docs](https://docs.expo.dev/build/introduction/) for details.

---

## 🛡️ Security & Best Practices

- Do **not** commit `.env` or real API keys
- Use `.env.example` for templates
- Use a backend proxy for sensitive operations
- Add `.env` to `.gitignore`

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## 📄 License

MIT

---

## 🙋 FAQ

- **Q: Why is my API key not working?**
  - A: Make sure you set it in `.env` and restart Expo. For production, use a backend proxy.
- **Q: Why do I only see IBM data?**
  - A: The `demo` API key only supports IBM. Use your real key for other stocks.
- **Q: How do I add more features?**
  - A: See the `src/` folder for modular components and context providers.

---

## 📬 Contact

For questions, open an issue or contact mayankkushwah117@gmail.com.
