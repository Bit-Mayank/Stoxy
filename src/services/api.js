import apiClient from "../network/AxiosConfig";
import cacheService from "./CacheService";
import AsyncStorage from '@react-native-async-storage/async-storage';

class StockApiService {
    // Cache endpoint constants
    static ENDPOINTS = {
        SYMBOL_SEARCH: 'SYMBOL_SEARCH',
        COMPANY_OVERVIEW: 'COMPANY_OVERVIEW',
        TOP_GAINERS_LOSERS: 'TOP_GAINERS_LOSERS',
        INTRADAY_DATA: 'TIME_SERIES_INTRADAY',
        DAILY_DATA: 'TIME_SERIES_DAILY',
    };

    // Search for symbols/companies
    async searchSymbols(keywords) {
        const cacheKey = StockApiService.ENDPOINTS.SYMBOL_SEARCH;
        const params = { keywords };

        try {
            // Try to get from cache first
            const cachedData = await cacheService.get(cacheKey, params);
            if (cachedData) {
                return cachedData;
            }

            // Fetch from API if not in cache
            console.log('Fetching symbol search from API:', keywords);
            const data = await apiClient.get({
                function: 'SYMBOL_SEARCH',
                keywords: keywords
            });

            // Cache the result
            await cacheService.set(cacheKey, params, data);
            return data;
        } catch (error) {
            console.error('Error searching symbols:', error);

            // Try to return stale cache data if API fails
            const staleData = await this.getStaleCache(cacheKey, params);
            if (staleData) {
                console.warn('Returning stale cache data for symbol search');
                return staleData;
            }

            throw error;
        }
    }

    // Get company overview
    async getCompanyOverview(symbol) {
        const cacheKey = StockApiService.ENDPOINTS.COMPANY_OVERVIEW;
        const params = { symbol };

        try {
            // Try to get from cache first
            const cachedData = await cacheService.get(cacheKey, params);
            if (cachedData) {
                return cachedData;
            }

            // Fetch from API if not in cache
            console.log('Fetching company overview from API:', symbol);
            const data = await apiClient.get({
                function: 'OVERVIEW',
                symbol: symbol
            });

            // Cache the result
            await cacheService.set(cacheKey, params, data);
            return data;
        } catch (error) {
            console.error('Error fetching company overview:', error);

            // Try to return stale cache data if API fails
            const staleData = await this.getStaleCache(cacheKey, params);
            if (staleData) {
                console.warn('Returning stale cache data for company overview');
                return staleData;
            }

            throw error;
        }
    }

    // Get top gainers and losers
    async getTopGainersLosers() {
        const cacheKey = StockApiService.ENDPOINTS.TOP_GAINERS_LOSERS;
        const params = {}; // No parameters for this endpoint

        try {
            // Try to get from cache first
            const cachedData = await cacheService.get(cacheKey, params);
            if (cachedData) {
                return cachedData;
            }

            // Fetch from API if not in cache
            console.log('Fetching top gainers/losers from API');
            const data = await apiClient.get({
                function: 'TOP_GAINERS_LOSERS'
            });

            // Cache the result
            await cacheService.set(cacheKey, params, data);
            return data;
        } catch (error) {
            console.error('Error fetching top gainers/losers:', error);

            // Try to return stale cache data if API fails
            const staleData = await this.getStaleCache(cacheKey, params);
            if (staleData) {
                console.warn('Returning stale cache data for top gainers/losers');
                return staleData;
            }

            throw error;
        }
    }

    // Get intraday data for 1D chart
    async getIntradayData(symbol) {
        const cacheKey = StockApiService.ENDPOINTS.INTRADAY_DATA;
        const params = { symbol, interval: '5min' };

        try {
            // Try to get from cache first
            const cachedData = await cacheService.get(cacheKey, params);
            if (cachedData) {
                return cachedData;
            }

            // Use IBM for demo API key
            const chartSymbol = symbol === 'demo' ? 'IBM' : symbol;

            console.log('Fetching intraday data from API:', chartSymbol);
            const data = await apiClient.get({
                function: 'TIME_SERIES_INTRADAY',
                symbol: chartSymbol,
                interval: '5min'
            });

            const transformedData = this.transformIntradayData(data);

            // Cache the result
            await cacheService.set(cacheKey, params, transformedData);
            return transformedData;
        } catch (error) {
            console.error('Error fetching intraday data:', error);

            // Try to return stale cache data if API fails
            const staleData = await this.getStaleCache(cacheKey, params);
            if (staleData) {
                console.warn('Returning stale cache data for intraday data');
                return staleData;
            }

            throw error;
        }
    }

