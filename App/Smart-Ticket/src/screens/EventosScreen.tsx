import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { API_BASE_URL } from '../constants/api';

interface Evento {
  _id: string;
  nombre: string;
  categoria: string;
  municipio: string;
  fechaHora: string;
  ubicacion: string;
  descripcion: string;
  precioDesde: number;
  aforoTotal: number;
  aforoVendido: number;
  estado: string;
}

export default function EventosScreen() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [refrescando, setRefrescando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargarEventos = async () => {
    try {
      setError(null);
      const respuesta = await fetch(`${API_BASE_URL}/eventos`);
      if (!respuesta.ok) {
        throw new Error(`Error en la petición: ${respuesta.status}`);
      }
      const data: Evento[] = await respuesta.json();
      setEventos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar eventos');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  const onRefresh = () => {
    setRefrescando(true);
    cargarEventos();
  };

  if (cargando) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.mensajeEstado}>Cargando eventos desde Atlas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.textoError}>No se pudo conectar a la API</Text>
        <Text style={styles.detalleError}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={eventos}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{item.categoria.replace('_', ' ').toUpperCase()}</Text>
            </View>
            <Text style={styles.titulo}>{item.nombre}</Text>
            <Text style={styles.subtitulo}>{item.municipio} • {item.ubicacion}</Text>
            <Text style={styles.descripcion} numberOfLines={2}>
              {item.descripcion}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.precio}>Desde ${item.precioDesde} MXN</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f1f5f9',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3730a3',
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  precio: {
    fontSize: 15,
    fontWeight: '600',
    color: '#059669',
  },
  mensajeEstado: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  textoError: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
  },
  detalleError: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
});
