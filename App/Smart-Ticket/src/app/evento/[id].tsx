/**
 * app/evento/[id].tsx — Ruta dinámica de Expo Router para el detalle de un evento.
 * El parámetro [id] es el _id de MongoDB del evento.
 *
 * Uso: router.push(`/evento/${evento._id}`)
 */
import EventDetailScreen from '@/screens/EventDetailScreen';

export default EventDetailScreen;