    // Get daily data for longer time ranges
    async getDailyData(symbol, range = '1M') {
        const cacheKey = StockApiService.ENDPOINTS.DAILY_DATA;
        const params = { symbol, range };

        try {
            // Try to get from cache first
            const cachedData = await cacheService.get(cacheKey, params);
            if (cachedData) {
                return cachedData;
            }

            // Use IBM for demo API key
            const chartSymbol = symbol === 'demo' ? 'IBM' : symbol;

            console.log('Fetching daily data from API:', chartSymbol, range);
            const data = await apiClient.get({
                function: 'TIME_SERIES_DAILY',
                symbol: chartSymbol,
                outputsize: 'full'
            });

            const transformedData = this.transformDailyData(data, range);

            // Cache the result
            await cacheService.set(cacheKey, params, transformedData);
            return transformedData;
        } catch (error) {
            console.error('Error fetching daily data:', error);

            // Try to return stale cache data if API fails
            const staleData = await this.getStaleCache(cacheKey, params);
            if (staleData) {
                console.warn('Returning stale cache data for daily data');
                return staleData;
            }

            throw error;
        }
    }

    // Transform intraday API response to chart format
    transformIntradayData(apiResponse) {
        const timeSeries = apiResponse['Time Series (5min)'];
        if (!timeSeries) {
            console.warn('No intraday time series data found');
            return [];
        }

        const entries = Object.entries(timeSeries);

        // Sort by time ascending and take last 78 data points (6.5 hours of trading)
        const sortedEntries = entries
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .slice(-78);

        return sortedEntries.map(([time, values]) => {
            const timeOnly = time.split(' ')[1]; // Extract HH:MM from "YYYY-MM-DD HH:MM:SS"
            return {
                x: timeOnly,
                y: parseFloat(values['4. close']) || 0,
                timestamp: time
            };
        });
    }

    // Transform daily API response to chart format
    transformDailyData(apiResponse, range) {
        const timeSeries = apiResponse['Time Series (Daily)'];
        if (!timeSeries) {
            console.warn('No daily time series data found');
            return [];
        }

        const entries = Object.entries(timeSeries);

        // Sort by date ascending
        const sortedEntries = entries.sort(([a], [b]) => new Date(a) - new Date(b));

        // Filter by range
        let filteredEntries = sortedEntries;
        const rangeDays = this.getRangeDays(range);

        if (rangeDays > 0) {
            filteredEntries = sortedEntries.slice(-rangeDays);
        }

        return filteredEntries.map(([date, values]) => ({
            x: this.formatDateForChart(date, range),
            y: parseFloat(values['4. close']) || 0,
            date: date
        }));
    }

    // Get number of days for each range
    getRangeDays(range) {
        switch (range) {
            case '1W': return 7;
            case '1M': return 22; // ~22 trading days in a month
            case '3M': return 66; // ~66 trading days in 3 months
            case '1Y': return 252; // ~252 trading days in a year
            default: return 22;
        }
    }

