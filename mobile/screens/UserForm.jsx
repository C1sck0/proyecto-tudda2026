import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import Button from '../components/Button';
import useUser from '../services/useUser';
import useGlobal from '../services/useGlobal';
import styles from '../styles';

const ROLE_OPTIONS = [
  { value: 'user', label: 'Cliente (user)' },
  { value: 'barber', label: 'Barbero (barber)' },
  { value: 'admin', label: 'Administrador (admin)' },
];

export default function UserForm({ route, navigation }) {
  const editUsername = route.params?.username || null;
  const { getUser, updateUser, addUser } = useUser();
  const { role } = useGlobal();

  const isBarber = role === 'barber';

  const [data, setData] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    role: 'user',
  });

  useFocusEffect(
    useCallback(() => {
      if (!editUsername) {
        setData({
          username: '',
          displayName: '',
          email: '',
          password: '',
          role: 'user',
        });
        return;
      }

      getUser(editUsername)
        .then((userData) => setData(userData))
        .catch((err) =>
          Toast.show({
            type: 'error',
            text1: 'Error al cargar datos',
            text2: err?.message,
          })
        );
    }, [editUsername])
  );

  async function submitHandler() {
    if (!data.username || !data.displayName || !data.email) {
      Toast.show({ type: 'error', text1: 'Completá los campos obligatorios' });
      return;
    }
    if (!editUsername && !data.password) {
      Toast.show({ type: 'error', text1: 'La contraseña es obligatoria' });
      return;
    }
    if (!data.email.includes('@')) {
      Toast.show({ type: 'error', text1: 'El correo electrónico debe incluir @' });
      return;
    }

    try {
      const payload = { ...data };
      if (isBarber) {
        payload.role = 'user';
      }
      if (editUsername && !payload.password) {
        delete payload.password;
      }

      if (editUsername) {
        await updateUser(editUsername, payload);
      } else {
        await addUser(payload);
      }

      Toast.show({
        type: 'success',
        text1: `${isBarber ? 'Cliente' : 'Usuario'} ${
          editUsername ? 'modificado' : 'registrado'
        } correctamente`,
      });
      navigation.navigate('Users');
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error al guardar', text2: err.message });
    }
  }

  return (
    <Screen
      title={
        editUsername
          ? `Editar ${isBarber ? 'Cliente' : 'Usuario'}`
          : isBarber
            ? 'Nuevo Cliente'
            : 'Nuevo Usuario'
      }
    >
      <View style={styles.card}>
        <TextField
          label="Nombre de usuario"
          autoCapitalize="none"
          value={data.username}
          editable={!editUsername || role === 'admin'}
          onChangeText={(val) => setData((d) => ({ ...d, username: val }))}
        />
        <TextField
          label="Nombre completo"
          value={data.displayName}
          onChangeText={(val) => setData((d) => ({ ...d, displayName: val }))}
        />
        <TextField
          label="Correo electrónico"
          keyboardType="email-address"
          autoCapitalize="none"
          value={data.email}
          onChangeText={(val) => setData((d) => ({ ...d, email: val }))}
        />
        <TextField
          label={editUsername ? 'Nueva contraseña (opcional)' : 'Contraseña'}
          secureTextEntry
          value={data.password}
          onChangeText={(val) => setData((d) => ({ ...d, password: val }))}
        />

        {!isBarber && (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Rol:</Text>
            <View style={localStyles.chipsWrap}>
              {ROLE_OPTIONS.map((opt) => {
                const active = data.role === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setData((d) => ({ ...d, role: opt.value }))}
                    style={[localStyles.chip, active && localStyles.chipActive]}
                  >
                    <Text style={[localStyles.chipText, active && localStyles.chipTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ marginTop: 14 }}>
          <Button
            label={editUsername ? 'Guardar Cambios' : 'Agregar'}
            onPress={submitHandler}
          />
          <Button
            label="Cancelar"
            variant="secondary"
            onPress={() => navigation.navigate('Users')}
          />
        </View>
      </View>
    </Screen>
  );
}

const localStyles = StyleSheet.create({
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  chipText: {
    color: '#e4e4e7',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#09090b',
    fontWeight: '800',
  },
});