import { Redirect } from 'expo-router';

/** Conserva enlaces anteriores a la pantalla de ejemplo. */
export default function ExploreRedirect() {
  return <Redirect href="/eventos" />;
}
