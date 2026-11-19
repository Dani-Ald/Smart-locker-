import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOUR_COMPLETED_KEY = 'smart-ticket.first-run-tour.completed.v1';

export async function hasCompletedFirstRunTour() {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' && window.localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
  }

  return (await SecureStore.getItemAsync(TOUR_COMPLETED_KEY)) === 'true';
}

export async function markFirstRunTourCompleted() {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    return;
  }

  await SecureStore.setItemAsync(TOUR_COMPLETED_KEY, 'true');
}
