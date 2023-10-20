import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';

const Item = (props) => {
    
    return (
        <View style={styles.item}>
            <Image source={require('../assets/apple.png')} style={styles.image}/>
            <Text style={styles.quantity}>{props.quantity}</Text>
            <View>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}> {props.itemName} </Text>
                <Text style={{fontSize: 10, color: '#988E8E'}}> Last Bought: {props.daysSincePurchase} </Text>
            </View>
            <View style = {styles.daysLeft}>
                <Text style={{fontSize: 35, fontWeight: 'bold'}}> {props.daysLeft} </Text>
                <Text style={{fontSize: 9, }}> Days Left</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    item: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        width: '100%',
    },
    quantity: {
        backgroundColor: '#D9D9D9',
        padding: 6,
        margin: 7,
    },
    daysLeft: {
        backgroundColor: '#EB4242',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        borderRadius: 10,
        flexDirection: 'column',
        padding: 6,

    },
    image: {
        width: 60,
        height: 60,
    }
});

export default Item;