import React, { Component, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text, FlatList, TouchableOpacity, Button, StatusBar } from 'react-native';
import CalendarPickerModal from 'react-native-calendar-picker';
//import { SafeAreaView } from "react-native-safe-area-context";
import { withSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from "moment";


const CitasAgendadas = (props) => {


    const { citas, login1, fecha, onPress } = props;


    // const [userData, setUserData] = React.useState([]);
    // const getData = async (keyname) => {
    //     try {
    //         const value = await AsyncStorage.getItem(keyname)
    //         if (value !== null) {
    //             // value previously stored
    //             setUserData(JSON.parse(value));
    //         }
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }

    // useEffect(() => {
    //     getData('@userData');
    // }, [])

    // ----------------Consumir API tabla Usuario Pacientes-----------------
    const [apidataPaciente, apisetDataPaciente] = useState([]);

    useEffect(() => {
        fetchData('https://consultaterd.azurewebsites.net/api/UsuarioPacientes');
    }, [])


    const fetchData = async (url) => {
        try {
            const response = await fetch(url);
            const json = await response.json();
            apisetDataPaciente(json);
            // console.log(json);

        } catch (error) {
            console.error(error);
        }
    };

    const [apidataCentros, apisetDataCentros] = useState([]);

    // ----------------Consumir API tabla Centro Medico-----------------
    useEffect(() => {
        fetchDataCentros('https://consultaterd.azurewebsites.net/api/CentroMedico');
    }, [])

    const fetchDataCentros = async (url) => {
        try {
            const response = await fetch(url);
            const json = await response.json();
            const newarray = json.map((item) => {
                return { key: item.centroMedicoId, value: item.centroMedicoNombre }
            })
            apisetDataCentros(newarray);

        } catch (error) {
            console.error(error);
        }
    };

    // ----------------Consumir API tabla Usuario Doctores-----------------
    const [apidataDoctores, apisetDoctores] = useState([]);

    useEffect(() => {
        fetchDataDoctores('https://consultaterd.azurewebsites.net/api/UsuarioDoctores');
    }, [])

    const fetchDataDoctores = async (url) => {
        try {
            const response = await fetch(url);
            const json = await response.json();
            apisetDoctores(json);

        } catch (error) {
            console.error(error);
        }
    };

    //Funcion get estado de la cita
    const getEstadoCita = (item) => {
        let fechaactual = moment().format("YYYY-MM-DD HH:mm"); // Fecha Actual
        const citafecha1 = item.citaFecha //Fecha de la Cita
        //Convertir cita fecha en el formato de la fecha actual
        let fechacita = citafecha1.toString().substring(6) + "-" + citafecha1.toString().substring(3, 5) + "-" + citafecha1.toString().substring(0, 2);
        //Concatenar la fecha con la hora inicial de la cita
        let fechafinal = fechacita + "T" + item.citasHoraInicio
        //Validar si la fecha actual es despues de la fecha de la cita
        let validfecha = moment(fechaactual).parseZone().isSameOrAfter(fechafinal);


        // Si está después es que la cita se hizo y el doctor puede finalizarla
        if (validfecha == true) {
            return true
        }
        else
            return false
    }


    return (

        <ScrollView style={{ backgroundColor: '#68CCC0', height: "100%" }} >
            {
                citas.map((item, index) => {
                    return (
                        <View>
                            {getEstadoCita(item) == true
                                ? <View>
                                    <Text>Ahora</Text>
                                </View>
                                : null}
                            <TouchableOpacity key={item.citaId} style={styles.listView} onPress={() => onPress({ item, login1, livebuttoncita: getEstadoCita(item) })} >
                                <View style={styles.listViewContent}>
                                    <View style={styles.listTextView}>
                                        <View style={{ borderBottomWidth: 1, flexDirection: 'row', justifyContent: "space-around", marginBottom: 10, borderColor: 'rgba(0, 0, 0, 0.25)' }}>
                                            <Text style={{ color: "black", marginBottom: 10, fontWeight: "bold" }} >{item.citasHoraInicio} - {item.citaHoraCierre}</Text>
                                            <Text style={{ color: "black", marginBottom: 10, fontWeight: "bold" }} >{item.citaFecha}</Text>
                                        </View>
                                        {login1 == true
                                            ? <Text style={{ color: "black", marginBottom: 10 }}>{apidataDoctores.filter(x => x.doctorId == item.doctorId).map(y => { return y.nombreDoctor + " " + y.apellidoDoctor })}</Text>

                                            : <Text style={{ color: "black", marginBottom: 10 }}>{apidataPaciente.filter(x => x.pacienteId == item.pacienteId).map(y => { return y.nombrePaciente + " " + y.apellidoPaciente })}</Text>
                                        }

                                        <Text>{apidataCentros.filter(x => x.key == item.centroMedicoId).map(y => { return y.value })}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )
                })
            }
        </ScrollView>

    );
};

export default CitasAgendadas;

const styles = StyleSheet.create({

    listView: {
        marginHorizontal: 25,
        marginTop: 15,
        backgroundColor: "white",
        borderRadius: 15,
        shadowColor: '#171717',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 2

    },

    listViewContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 30,
        marginVertical: 15,

    },

    listTextView: {
        justifyContent: "center",
        width: "100%",
    }
});
