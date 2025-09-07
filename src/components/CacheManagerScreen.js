import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    RefreshControl,
} from 'react-native';
import stockApiService from '../services/api';
import cacheService from '../services/CacheService';

const CacheManagerScreen = ({ theme = 'light' }) => {
    const [cacheStats, setCacheStats] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const styles = getStyles(theme);

    useEffect(() => {
        loadCacheStats();
    }, []);

    const loadCacheStats = async () => {
        try {
            const stats = await stockApiService.getCacheStats();
            setCacheStats(stats);
        } catch (error) {
            console.error('Error loading cache stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadCacheStats();
        setRefreshing(false);
    };

    const clearAllCache = () => {
        Alert.alert(
            'Clear All Cache',
            'Are you sure you want to clear all cached data? This will force fresh API calls for all requests.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await stockApiService.clearAllCache();
                            await loadCacheStats();
                            Alert.alert('Success', 'All cache data cleared');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear cache');
                        }
                    },
                },
            ]
        );
    };

    const clearExpiredCache = async () => {
        try {
            const removedCount = await stockApiService.cleanExpiredCache();
            await loadCacheStats();
            Alert.alert('Success', `Removed ${removedCount} expired cache entries`);
        } catch (error) {
            Alert.alert('Error', 'Failed to clean expired cache');
        }
    };

    const clearEndpointCache = (endpoint) => {
        Alert.alert(
            'Clear Endpoint Cache',
            `Clear all cached data for ${endpoint}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await stockApiService.clearEndpointCache(endpoint);
                            await loadCacheStats();
                            Alert.alert('Success', `Cleared cache for ${endpoint}`);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear endpoint cache');
                        }
                    },
                },
            ]
        );
    };

    const refreshData = async (type) => {
        try {
            switch (type) {
                case 'topGainers':
                    await stockApiService.refreshTopGainersLosers();
                    Alert.alert('Success', 'Refreshed top gainers/losers data');
                    break;
                default:
                    Alert.alert('Info', 'Refresh functionality not implemented for this data type');
            }
            await loadCacheStats();
        } catch (error) {
            Alert.alert('Error', 'Failed to refresh data');
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading cache stats...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
        >
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cache Statistics</Text>
                {cacheStats && (
                    <View>
                        <Text style={styles.statText}>
                            Total Entries: {cacheStats.totalEntries}/{cacheStats.maxSize}
                        </Text>
                        <Text style={styles.statText}>
                            Usage: {Math.round((cacheStats.totalEntries / cacheStats.maxSize) * 100)}%
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cache by Endpoint</Text>
                {cacheStats?.endpoints && Object.keys(cacheStats.endpoints).length > 0 ? (
                    Object.entries(cacheStats.endpoints).map(([endpoint, count]) => (
                        <View key={endpoint} style={styles.endpointRow}>
                            <View style={styles.endpointInfo}>
                                <Text style={styles.endpointName}>{endpoint}</Text>
                                <Text style={styles.endpointCount}>{count} entries</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={() => clearEndpointCache(endpoint)}
                            >
                                <Text style={styles.clearButtonText}>Clear</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noDataText}>No cached data</Text>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cache Management</Text>

                <TouchableOpacity style={styles.actionButton} onPress={clearExpiredCache}>
                    <Text style={styles.actionButtonText}>Clean Expired Cache</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.refreshButton]}
                    onPress={() => refreshData('topGainers')}
                >
                    <Text style={styles.actionButtonText}>Refresh Top Gainers/Losers</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.dangerButton]}
                    onPress={clearAllCache}
                >
                    <Text style={styles.actionButtonText}>Clear All Cache</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cache Configuration</Text>
                <Text style={styles.configText}>• Top Gainers/Losers: 5 minutes</Text>
                <Text style={styles.configText}>• Company Overview: 1 hour</Text>
                <Text style={styles.configText}>• Symbol Search: 30 minutes</Text>
                <Text style={styles.configText}>• Max Cache Size: {cacheStats?.maxSize || 50} entries</Text>
            </View>
        </ScrollView>
    );
};

const getStyles = (theme) => {
    const isDark = theme === 'dark';

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#000000' : '#f8f9fa',
            padding: 16,
        },
        loadingText: {
            textAlign: 'center',
            marginTop: 50,
            fontSize: 16,
            color: isDark ? '#ffffff' : '#666666',
        },
        section: {
            backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            marginBottom: 12,
        },
        statText: {
            fontSize: 16,
            color: isDark ? '#a0a0a0' : '#666666',
            marginBottom: 4,
        },
        endpointRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#2c2c2e' : '#e5e5e7',
        },
        endpointInfo: {
            flex: 1,
        },
        endpointName: {
            fontSize: 14,
            fontWeight: '600',
            color: isDark ? '#ffffff' : '#000000',
        },
        endpointCount: {
            fontSize: 12,
            color: isDark ? '#a0a0a0' : '#666666',
            marginTop: 2,
        },
        clearButton: {
            backgroundColor: '#ff3b30',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
        },
        clearButtonText: {
            color: '#ffffff',
            fontSize: 12,
            fontWeight: '600',
        },
        noDataText: {
            textAlign: 'center',
            fontSize: 14,
            color: isDark ? '#a0a0a0' : '#666666',
            fontStyle: 'italic',
        },
        actionButton: {
            backgroundColor: '#007AFF',
            padding: 12,
            borderRadius: 8,
            marginBottom: 8,
            alignItems: 'center',
        },
        refreshButton: {
            backgroundColor: '#34c759',
        },
        dangerButton: {
            backgroundColor: '#ff3b30',
        },
        actionButtonText: {
            color: '#ffffff',
            fontSize: 16,
            fontWeight: '600',
        },
        configText: {
            fontSize: 14,
            color: isDark ? '#a0a0a0' : '#666666',
            marginBottom: 4,
        },
    });
};

export default CacheManagerScreen;
