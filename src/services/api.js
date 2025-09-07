import apiClient from "../network/AxiosConfig";
import cacheService from "./CacheService";
import AsyncStorage from '@react-native-async-storage/async-storage';

class StockApiService {
    // Cache endpoint constants
    static ENDPOINTS = {
        SYMBOL_SEARCH: 'SYMBOL_SEARCH',
        COMPANY_OVERVIEW: 'COMPANY_OVERVIEW',
        TOP_GAINERS_LOSERS: 'TOP_GAINERS_LOSERS',
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
}

const stockApiService = new StockApiService();
export default stockApiService;

