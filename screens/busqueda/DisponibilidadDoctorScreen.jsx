import React, { Component, useState, useEffect } from "react";
import { StyleSheet, Button, Text, View, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import CalendarPickerModal from 'react-native-calendar-picker';
import AppNavigator from '../../navigator/Navigator';
import HorariosDoctors from "../../API/HorariosDoctors";
import GestionCita_Get from "../../API/GestionCita_Get";
import moment from "moment";

const DisponibilidadDoctorScreen = ({ navigation, route }) => {

    //Id del doctor (Disponibilidad del doctor en cuestion)
    const { doctorId, intervaloCitas } = route.params;

    //-------------Consumir API tabla HorariosDoctors--------------------
    const [apidataHorarios, apisetDataHorarios] = useState([]);
    // Mientras la api viene
    useEffect(() => {
        fetchDataEspecialidad(HorariosDoctors);
    }, [])

    const fetchDataEspecialidad = (table) => {
        try {
            const newarray = table.filter(item => item.doctorId == doctorId);
            apisetDataHorarios(newarray);

        } catch (error) {
            console.error(error);
        }
    }

    //-------------Consumir API tabla GestionCitas--------------------
    const [apidataCitas, apisetDataCitas] = useState([]);
    // Mientras la api viene
    useEffect(() => {
        fetchDataCita(GestionCita_Get);
    }, [])

    const fetchDataCita = (table) => {
        try {
            const newarray = table.filter(item => item.doctorId == doctorId);
            apisetDataCitas(newarray);
        } catch (error) {
            console.error(error);
        }
    }

    //Calendario
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);

    const dia = [
        { key: 1, dia: "Mon" },
        { key: 2, dia: "Tue" },
        { key: 3, dia: "Wed" },
        { key: 4, dia: "Thu" },
        { key: 5, dia: "Fri" },
        { key: 6, dia: "Sat" },
        { key: 7, dia: "Sun" }]

    const [horas, sethoras] = useState([])

    //Al seleccionar cambia la disponibilidad
    const onDateChange = (date, type) => {
        if (type === 'END_DATE') {
            setSelectedEndDate(date);
        } else {
            setSelectedEndDate(null);
            setSelectedStartDate(date);
        }
        setdisableButton(true);
        const selectedDay = date.toString().substring(0, 3); //Dia
        const arrayDia = dia.find(x => x.dia == selectedDay).key; //Dia ID
        const horarioDia = apidataHorarios.filter(x => x.diaId == arrayDia); //Horario de ese dia

        const array = [];
        sethoras(array);
        if (horarioDia.length > 0) {

            const horain = horarioDia.map(x => { return x.horaInicio }).toString() //Hora inicial del dia
            const horafin = horarioDia.map(x => { return x.horaCierre }).toString() //Hora final del dia

            var ah = "2020-01-04T" + horain + ":00.000Z";
            var bh = "2020-01-04T" + horafin + ":00.000Z";
            var a = new moment(ah);
            var b = new moment(bh);
            var diff = moment.duration(b.diff(a));
            var ds = diff.asMinutes() / 30

            var lee = horain;
            for (let i = 0; i < ds; i++) {
                const sumhorario = moment.duration(lee).add(intervaloCitas, 'minute');
                const pastehorasin = sumhorario.hours().toString() + (sumhorario.minutes().toString() == 0 ? "00" : sumhorario.minutes().toString())//Format
                const formathora = moment(pastehorasin, "hmm").format("HH:mm"); //Format
                array.push({ inicio: lee, cierre: formathora, fecha: date });
                lee = formathora
            }
            sethoras(array);
        }
    }

    //Accion cuando se selecciona una hora
    const [selectDisponibilidad, setselectDisponibilidad] = useState([])
    const [disableButton, setdisableButton] = useState(true)
    const selectHour = (data) => {
        setselectDisponibilidad(data);
        disableButtonFunction();
    }

    //Funcion desactivar boton Confirmar
    const disableButtonFunction = () => {
        setdisableButton(false);
    }

    //Funcion get estado de la cita
    const getEstadoCita = (data) => {
        const datafecha = data.fecha.format("DD-MM-YYYY")
        const cita = apidataCitas.filter(x => x.citaFecha == datafecha & x.citasHoraInicio == data.inicio);

        if (cita.length > 0) {
            var estado = cita.map(y => { return y.estadoCitas });

            if (estado == "true")
                return true
            else
                return false
        } else
            return false
    }

    return <>
        <View style={{ width: "100%", height: "100%" }}>
            <ScrollView style={{ height: "100%", backgroundColor: '#68CCC0' }}>
                <View style={styles.containerCalendar}>
                    <CalendarPickerModal
                        startFromMonday={true}
                        minDate={new Date()}
                        maxDate={new Date(2050, 6, 3)}
                        // selectedStartDate={selectedStartDate}
                        weekdays={['Lun', 'Mar', 'Mier', 'Jue', 'Vier', 'Sab', 'Dom']}
                        months={['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']}
                        previousTitle="Anterior"
                        nextTitle="Siguiente"
                        disabledDates={date => {
                            return date.isBetween(selectedStartDate, selectedEndDate);
                        }}
                        todayBackgroundColor="#e6ffe6"
                        selectedDayStyle={{ backgroundColor: "#68CCC0" }}
                        selectedDayTextColor="#000000"
                        ScrollView={true}
                        onDateChange={onDateChange}
                    />
                </View>
                <View style={styles.viewTitle}>
                    <View style={styles.boxTitle}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginHorizontal: 15, marginVertical: 20, }}>Horarios Disponibles</Text>
                    </View>
                    {selectedStartDate == null
                        ? <View style={styles.viewListDisponibilidad}>
                            <Text style={{ marginVertical: 10, alignSelf: 'center', fontSize: 14, fontWeight: 'bold', color: "#504D4C" }}>Seleccione un día</Text>
                        </View>
                        : <View style={styles.viewListDisponibilidad}>
                            {horas.length == 0
                                ? <Text style={{ marginVertical: 10, alignSelf: 'center', fontSize: 14, fontWeight: 'bold', color: "#504D4C" }}>En este día no se encuentra disponible</Text>
                                : horas.map(data => (
                                    <TouchableOpacity key={data.inicio} style={styles.viewTouch} disabled={getEstadoCita(data) == true ? true : false} onPress={() => selectHour(data)}>
                                        <View style={data == selectDisponibilidad ? styles.radioOff : styles.radioOn}></View>
                                        <Text style={{ fontSize: 14, marginRight: 20 }}>{data.inicio} - {data.cierre}</Text>
                                        {getEstadoCita(data) == true
                                            ? <Text style={styles.textNoDisponible}>No Disponible</Text>
                                            : <Text style={styles.textDisponible}>Disponible</Text>
                                        }
                                    </TouchableOpacity>
                                ))
                            }
                        </View>
                    }
                    <TouchableOpacity style={disableButton == true ? styles.buttonOn : styles.buttonOff} disabled={disableButton}>
                        <Text style={styles.textStyleButton}>Confirmar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    </>
}