    // Format date for chart display based on range
    formatDateForChart(dateString, range) {
        const date = new Date(dateString);

        switch (range) {
            case '1W':
            case '1M':
                // Show month/day for shorter ranges
                return `${date.getMonth() + 1}/${date.getDate()}`;
            case '3M':
            case '1Y':
                // Show month/year for longer ranges
                return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`;
            default:
                return `${date.getMonth() + 1}/${date.getDate()}`;
        }
    }

    // Helper method to get stale cache data when API fails
    async getStaleCache(endpoint, params) {
        try {
            const cacheKey = cacheService.generateCacheKey(endpoint, params);
            const cachedData = await AsyncStorage.getItem(cacheKey);

            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                return parsedData.data; // Return data even if expired
            }

            return null;
        } catch (error) {
            console.error('Error getting stale cache:', error);
            return null;
        }
    }

    // Transform API data to our format
    transformStockData(apiStock, id) {
        return {
            id: id,
            ticker: apiStock.ticker,
            price: apiStock.price,
            change_amount: apiStock.change_amount,
            change_percentage: apiStock.change_percentage,
            volume: apiStock.volume,
            color: this.getRandomColor(),
        };
    }

    // Get random color for stock icons
    getRandomColor() {
        const colors = [
            '#007AFF', '#34c759', '#ff3b30', '#ff9500',
            '#5856d6', '#af52de', '#ff2d92', '#64d2ff',
            '#5ac8fa', '#30b0c7', '#32d74b', '#ffcc02'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Transform API response to our app format
    transformTopGainersLosers(apiResponse) {
        const topGainers = apiResponse.top_gainers?.map((stock, index) =>
            this.transformStockData(stock, index + 1)
        ) || [];

        const topLosers = apiResponse.top_losers?.map((stock, index) =>
            this.transformStockData(stock, index + 100)
        ) || [];

        return {
            topGainers,
            topLosers
        };
    }

    // Cache management methods

    /**
     * Clear cache for a specific endpoint
     */
    async clearEndpointCache(endpoint) {
        try {
            await cacheService.clearEndpointCache(endpoint);
            console.log(`Cleared cache for endpoint: ${endpoint}`);
        } catch (error) {
            console.error('Error clearing endpoint cache:', error);
        }
    }

    /**
     * Clear all API cache
     */
    async clearAllCache() {
        try {
            await cacheService.clearAllCache();
            console.log('Cleared all API cache');
        } catch (error) {
            console.error('Error clearing all cache:', error);
        }
    }

    /**
     * Get cache statistics
     */
    async getCacheStats() {
        try {
            return await cacheService.getCacheStats();
        } catch (error) {
            console.error('Error getting cache stats:', error);
            return { totalEntries: 0, maxSize: 0, endpoints: {} };
        }
    }

    /**
     * Remove expired cache entries
     */
    async cleanExpiredCache() {
        try {
            const removedCount = await cacheService.removeExpiredCache();
            console.log(`Cleaned ${removedCount} expired cache entries`);
            return removedCount;
        } catch (error) {
            console.error('Error cleaning expired cache:', error);
            return 0;
        }
    }

    /**
     * Refresh cache for top gainers/losers (force API call)
     */
    async refreshTopGainersLosers() {
        try {
            // Clear existing cache
            await this.clearEndpointCache(StockApiService.ENDPOINTS.TOP_GAINERS_LOSERS);

            // Fetch fresh data
            return await this.getTopGainersLosers();
        } catch (error) {
            console.error('Error refreshing top gainers/losers:', error);
            throw error;
        }
    }

    /**
     * Refresh cache for company overview (force API call)
     */
    async refreshCompanyOverview(symbol) {
        try {
            // Clear existing cache for this symbol
            await cacheService.remove(StockApiService.ENDPOINTS.COMPANY_OVERVIEW, { symbol });

            // Fetch fresh data
            return await this.getCompanyOverview(symbol);
        } catch (error) {
            console.error('Error refreshing company overview:', error);
            throw error;
        }
    }

    /**
     * Refresh cache for intraday chart data (force API call)
     */
    async refreshIntradayData(symbol) {
        try {
            // Clear existing cache for this symbol
            await cacheService.remove(StockApiService.ENDPOINTS.INTRADAY_DATA, { symbol, interval: '5min' });

            // Fetch fresh data
            return await this.getIntradayData(symbol);
        } catch (error) {
            console.error('Error refreshing intraday data:', error);
            throw error;
        }
    }

    /**
     * Refresh cache for daily chart data (force API call)
     */
    async refreshDailyData(symbol, range) {
        try {
            // Clear existing cache for this symbol and range
            await cacheService.remove(StockApiService.ENDPOINTS.DAILY_DATA, { symbol, range });

            // Fetch fresh data
            return await this.getDailyData(symbol, range);
        } catch (error) {
            console.error('Error refreshing daily data:', error);
            throw error;
        }
    }
}

const stockApiService = new StockApiService();
export default stockApiService;

