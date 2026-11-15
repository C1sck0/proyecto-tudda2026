import Screen from '../components/Screen';
import { Text, View, FlatList } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import useUser from '../services/useUser';

export default function Users() {
  const { getUsers } = useUser();
  const [list, setList] = useState([]);

  const loadList = useCallback(async () => {
    const res = await getUsers();
    setList(res);
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  return <Screen
    title="Usuarios"
  >
    <FlatList
      data={list}
      keyExtractor={(item) => item.username}
      renderItem={({ item }) => <View>
        <Text>{item.username}</Text>
        <Text>{item.email}</Text>
        <Text>{item.displayName}</Text>
      </View>}
    />
 </Screen>;
}