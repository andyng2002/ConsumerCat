import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { format } from 'date-fns';

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

    /*
    PRINCESS TO-DO
    daysLeft: props.expirationDate - currentDate
    */
    // const expirationDate = props.expirationDate.split("/");

    // subDays(date, x) --> subtract x days from date
    const bought = format(new Date(new Date().setDate(new Date().getDate()-10)), 'MM/dd/yyyy');
    // const daysLeft = differenceInDays()
    // var boughtDateFormatted = newDate(parseInt(boughtDate[2], 10), parseInt(boughtDate[1], 10) - 1, parseInt(boughtDate[0], 10));
    return (
        <View style={styles.item}>
            <Image source={require('../assets/apple.png')} style={styles.image}/>
            <Text style={styles.quantity}>{props.quantity}</Text>
            <View>
                <Text numberOfLines={2} ellipsizeMode='tail' style={{fontSize: 20, fontWeight: 'bold', width: 180}}>{props.itemName} </Text>
                <Text style={{fontSize: 10, color: '#988E8E'}}>Bought: {bought}</Text>
            </View>
            <View style = {styles.daysLeft}>
                <Text style={{fontSize: 35, fontWeight: 'bold'}}> {props.daysLeft} </Text>
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
        backgroundColor: '#EB4242',
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