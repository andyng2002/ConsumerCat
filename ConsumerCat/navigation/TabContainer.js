import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import InventoryScreen from '../screens/InventoryScreen';
import WeeklyReportScreen from '../screens/WeeklyReportScreen';
import ScannerScreen from '../screens/ScannerScreen';
import { Entypo } from '@expo/vector-icons'; 
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { ItemContext } from '../hooks/ItemContext';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const InventoryStack = createStackNavigator();

const InventoryStackScreen = () => (
    <InventoryStack.Navigator>
      <InventoryStack.Screen 
        name="Inventory" 
        component={InventoryScreen} 
        options={{ headerShown: false }}
      />
      <InventoryStack.Screen 
        name="ItemDetail" 
        component={ItemDetailScreen} 
        options={{ headerShown: false }}
      />
    </InventoryStack.Navigator>
  );

export default function TabContainer() {
    const [item, setItem] = useState();
    const [itemList, setItemList] = useState([]);

    const handleAddItem = () => {
        if (item) {
          setItemList([...itemList, item]);
        } else {
          console.warn("Item text should not be empty");
        }
      }      

    // const deleteItem = (index) => {
    //     let itemsCopy = [...itemList];
    //     itemsCopy.splice(index, 1);
    //     setItemList(itemsCopy)
    //   }

    return (
        <ItemContext.Provider value={{item, setItem, itemList, handleAddItem}}>
        <Tab.Navigator 
            initialRouteName='Inventory'
            screenOptions={({ route }) => ({
                tabBarActiveTintColor:'#3F6C51',
                tabBarIcon: ({ focused }) => {
                    c = focused ? '#3F6C51' : 'gray'
                    if (route.name === "WeeklyReport") {
                        return <Entypo name={'bar-graph'} size={24} color={c}/>
                    } else if (route.name === "Inventory") {
                        return <MaterialIcons name="food-bank" size={24} color={c} />
                    } else if (route.name === "Scanner") {
                        return <MaterialCommunityIcons name="barcode" size={24} color={c} />
                    }
                }
            })}
        >

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
        </ItemContext.Provider>
    );
};