import React, { useState, useContext } from 'react';
import { Alert, View, Text, StyleSheet, Button, TouchableOpacity, TextInput } from 'react-native';
import { styles } from '../Styles';
import Item from '../components/Item';
import { ItemContext } from '../hooks/ItemContext';

const InventoryScreen = () => {
    const { item, setItem, itemList, handleAddItem } = useContext(ItemContext)

    return (
        <View style={inv_styles.container}>
            <Text style={inv_styles.hello_text}>Hello!</Text>
            <Text style={styles.header}>Your Inventory</Text>
            <View style={styles.horizontal_line} />
            {
                itemList.map((item, index) => {
                    return (
                        <Item text={item.text} quantity={item.quantity} key={index}/>
                    )
                })
            }
            <TextInput
                placeholder='Food'
                value={item}
                onChangeText={ item => setItem({
                    text: item, 
                    quantity: 1,
                    daysSincePurchase: 2,
                    daysLeft: 3,
                })}
            />
            <TouchableOpacity onPress={() => handleAddItem()}>
                <Text>Add Item</Text>
            </TouchableOpacity>
        </View>
    );
}

 
// styles specific to Inventory Screen
const inv_styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'left',
        justifyContent: 'top',
        backgroundColor: '#E3FDE0',
        paddingTop: 80,
        padding: 20,
    },

    hello_text: {
        fontSize: 22,
        fontWeight: "bold",
        marginHorizontal: 5
        
    }
});

export default InventoryScreen;