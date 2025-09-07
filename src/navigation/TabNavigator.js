import React, { useContext } from 'react';
import { UserPreferencesContext } from '../context/UserPreferences';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ExploreIcon from '../../assets/TabNavigatorIcons/ExploreIcon';
import CategoriesIcon from '../../assets/TabNavigatorIcons/WatchListIcon';

import ExploreScreen from '../screens/ExploreScreen';
import WatchListScreen from '../screens/WatchListScreen';

const Tabs = createBottomTabNavigator();

const TabNavigator = () => {
    const { theme } = useContext(UserPreferencesContext);

    const activeColor = "#007AFF";
    const inactiveColor = "#ADADAD";

    const isDark = theme === 'dark';

    const tabBarStyle = {
        backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
        borderTopColor: isDark ? '#2c2c2e' : '#cccccc',
    };

    const headerStyle = {
        backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
    };

    const headerTitleStyle = {
        color: isDark ? '#f2f2f7' : '#000000',
    };

    return (
        <Tabs.Navigator
            initialRouteName='ExploreTab'
            screenOptions={{
                tabBarActiveTintColor: activeColor,
                tabBarInactiveTintColor: inactiveColor,
                tabBarStyle,
                headerStyle,
                headerTitleStyle,
            }}
        >
            <Tabs.Screen
                name="ExploreTab"
                component={ExploreScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <ExploreIcon fillColor={focused ? activeColor : inactiveColor} />
                    ),
                    headerTitleAlign: "center",
                    title: "Explore",
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="WatchlistTab"
                component={WatchListScreen}
                options={{
                    title: 'Watchlist',
                    headerTitleAlign: 'center',
                    tabBarIcon: ({ focused }) => (
                        <CategoriesIcon fillColor={focused ? activeColor : inactiveColor} />
                    ),
                }}
            />
        </Tabs.Navigator>
    );
};

export default TabNavigator;
