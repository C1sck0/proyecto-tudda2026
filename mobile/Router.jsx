import { View, Text, Pressable } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useGlobal from './services/useGlobal';
import useApi from './services/useApi';
import styles from './styles';

import Home from './screens/Home';
import Login from './screens/Login';
import Register from './screens/Register';
import Appointments from './screens/Appointments';
import AppointmentForm from './screens/AppointmentForm';
import Notifications from './screens/Notifications';
import Users from './screens/Users';
import UserForm from './screens/UserForm';
import About from './screens/About';

const Drawer = createDrawerNavigator();

function CustomDrawerContent({ state, navigation }) {
  const { username, role, setUsername, setRole } = useGlobal();
  const { setAuthorization } = useApi();

  const activeRoute = state.routeNames[state.index];
  const isAdmin = role === 'admin';
  const isBarber = role === 'barber';
  const isUser = role === 'user';

  const roleLabels = {
    admin: 'ADMINISTRADOR',
    barber: 'BARBERO',
    user: 'CLIENTE',
  };

  async function handleLogout() {
    await AsyncStorage.removeItem('session');
    setAuthorization('');
    setUsername(null);
    setRole(null);
    navigation.navigate('Login');
  }

  function NavItem({ label, routeName }) {
    const selected = activeRoute === routeName;
    return (
      <Pressable
        style={[styles.drawerItem, selected && styles.drawerItemActive]}
        onPress={() => navigation.navigate(routeName)}
      >
        <Text style={[styles.drawerItemText, selected && styles.drawerItemTextActive]}>
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerBrand}>BARBERÍA OTTO</Text>
        <Text style={styles.drawerSubbrand}>DESDE 2017</Text>

        {username && (
          <View style={styles.drawerUserBox}>
            <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>
              {username}
            </Text>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>{roleLabels[role] || role}</Text>
            </View>
          </View>
        )}
      </View>

      <Text style={styles.drawerGroupLabel}>PRINCIPAL</Text>
      <NavItem label="Inicio" routeName="Home" />

      {!username ? (
        <>
          <NavItem label="Iniciar Sesión" routeName="Login" />
          <NavItem label="Registrarse" routeName="Register" />
        </>
      ) : (
        <>
          <NavItem label="Agenda de Turnos" routeName="Appointments" />
          <NavItem label="Reservar Turno" routeName="AppointmentForm" />
        </>
      )}

      {isUser && <NavItem label="Notificaciones" routeName="Notifications" />}

      {(isAdmin || isBarber) && (
        <>
          <Text style={styles.drawerGroupLabel}>ADMINISTRACIÓN</Text>
          <NavItem
            label={isBarber ? 'Mis Clientes' : 'Usuarios'}
            routeName="Users"
          />
        </>
      )}

      <NavItem label="Acerca de" routeName="About" />

      {username && (
        <View style={{ marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#27272a', paddingTop: 12 }}>
          <Pressable style={styles.buttonDanger} onPress={handleLogout}>
            <Text style={styles.buttonDangerText}>Cerrar Sesión</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function Router() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#09090b',
          borderBottomWidth: 1,
          borderBottomColor: '#27272a',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '700',
          letterSpacing: 1,
        },
        drawerStyle: {
          backgroundColor: '#09090b',
          width: 265,
        },
      }}
    >
      <Drawer.Screen name="Home" component={Home} options={{ title: 'Barbería Otto' }} />
      <Drawer.Screen name="Login" component={Login} options={{ title: 'Iniciar Sesión' }} />
      <Drawer.Screen name="Register" component={Register} options={{ title: 'Registrarse' }} />
      <Drawer.Screen name="Appointments" component={Appointments} options={{ title: 'Agenda de Turnos' }} />
      <Drawer.Screen name="AppointmentForm" component={AppointmentForm} options={{ title: 'Reservar Turno' }} />
      <Drawer.Screen name="Notifications" component={Notifications} options={{ title: 'Notificaciones' }} />
      <Drawer.Screen name="Users" component={Users} options={{ title: 'Usuarios' }} />
      <Drawer.Screen name="UserForm" component={UserForm} options={{ title: 'Gestionar Usuario' }} />
      <Drawer.Screen name="About" component={About} options={{ title: 'Acerca de' }} />
    </Drawer.Navigator>
  );
}