import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, Button, TouchableOpacity,TextInput, Image } from 'react-native';
import { styles } from '../Styles';
import { BarCodeScanner } from 'expo-barcode-scanner'
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import { auth } from '../firebaseConfig';

/*
resources: https://www.youtube.com/watch?v=LtbuOgoQJAg
*/

const ScannerScreen = () => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
          const { status } = await BarCodeScanner.requestPermissionsAsync();
          setHasPermission(status === 'granted');
        };

        getBarCodeScannerPermissions();
    }, []);
    
    const checkForInventoryDuplicate = (scannedUPC) => {
        // TO-DO: change collection we are cross checking with to the user's inventory db
        const productsRef = db.collection('productDatabase');
        productsRef.where('UPC', '==', scannedUPC).get()
            .then((result) => {
                if(!result.empty) {
                    Alert.alert('Duplicate Item', 'Already have this item in your inventory!', [{text: 'Add anyway'}, {text: `Don't add`}])
                }
            })
            .catch((error) => {
                console.error('Error querying Firestore:', error);
            });
    }

    // change code to this to be able to add scanned items to inventory
    // data var has upc num 
    const handleBarCodeScanned = ({type, data}) => {
        setScanned(true)
        // checkForInventoryDuplicate(data); // maybe only use this method if user is trying to add it to inventory
        navigation.navigate('ItemDetail', { upc: data });
    }

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <Text>Requesting for camera permisson</Text>
            </View>
        )
    }
    
    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text>No access to camera</Text> 
                <Button title={'Allow Camera'} onPress={() => getBarCodeScannerPermissions()}/>
            </View>
        )
    }

    return (
        <View style={brcd_styles.container}>
            <TouchableOpacity style={brcd_styles.scanBox}>
                <Ionicons name='ios-scan-outline' size={400} color='white' />
            </TouchableOpacity>
            <BarCodeScanner
                onBarCodeScanned={ scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />
            {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
        </View>
    );
};


// styles specific to Barcode Scanner Screen
const brcd_styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E3FDE0',
        padding: 20,
    },

    barcodebox: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },

    scanBox: {
        position: 'relative',
        zIndex: 1,
    }
});

export default ScannerScreen;