import stockApiService from './api';
import cacheService from './CacheService';

class AppInitializationService {
    static async initialize() {
        console.log('Initializing app services...');

        try {
            // Clean expired cache on app startup
            await this.cleanupCache();

            // Log cache statistics
            await this.logCacheStats();

            console.log('App initialization completed');
        } catch (error) {
            console.error('Error during app initialization:', error);
        }
    }

    static async cleanupCache() {
        try {
            const removedCount = await stockApiService.cleanExpiredCache();
            if (removedCount > 0) {
                console.log(`Startup cleanup: removed ${removedCount} expired cache entries`);
            }
        } catch (error) {
            console.error('Error during startup cache cleanup:', error);
        }
    }

    static async logCacheStats() {
        try {
            const stats = await stockApiService.getCacheStats();
            console.log('Cache Statistics:', {
                totalEntries: stats.totalEntries,
                maxSize: stats.maxSize,
                usage: `${Math.round((stats.totalEntries / stats.maxSize) * 100)}%`,
                endpoints: stats.endpoints,
            });
        } catch (error) {
            console.error('Error getting cache stats:', error);
        }
    }

    static async handleAppBackground() {
        try {
            // Perform cache cleanup when app goes to background
            await this.cleanupCache();
            console.log('Background cache cleanup completed');
        } catch (error) {
            console.error('Error during background cache cleanup:', error);
        }
    }

    static async handleAppForeground() {
        try {
            // Clean expired cache when app comes to foreground
            await this.cleanupCache();
            console.log('Foreground cache cleanup completed');
        } catch (error) {
            console.error('Error during foreground cache cleanup:', error);
        }
    }

    static async resetAllData() {
        try {
            await stockApiService.clearAllCache();
            console.log('All app data reset');
        } catch (error) {
            console.error('Error resetting app data:', error);
        }
    }
}

export default AppInitializationService;
