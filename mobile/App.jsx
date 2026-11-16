import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Router from './Router';
import { ApiProvider } from './services/useApi';
import useApi from './services/useApi';
import { GlobalProvider } from './services/useGlobal';
import useGlobal from './services/useGlobal';
import Toast from 'react-native-toast-message';

function SessionLoader() {
  const { setAuthorization } = useApi();
  const { setUsername, setRole } = useGlobal();

  useEffect(() => {
    AsyncStorage.getItem('session')
      .then((raw) => {
        if (!raw) return;
        const session = JSON.parse(raw);
        if (session?.authorizationToken) {
          setAuthorization('Bearer ' + session.authorizationToken);
          setUsername(session.username);
          setRole(session.role);
        }
      })
      .catch(() => {});
  }, []);

  return <Router />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <ApiProvider>
          <GlobalProvider>
            <SessionLoader />
            <Toast />
          </GlobalProvider>
        </ApiProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}