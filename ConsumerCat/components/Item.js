import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { format, differenceInCalendarDays} from 'date-fns';

const Item = (props) => {
    /*
    expiration countdown:
        when adding to inventory
            take in when it was bought (default to current date for now)
            go to product database and search for that product, get how many days it lasts from there and add it to 'bought' date to get expiration date
                (let's say that the item is for sure in product database)
            if doesn't exist in product database, default to one week 
        whenever we are fetching from inventory:
            calculate expiration date - current date, if negative or 0 return ! else just return days left
    */

    const expDateRaw = props.expirationDate.split('/');
    const expDateFormatted = new Date(parseInt(expDateRaw[2], 10), parseInt(expDateRaw[0], 10) - 1, parseInt(expDateRaw[1], 10));
    
    const daysLeft = parseInt(differenceInCalendarDays(expDateFormatted, new Date()));
    const daysLeftFormatted = daysLeft <= 0 ? 0 : daysLeft;

    const expirationStatus = daysLeft <= 0 ? '#EB4242' : daysLeft <= 7 ? '#FFCB46' : '#75BE6F';
    
    return (
        <View style={styles.item}>
            <Image source={require('../assets/apple.png')} style={styles.image}/>
            <Text style={styles.quantity}>{props.quantity}</Text>
            <View>
                <Text numberOfLines={2} ellipsizeMode='tail' style={{fontSize: 20, fontWeight: 'bold', width: 180}}>{props.itemName} </Text>
                <Text style={{fontSize: 10, color: '#988E8E'}}>Bought: {props.bought}</Text>
            </View>
            <View style = {[{backgroundColor: expirationStatus}, styles.daysLeft]}>
                <Text style={{fontSize: 32, fontWeight: 'bold'}}>{daysLeftFormatted}</Text>
                <Text style={{fontSize: 9, }}>Days Left</Text>
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
        marginBottom: 20,
        width: '100%',
        justifyContent: 'space-between'
    },
    quantity: {
        backgroundColor: '#D9D9D9',
        padding: 6,
        margin: 7,
    },
    daysLeft: {
        alignItems: 'center',
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