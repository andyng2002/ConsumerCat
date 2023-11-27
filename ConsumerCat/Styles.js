import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'left',
        justifyContent: 'center',
        backgroundColor: '#E3FDE0',
        padding: 20,
    },
    
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#3F6C51",
        borderBottomColor: 'black',
        borderBottomWidth: 5, 
    },

    horizontal_line: {
        width: '100%',     // Set the width to 100% to span the whole screen
        height: 1,         // Set the height to the desired thickness of the line
        backgroundColor: '#3F6C51',
        marginBottom: 15
    },

    vertical_line: {
        height: '100%',
        width: 2,
        backgroundColor: '#AAAAAA'
    },

    hz_align_items: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginTop: 10
    },

    valign_items: {
        alignItems: 'center',
        justifyContent:'center'
    },

    input: {
        borderColor: 'white',
        backgroundColor: '#e3e3e3',
        borderWidth: 1,
        paddingLeft: 10,
        borderRadius: 5,
    },
    hiddenContainer: { 
        // flexDirection: 'row', 
        // justifyContent: 'flex-end', 
        // alignItems: 'center', 
        // backgroundColor: '#FFF', 
        // height: 80, 
        // borderRadius: 20, 
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 20,
        width: '100%',
    }, 
    hiddenButton: { 
        justifyContent: 'center', 
        alignItems: 'center', 
        width: 70, 
        height: 60,
    }, 
    deleteButton: { 
        backgroundColor: '#E74C3C',
        borderRadius: 20,
        marginLeft: 10
    }, 
    editButton: { 
        backgroundColor: 'gray',
        borderRadius: 20,
        marginLeft: 10
    }, 
    buttonText: { 
        color: '#FFF', 
        fontSize: 16, 
        fontWeight: 'bold', 
    }, 
})

export { styles }