import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserPreferencesContext } from '../context/UserPreferences';
import TabNavigator from './TabNavigator';
import TopGainersScreen from '../screens/TopGainersScreen';
import TopLosersScreen from '../screens/TopLosersScreen';
import StockDetailsScreen from '../screens/StockDetailsScreen';
import WatchlistDetailScreen from '../screens/WatchlistDetailScreen';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
    const { theme } = useContext(UserPreferencesContext);

    const headerStyle = {
        backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff',
    };

    const headerTitleStyle = {
        color: theme === 'dark' ? '#fff' : '#000',
    };

    return (
        <Stack.Navigator initialRouteName='Home' screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={TabNavigator} />
            <Stack.Screen
                name="TopGainers"
                component={TopGainersScreen}
                options={{
                    headerShown: true,
                    headerStyle,
                    headerTitleStyle,
                    headerTintColor: theme === 'dark' ? '#fff' : '#000',
                    title: 'Top Gainers',
                }}
            />
            <Stack.Screen
                name="TopLosers"
                component={TopLosersScreen}
                options={{
                    headerShown: true,
                    headerStyle,
                    headerTitleStyle,
                    headerTintColor: theme === 'dark' ? '#fff' : '#000',
                    title: 'Top Losers',
                }}
            />
            <Stack.Screen
                name="StockDetails"
                component={StockDetailsScreen}
                options={{
                    headerShown: true,
                    headerStyle,
                    headerTitleStyle,
                    headerTintColor: theme === 'dark' ? '#fff' : '#000',
                    title: 'Details Screen',
                }}
            />
            <Stack.Screen
                name="WatchlistDetail"
                component={WatchlistDetailScreen}
                options={{
                    headerShown: true,
                    headerStyle,
                    headerTitleStyle,
                    headerTintColor: theme === 'dark' ? '#fff' : '#000',
                    title: 'Watchlist',
                }}
            />
        </Stack.Navigator>
    );
};

export default StackNavigator;
