import { useState, useCallback } from 'react';
import { View, Text, Alert, Platform, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Screen from '../components/Screen';
import Button from '../components/Button';
import useUser from '../services/useUser';
import useGlobal from '../services/useGlobal';
import styles from '../styles';

export default function Users({ navigation }) {
  const { getUsers, deleteUser } = useUser();
  const { role } = useGlobal();
  const [list, setList] = useState([]);

  const isBarber = role === 'barber';

  const loadList = useCallback(async () => {
    try {
      const res = await getUsers();
      if (isBarber) {
        setList(res.filter((u) => u.role === 'user'));
      } else {
        setList(res);
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error al cargar la lista',
        text2: err.message,
      });
    }
  }, [isBarber]);

  useFocusEffect(
    useCallback(() => {
      loadList();
    }, [loadList])
  );

  async function executeDelete(targetUsername) {
    try {
      await deleteUser(targetUsername);
      Toast.show({ type: 'success', text1: 'Eliminado correctamente' });
      loadList();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message });
    }
  }

  function eliminarUsuario(targetUsername) {
    if (Platform.OS === 'web') {
      if (window.confirm(`¿Eliminar a ${targetUsername}? Esta acción no se podrá revertir.`)) {
        executeDelete(targetUsername);
      }
      return;
    }

    Alert.alert(
      `¿Eliminar a ${targetUsername}?`,
      'Esta acción no se podrá revertir.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => executeDelete(targetUsername),
        },
      ]
    );
  }

  return (
    <Screen title={isBarber ? 'Mis Clientes' : 'Gestión de Usuarios'}>
      <View style={{ marginBottom: 14 }}>
        <Button
          label={isBarber ? '+ Agregar Cliente' : '+ Agregar Usuario'}
          onPress={() => navigation.navigate('UserForm', { username: null })}
        />
        <Button label="Actualizar Lista" variant="secondary" onPress={loadList} />
      </View>

      {list.length === 0 ? (
        <View style={styles.card}>
          <Text style={[styles.text, { textAlign: 'center' }]}>
            No hay registros para mostrar.
          </Text>
        </View>
      ) : (
        list.map((row) => (
          <View key={row.username} style={styles.card}>
            <View style={localStyles.rowTop}>
              <Text style={localStyles.userTitle}>{row.username}</Text>
              {!isBarber && (
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>{row.role.toUpperCase()}</Text>
                </View>
              )}
            </View>

            <Text style={styles.text}>{row.displayName}</Text>
            <Text style={[styles.mutedText, { marginTop: 2, marginBottom: 12 }]}>
              {row.email}
            </Text>

            <Button
              label="Modificar"
              variant="secondary"
              onPress={() => navigation.navigate('UserForm', { username: row.username })}
            />
            <Button
              label="Eliminar"
              variant="danger"
              onPress={() => eliminarUsuario(row.username)}
            />
          </View>
        ))
      )}
    </Screen>
  );
}

const localStyles = StyleSheet.create({
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});