export default DisponibilidadDoctorScreen;

const styles = StyleSheet.create({
    containerCalendar: {
        paddingTop: 15,
        paddingBottom: 15,
        marginBottom: 25,
        backgroundColor: 'white'
    },
    viewTitle: {
        width: "100%", height: "100%",
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#65D1B7',
    },
    boxTitle: {
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#232020",
        width: "65%",
    },
    viewListDisponibilidad: {
        backgroundColor: '#FFFFFF',
        width: "80%",
        marginBottom: 35,
        paddingHorizontal: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#000000',
    },
    viewTouch: {
        width: "100%",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 5,
        borderBottomWidth: 1,
        borderColor: '#EDEDED',
    },
    radioOn: {
        height: 20,
        width: 20,
        borderWidth: 1,
        borderColor: "#000000",
        borderRadius: 30,
        shadowColor: "#7E8C8A",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 7,
    },
    radioOff: {
        height: 20,
        width: 20,
        borderWidth: 1,
        backgroundColor: '#6F756E',
        borderColor: "#000000",
        borderRadius: 30,
        shadowColor: "#7E8C8A",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 7,
    },
    buttonOn: {
        borderRadius: 10,
        marginBottom: 50,
        backgroundColor: "rgba(96, 129, 91, 0.47)",
        borderWidth: 1,
        borderColor: "#3E523B",
        borderRadius: 99,
    },
    buttonOff: {
        borderRadius: 10,
        marginBottom: 50,
        backgroundColor: "#60815B",
        borderWidth: 1,
        borderColor: "#3E523B",
        borderRadius: 99,
    },
    textStyleButton: {
        marginHorizontal: 55,
        marginVertical: 10,
        color: "#FFFFFF",
        fontSize: 14
    },
    textDisponible: {
        width: 100,
        color: "#60815B",
        fontSize: 14,
        fontWeight: 'bold',
        marginVertical: 15,
        marginRight: 20
    },
    textNoDisponible: {
        width: 100,
        color: "#CC2222",
        fontSize: 14,
        fontWeight: 'bold',
        marginVertical: 15,
        marginRight: 20
    }
})