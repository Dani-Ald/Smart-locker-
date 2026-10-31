import { Linking, Platform } from 'react-native';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';

export async function openWebPage(url: string) {
  if (Platform.OS === 'web') {
    await Linking.openURL(url);
    return;
  }
  await openBrowserAsync(url, { presentationStyle: WebBrowserPresentationStyle.AUTOMATIC });
}

export async function openMap(destination: string) {
  const encoded = encodeURIComponent(destination);
  const url = Platform.OS === 'ios'
    ? `http://maps.apple.com/?q=${encoded}`
    : `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  await Linking.openURL(url);
}
