import { API_BASE_URL } from '@/constants/api';

export async function saveReview(
  token: string,
  eventId: string,
  calificacion: number,
  comentario: string,
) {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/eventos/${encodeURIComponent(eventId)}/resenas`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ calificacion, comentario }),
    });
  } catch {
    throw new Error('Necesitas conexión para enviar tu reseña.');
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'No fue posible guardar la reseña.');
  return body.data;
}
