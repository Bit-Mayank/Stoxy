import AsyncStorage from '@react-native-async-storage/async-storage';

class CacheService {
    constructor() {
        this.CACHE_PREFIX = '@stockapp_cache_';
        this.CACHE_INDEX_KEY = '@stockapp_cache_index';
        this.MAX_CACHE_SIZE = 50; // Maximum number of cached items

        // Cache duration configurations (in milliseconds)
        this.CACHE_DURATIONS = {
            // Top gainers/losers data changes frequently during market hours
            TOP_GAINERS_LOSERS: 5 * 60 * 1000, // 5 minutes

            // Company overview data is relatively static
            COMPANY_OVERVIEW: 60 * 60 * 1000, // 1 hour

            // Symbol search results can be cached for moderate time
            SYMBOL_SEARCH: 30 * 60 * 1000, // 30 minutes

            // Default cache duration for unknown endpoints
            DEFAULT: 15 * 60 * 1000, // 15 minutes
        };
    }

    /**
     * Generate cache key for a specific API call
     */
    generateCacheKey(endpoint, params = {}) {
        const paramString = Object.keys(params)
            .sort()
            .map(key => `${key}:${params[key]}`)
            .join('|');
        return `${this.CACHE_PREFIX}${endpoint}_${paramString}`;
    }

    /**
     * Get cache duration for a specific endpoint
     */
    getCacheDuration(endpoint) {
        return this.CACHE_DURATIONS[endpoint] || this.CACHE_DURATIONS.DEFAULT;
    }

    /**
     * Check if cached data is still valid
     */
    isCacheValid(cachedItem) {
        if (!cachedItem || !cachedItem.timestamp || !cachedItem.duration) {
            return false;
        }

        const now = Date.now();
        const expirationTime = cachedItem.timestamp + cachedItem.duration;
        return now < expirationTime;
    }

    /**
     * Get data from cache
     */
    async get(endpoint, params = {}) {
        try {
            const cacheKey = this.generateCacheKey(endpoint, params);
            const cachedData = await AsyncStorage.getItem(cacheKey);

            if (!cachedData) {
                return null;
            }

            const parsedData = JSON.parse(cachedData);

            if (this.isCacheValid(parsedData)) {
                console.log(`Cache HIT for ${endpoint}:`, params);
                return parsedData.data;
            } else {
                console.log(`Cache EXPIRED for ${endpoint}:`, params);
                // Remove expired cache
                await this.remove(endpoint, params);
                return null;
            }
        } catch (error) {
            console.error('Error reading from cache:', error);
            return null;
        }
    }

    /**
     * Store data in cache
     */
    async set(endpoint, params = {}, data) {
        try {
            const cacheKey = this.generateCacheKey(endpoint, params);
            const duration = this.getCacheDuration(endpoint);

            const cacheItem = {
                data: data,
                timestamp: Date.now(),
                duration: duration,
                endpoint: endpoint,
                params: params,
            };

            await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
            await this.updateCacheIndex(cacheKey, endpoint, params);

            console.log(`Cache SET for ${endpoint}:`, params, `(${duration / 1000 / 60} minutes)`);

            // Perform cleanup to maintain cache size
            await this.cleanupCache();

        } catch (error) {
            console.error('Error writing to cache:', error);
        }
    }

    /**
     * Remove specific cache entry
     */
    async remove(endpoint, params = {}) {
        try {
            const cacheKey = this.generateCacheKey(endpoint, params);
            await AsyncStorage.removeItem(cacheKey);
            await this.removeFromCacheIndex(cacheKey);
            console.log(`Cache REMOVED for ${endpoint}:`, params);
        } catch (error) {
            console.error('Error removing from cache:', error);
        }
    }

    /**
     * Update cache index to track all cached items
     */
    async updateCacheIndex(cacheKey, endpoint, params) {
        try {
            const indexData = await AsyncStorage.getItem(this.CACHE_INDEX_KEY);
            let index = indexData ? JSON.parse(indexData) : [];

            // Remove existing entry if it exists
            index = index.filter(item => item.cacheKey !== cacheKey);

            // Add new entry
            index.push({
                cacheKey,
                endpoint,
                params,
                createdAt: Date.now(),
            });

            await AsyncStorage.setItem(this.CACHE_INDEX_KEY, JSON.stringify(index));
        } catch (error) {
            console.error('Error updating cache index:', error);
        }
    }

