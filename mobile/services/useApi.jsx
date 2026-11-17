import { useState, createContext, useContext } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const ApiContext = createContext();

function getAutoApiUrl() {
  // 1. Si lo abrís en navegador web en la misma PC
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  }

  // 2. En celular (Expo Go), toma la IP de tu PC automáticamente desde Metro
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:3000/api`;
  }

  // 3. Fallback por si se ejecuta un build compilado sin Metro
  return 'http://192.168.1.23:3000/api';
}

export function ApiProvider({ children }) {
  const [urlBase, setUrlBase] = useState(getAutoApiUrl);
  const [authorization, setAuthorization] = useState('');

  async function request(url, options) {
    options = { ...options };

    if (options.body) {
      if (typeof options.body !== 'string') {
        options.body = JSON.stringify(options.body);
        options.headers ??= {};
        options.headers['Content-Type'] = 'application/json';
      }
    }

    if (options.json) {
      options.headers ??= {};
      options.headers['Accept'] = 'application/json';
    }

    if (authorization) {
      options.headers ??= {};
      options.headers['Authorization'] = authorization;
    }

    const res = await fetch(urlBase + url, {
      ...options,
    });

    if (options.json) {
      const data = await res.json();
      if (!res.ok || data?.error) {
        throw new Error(data?.error || `Error en la petición: ${res.status}`);
      }
      return data;
    }

    if (!res.ok) {
      throw new Error(`Error en la petición: ${res.status} ${res.statusText}`);
    }

    return await res.text();
  }

  async function post(url, body) {
    return await request(url, { method: 'POST', body });
  }

  async function postJson(url, body, options = {}) {
    return await request(url, { method: 'POST', body, json: true, ...options });
  }

  async function getJson(url, options = {}) {
    return await request(url, { method: 'GET', json: true, ...options });
  }

  async function deleteJson(url, options = {}) {
    return await request(url, { method: 'DELETE', json: true, ...options });
  }

  async function patchJson(url, body, options = {}) {
    return await request(url, { method: 'PATCH', body, json: true, ...options });
  }

  async function putJson(url, body = {}, options = {}) {
    return await request(url, { method: 'PUT', body, json: true, ...options });
  }

  return (
    <ApiContext.Provider
      value={{
        urlBase,
        setUrlBase,
        authorization,
        setAuthorization,
        post,
        postJson,
        getJson,
        deleteJson,
        patchJson,
        putJson,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}

export default function useApi() {
  return useContext(ApiContext);
}