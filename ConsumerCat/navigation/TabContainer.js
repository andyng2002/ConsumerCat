import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import InventoryScreen from '../screens/InventoryScreen';
import WeeklyReportScreen from '../screens/WeeklyReportScreen';
import ScannerScreen from '../screens/ScannerScreen';

const Tab = createBottomTabNavigator();

export default function TabContainer() {
    return (
        <Tab.Navigator initialRouteName='Inventory'>

            <Tab.Screen
                name="WeeklyReport"
                component={WeeklyReportScreen}
                options={{title: "WeeklyReport",
                headerShown: false, gestureEnabled: false}}
            />

            <Tab.Screen 
                name="Inventory" 
                component={InventoryScreen}
                options={{title: "Inventory",
                headerShown: false, gestureEnabled: false}}
            />

            <Tab.Screen 
                name="Scanner" 
                component={ScannerScreen}
                options={{title: "Scanner",
                headerShown: false, gestureEnabled: false}}
            />

        </Tab.Navigator>
    );
};