    /**
     * Remove entry from cache index
     */
    async removeFromCacheIndex(cacheKey) {
        try {
            const indexData = await AsyncStorage.getItem(this.CACHE_INDEX_KEY);
            if (indexData) {
                let index = JSON.parse(indexData);
                index = index.filter(item => item.cacheKey !== cacheKey);
                await AsyncStorage.setItem(this.CACHE_INDEX_KEY, JSON.stringify(index));
            }
        } catch (error) {
            console.error('Error removing from cache index:', error);
        }
    }

    /**
     * Get cache index
     */
    async getCacheIndex() {
        try {
            const indexData = await AsyncStorage.getItem(this.CACHE_INDEX_KEY);
            return indexData ? JSON.parse(indexData) : [];
        } catch (error) {
            console.error('Error getting cache index:', error);
            return [];
        }
    }

    /**
     * Clean up old cache entries to maintain cache size
     */
    async cleanupCache() {
        try {
            const index = await this.getCacheIndex();

            if (index.length <= this.MAX_CACHE_SIZE) {
                return;
            }

            // Sort by creation time (oldest first)
            index.sort((a, b) => a.createdAt - b.createdAt);

            // Remove oldest entries
            const entriesToRemove = index.slice(0, index.length - this.MAX_CACHE_SIZE);

            for (const entry of entriesToRemove) {
                await AsyncStorage.removeItem(entry.cacheKey);
            }

            // Update index
            const newIndex = index.slice(index.length - this.MAX_CACHE_SIZE);
            await AsyncStorage.setItem(this.CACHE_INDEX_KEY, JSON.stringify(newIndex));

            console.log(`Cache cleanup: removed ${entriesToRemove.length} old entries`);
        } catch (error) {
            console.error('Error during cache cleanup:', error);
        }
    }

    /**
     * Clear all cache for a specific endpoint
     */
    async clearEndpointCache(endpoint) {
        try {
            const index = await this.getCacheIndex();
            const entriesToRemove = index.filter(item => item.endpoint === endpoint);

            for (const entry of entriesToRemove) {
                await AsyncStorage.removeItem(entry.cacheKey);
            }

            // Update index
            const newIndex = index.filter(item => item.endpoint !== endpoint);
            await AsyncStorage.setItem(this.CACHE_INDEX_KEY, JSON.stringify(newIndex));

            console.log(`Cleared ${entriesToRemove.length} cache entries for ${endpoint}`);
        } catch (error) {
            console.error('Error clearing endpoint cache:', error);
        }
    }

    /**
     * Clear all cache data
     */
    async clearAllCache() {
        try {
            const index = await this.getCacheIndex();

            for (const entry of index) {
                await AsyncStorage.removeItem(entry.cacheKey);
            }

            await AsyncStorage.removeItem(this.CACHE_INDEX_KEY);
            console.log(`Cleared all cache data (${index.length} entries)`);
        } catch (error) {
            console.error('Error clearing all cache:', error);
        }
    }

    /**
     * Get cache statistics
     */
    async getCacheStats() {
        try {
            const index = await this.getCacheIndex();
            const stats = {
                totalEntries: index.length,
                maxSize: this.MAX_CACHE_SIZE,
                endpoints: {},
            };

            // Group by endpoint
            index.forEach(entry => {
                if (!stats.endpoints[entry.endpoint]) {
                    stats.endpoints[entry.endpoint] = 0;
                }
                stats.endpoints[entry.endpoint]++;
            });

            return stats;
        } catch (error) {
            console.error('Error getting cache stats:', error);
            return { totalEntries: 0, maxSize: this.MAX_CACHE_SIZE, endpoints: {} };
        }
    }

    /**
     * Remove expired cache entries
     */
    async removeExpiredCache() {
        try {
            const index = await this.getCacheIndex();
            let removedCount = 0;

            for (const entry of index) {
                const cachedData = await AsyncStorage.getItem(entry.cacheKey);
                if (cachedData) {
                    const parsedData = JSON.parse(cachedData);
                    if (!this.isCacheValid(parsedData)) {
                        await AsyncStorage.removeItem(entry.cacheKey);
                        removedCount++;
                    }
                }
            }

            // Update index by removing expired entries
            const validEntries = [];
            for (const entry of index) {
                const cachedData = await AsyncStorage.getItem(entry.cacheKey);
                if (cachedData) {
                    validEntries.push(entry);
                }
            }

            await AsyncStorage.setItem(this.CACHE_INDEX_KEY, JSON.stringify(validEntries));

            if (removedCount > 0) {
                console.log(`Removed ${removedCount} expired cache entries`);
            }

            return removedCount;
        } catch (error) {
            console.error('Error removing expired cache:', error);
            return 0;
        }
    }
}

const cacheService = new CacheService();
export default cacheService;
