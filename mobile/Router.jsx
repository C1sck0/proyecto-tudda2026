import { createDrawerNavigator } from '@react-navigation/drawer';

import Login from './screens/Login';
import About from './screens/About.jsx';
import Users from './screens/Users';

const Drawer = createDrawerNavigator();

export default function Router() {
  return <Drawer.Navigator>
    <Drawer.Screen name="Login" component={Login} options={{ title: 'Iniciar sesión' }} />
    <Drawer.Screen name="Users" component={Users} options={{ title: 'Usuarios' }} />
    <Drawer.Screen name="About" component={About} options={{ title: 'Acerca de' }} />
  </Drawer.Navigator>;
}