import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Svg, { G, Circle } from 'react-native-svg'
import { differenceInCalendarDays } from 'date-fns';

import { styles } from '../Styles';
import { auth, db } from '../firebaseConfig';

// creating graph: https://dev.to/franciscomendes10866/how-to-create-a-donut-chart-using-react-native-svg-30m9 

const WeeklyReportScreen = () => {
    const [ totalQuantity, setTotalQuantity ] = useState(0);
    const [ totalExpired, setTotalExpired ] = useState(0);
    const isFocused = useIsFocused();

    const graphRadius = 70;
    const graphCircumference = 2 * Math.PI * graphRadius;

    var percentage = totalQuantity === 0 ? 0 : Math.round(((totalQuantity - totalExpired)/totalQuantity) * 100);
    const strokeDashoffset = 
        graphCircumference - (graphCircumference * percentage) / 100;

    var cat_status = 'HAPPY';

    if (percentage > 50) {
        cat_status = 'HAPPY';
        imageSource = require(`../assets/HAPPY_CAT.jpeg`);
    } else {
        cat_status = 'SAD';
        imageSource = require(`../assets/SAD_CAT.jpeg`);
    }

    const fetchFoodReport = async () => {
        var inventoryTotal = 0;
        var expired = 0;

        try {
            const user = auth.currentUser;
            if (user) {
                const userDoc = await db.collection('users').doc(user.uid)
                .collection('items')
                .onSnapshot((snapshot) => {
                  const inventoryData = snapshot.docs.map((doc) => doc.data());
                  if (inventoryData) {
                    inventoryData.forEach(item => {
                        const expDateRaw = item.expirationDate.split('/');
                        const expDateFormatted = new Date(parseInt(expDateRaw[2], 10), parseInt(expDateRaw[0], 10) - 1, parseInt(expDateRaw[1], 10));
                        const daysLeft = differenceInCalendarDays(expDateFormatted, new Date())

                        inventoryTotal += parseInt(item.quantity);
                        if (daysLeft < 1) {
                            expired += parseInt(item.quantity);
                        }

                      }) 
                    setTotalQuantity(inventoryTotal);
                    setTotalExpired(expired);
                  } else {
                    setTotalQuantity(0);
                    setTotalExpired(0);
                  }
                });
            }
        } catch (error) {
            console.error('Error fetching inventory items:', error);
        }
      };

    // refreshes report data whenever user goes to Weekly Report Screen
    useEffect(() => {
        if (isFocused) {
            fetchFoodReport();
        }
    }, [isFocused])

    
    return (
        <View style={wkrp_styles.container}>
            <Text style={styles.header}>Weekly Report</Text>
            <View style={styles.horizontal_line} />
            <View style={wkrp_styles.status_block}>
                <View style={styles.valign_items}>
                    <View style={styles.valign_items}>
                        <Text style = {{fontSize: 20}}>Your cat is...</Text>
                        <Text style={{fontWeight: 'bold', fontSize: 50}}>{cat_status}</Text>
                        <Image source={imageSource} style={wkrp_styles.image}/>
                    </View>
                    <View style={wkrp_styles.graphWrapper}>
                        <Svg height='250' width='250' viewBox='0 0 180 180'>
                            <G rotation={-90} originX='90' originY='90'>
                                <Circle
                                    // how it becomes a donut
                                    cx={'50%'}
                                    cy={'50%'}
                                    r={graphRadius}
                                    stroke='#F1F6F9'
                                    fill='transparent'
                                    strokeWidth='25'
                                />
                                <Circle
                                    cx={'50%'}
                                    cy={'50%'}
                                    r={graphRadius}
                                    stroke='#9DE5F5'
                                    fill='transparent'
                                    strokeWidth='25'
                                    strokeDasharray={graphCircumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap='round'
                                />
                            </G>
                        </Svg>
                        <View style={[{position: 'absolute'}, styles.valign_items]}>
                            <Text style={wkrp_styles.graphPercentText}>{percentage}%</Text>
                            <Text style={wkrp_styles.graphSmallText}>of your food was</Text>
                            <Text style={wkrp_styles.graphSmallText}>NOT wasted</Text>
                            <Text style={wkrp_styles.graphSmallText}>this week</Text>
                        </View>
                    </View>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'top', justifyContent: 'space-evenly', paddingTop: 5}}>
                    <View style={{alignItems: 'center', marginVertical: 5}}>
                        <Text style={wkrp_styles.savingsText}>{totalQuantity-totalExpired}</Text>
                        <Text>items ready</Text>
                        <Text>to be consumed</Text>
                        {/* <Text>they expired</Text> */}
                    </View>
                    <View style={styles.vertical_line}></View>
                    <View style={{alignItems: 'center', marginVertical: 5}}>
                        <Text style={wkrp_styles.wastedText}>{totalExpired}</Text>
                        <Text>items wasted</Text>
                        <Text>due to expiration</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

// styles specific to Weekly Report Screen
const wkrp_styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'top',
        backgroundColor: '#E3FDE0',
        paddingTop: 60, 
        padding: 20,
    },
    viewImage: {
        maxWidth: '100%',
        maxHeight: '100%'
    },
    image: {
        width: 180,
        height: 180,
    },

    status_block: {
        width: 316,
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#000000',
        paddingVertical: 15
    },

    graphWrapper: {
        alignItems: 'center',
        justifyContent: 'center'
    },

    graphPercentText: {
        fontWeight: 'bold',
        fontSize: 28,
        color: '#75BE6F'
    },
    
    graphSmallText: {
        fontWeight: 'bold',
        fontSize: 10,
        color: '#75BE6F'
    },

    savingsText: {
        fontWeight: 'bold',
        fontSize: 32,
        color: '#75BE6F'
    }, 

    wastedText: {
        fontWeight: 'bold',
        fontSize: 32,
        color: '#EB4242'
    }, 
});

export default WeeklyReportScreen;