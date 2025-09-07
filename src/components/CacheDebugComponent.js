import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import stockApiService from '../services/api';

const CacheDebugComponent = () => {
    const [testResults, setTestResults] = useState('');

    const testCaching = async () => {
        try {
            setTestResults('Testing caching...\n');

            // Test 1: First API call (should hit API)
            console.log('=== Test 1: First API call ===');
            const start1 = Date.now();
            const data1 = await stockApiService.getTopGainersLosers();
            const end1 = Date.now();

            setTestResults(prev => prev + `First call: ${end1 - start1}ms\n`);

            // Test 2: Second API call immediately (should hit cache)
            console.log('=== Test 2: Second API call (immediate) ===');
            const start2 = Date.now();
            const data2 = await stockApiService.getTopGainersLosers();
            const end2 = Date.now();

            setTestResults(prev => prev + `Second call: ${end2 - start2}ms\n`);

            // Test 3: Get cache stats
            console.log('=== Test 3: Cache stats ===');
            const stats = await stockApiService.getCacheStats();
            setTestResults(prev => prev + `Cache entries: ${stats.totalEntries}\n`);

            Alert.alert('Cache Test Complete', 'Check console for detailed logs');

        } catch (error) {
            console.error('Cache test error:', error);
            setTestResults(prev => prev + `Error: ${error.message}\n`);
        }
    };

    const clearCache = async () => {
        try {
            await stockApiService.clearAllCache();
            setTestResults('Cache cleared\n');
            Alert.alert('Success', 'Cache cleared');
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cache Debug</Text>

            <TouchableOpacity style={styles.button} onPress={testCaching}>
                <Text style={styles.buttonText}>Test Caching</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearCache}>
                <Text style={styles.buttonText}>Clear Cache</Text>
            </TouchableOpacity>

            <Text style={styles.results}>{testResults}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f0f0f0',
        margin: 10,
        borderRadius: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    clearButton: {
        backgroundColor: '#ff3b30',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    results: {
        marginTop: 10,
        fontSize: 12,
        fontFamily: 'monospace',
        backgroundColor: '#ffffff',
        padding: 10,
        borderRadius: 4,
    },
});

export default CacheDebugComponent;
