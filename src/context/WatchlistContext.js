import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WatchlistContext = createContext();

export const useWatchlist = () => {
    const context = useContext(WatchlistContext);
    if (!context) {
        throw new Error('useWatchlist must be used within a WatchlistProvider');
    }
    return context;
};

const WATCHLISTS_STORAGE_KEY = '@stockapp_watchlists';

export const WatchlistProvider = ({ children }) => {
    const [watchlists, setWatchlists] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load watchlists from storage on app start
    useEffect(() => {
        loadWatchlists();
    }, []);

    const loadWatchlists = async () => {
        try {
            const stored = await AsyncStorage.getItem(WATCHLISTS_STORAGE_KEY);
            if (stored) {
                const parsedWatchlists = JSON.parse(stored);
                setWatchlists(parsedWatchlists);
            } else {
                // Create default watchlists if none exist
                const defaultWatchlists = [
                    {
                        id: '1',
                        name: 'Watchlist 1',
                        stocks: [],
                        createdAt: new Date().toISOString(),
                    },
                    {
                        id: '2',
                        name: 'Watchlist 2',
                        stocks: [],
                        createdAt: new Date().toISOString(),
                    },
                ];
                setWatchlists(defaultWatchlists);
                await saveWatchlists(defaultWatchlists);
            }
        } catch (error) {
            console.error('Error loading watchlists:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveWatchlists = async (newWatchlists) => {
        try {
            await AsyncStorage.setItem(WATCHLISTS_STORAGE_KEY, JSON.stringify(newWatchlists));
        } catch (error) {
            console.error('Error saving watchlists:', error);
            throw error;
        }
    };

    const createWatchlist = async (name) => {
        try {
            const newWatchlist = {
                id: Date.now().toString(),
                name: name,
                stocks: [],
                createdAt: new Date().toISOString(),
            };

            const newWatchlists = [...watchlists, newWatchlist];
            setWatchlists(newWatchlists);
            await saveWatchlists(newWatchlists);
            return newWatchlist;
        } catch (error) {
            console.error('Error creating watchlist:', error);
            throw error;
        }
    };

    const deleteWatchlist = async (watchlistId) => {
        try {
            const newWatchlists = watchlists.filter(list => list.id !== watchlistId);
            setWatchlists(newWatchlists);
            await saveWatchlists(newWatchlists);
            return true;
        } catch (error) {
            console.error('Error deleting watchlist:', error);
            throw error;
        }
    };

    const renameWatchlist = async (watchlistId, newName) => {
        try {
            const newWatchlists = watchlists.map(list =>
                list.id === watchlistId ? { ...list, name: newName } : list
            );
            setWatchlists(newWatchlists);
            await saveWatchlists(newWatchlists);
            return true;
        } catch (error) {
            console.error('Error renaming watchlist:', error);
            throw error;
        }
    };

    const addStockToWatchlist = async (watchlistId, stock) => {
        try {
            const stockToAdd = {
                symbol: stock.symbol || stock.ticker,
                name: stock.name || stock.Name || stock.symbol,
                addedAt: new Date().toISOString(),
                price: stock.price || null,
                change: stock.change_amount || null,
                changePercent: stock.change_percentage || null,
            };

            const newWatchlists = watchlists.map(list => {
                if (list.id === watchlistId) {
                    // Check if stock already exists in this watchlist
                    const existingIndex = list.stocks.findIndex(s => s.symbol === stockToAdd.symbol);
                    if (existingIndex >= 0) {
                        // Update existing stock
                        const updatedStocks = [...list.stocks];
                        updatedStocks[existingIndex] = { ...updatedStocks[existingIndex], ...stockToAdd };
                        return { ...list, stocks: updatedStocks };
                    } else {
                        // Add new stock
                        return { ...list, stocks: [...list.stocks, stockToAdd] };
                    }
                }
                return list;
            });

            setWatchlists(newWatchlists);
            await saveWatchlists(newWatchlists);
            return true;
        } catch (error) {
            console.error('Error adding stock to watchlist:', error);
            throw error;
        }
    };

    const removeStockFromWatchlist = async (watchlistId, symbol) => {
        try {
            const newWatchlists = watchlists.map(list => {
                if (list.id === watchlistId) {
                    return {
                        ...list,
                        stocks: list.stocks.filter(stock => stock.symbol !== symbol)
                    };
                }
                return list;
            });

            setWatchlists(newWatchlists);
            await saveWatchlists(newWatchlists);
            return true;
        } catch (error) {
            console.error('Error removing stock from watchlist:', error);
            throw error;
        }
    };

    const getWatchlistById = (watchlistId) => {
        return watchlists.find(list => list.id === watchlistId);
    };

    const isStockInWatchlist = (watchlistId, symbol) => {
        const watchlist = getWatchlistById(watchlistId);
        return watchlist ? watchlist.stocks.some(stock => stock.symbol === symbol) : false;
    };

    const isStockInAnyWatchlist = (symbol) => {
        return watchlists.some(list =>
            list.stocks.some(stock => stock.symbol === symbol)
        );
    };

    const getWatchlistsWithStock = (symbol) => {
        return watchlists.filter(list =>
            list.stocks.some(stock => stock.symbol === symbol)
        );
    };

    const clearAllWatchlists = async () => {
        try {
            setWatchlists([]);
            await AsyncStorage.removeItem(WATCHLISTS_STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing watchlists:', error);
            throw error;
        }
    };

    // Legacy methods for backward compatibility
    const addToWatchlist = async (stock) => {
        // Add to first watchlist for backward compatibility
        if (watchlists.length > 0) {
            return await addStockToWatchlist(watchlists[0].id, stock);
        }
        return false;
    };

    const removeFromWatchlist = async (symbol) => {
        // Remove from all watchlists for backward compatibility
        const promises = watchlists.map(list =>
            removeStockFromWatchlist(list.id, symbol)
        );
        await Promise.all(promises);
        return true;
    };

    const isInWatchlist = (symbol) => {
        return isStockInAnyWatchlist(symbol);
    };

    const value = {
        // New multiple watchlist methods
        watchlists,
        loading,
        createWatchlist,
        deleteWatchlist,
        renameWatchlist,
        addStockToWatchlist,
        removeStockFromWatchlist,
        getWatchlistById,
        isStockInWatchlist,
        isStockInAnyWatchlist,
        getWatchlistsWithStock,
        clearAllWatchlists,

        // Legacy methods for backward compatibility
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        watchlist: watchlists, // Legacy property
        getWatchlistSymbols: () => {
            // Legacy method - return all symbols from all watchlists
            const allSymbols = new Set();
            watchlists.forEach(list => {
                list.stocks.forEach(stock => allSymbols.add(stock.symbol));
            });
            return Array.from(allSymbols);
        },
        clearWatchlist: clearAllWatchlists, // Legacy method
    };

    return (
        <WatchlistContext.Provider value={value}>
            {children}
        </WatchlistContext.Provider>
    );
};
