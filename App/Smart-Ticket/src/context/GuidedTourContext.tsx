import { router, useSegments } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useSessionContext } from '@/context/SessionContext';
import { hasCompletedFirstRunTour, markFirstRunTourCompleted } from '@/services/firstRunTourService';

const TOUR_STEPS = [
  {
    href: '/',
    route: 'boletos',
    title: 'Tu wallet, siempre a mano',
    description: 'Aquí encontrarás tus boletos. Toca uno para ver sus detalles y QR; si no hay conexión, podrás consultar los datos guardados en el dispositivo.',
    icon: { ios: 'ticket.fill', android: 'confirmation_number', web: 'confirmation_number' },
  },
  {
    href: '/explorar',
    route: 'explorar',
    title: 'Explora la cartelera',
    description: 'Desde aquí puedes abrir la cartelera web para explorar eventos o publicar uno. La compra no se completa dentro de esta pestaña móvil.',
    icon: { ios: 'safari', android: 'explore', web: 'explore' },
  },
  {
    href: '/historial',
    route: 'historial',
    title: 'Revisa tu historial',
    description: 'Consulta tus eventos anteriores y, cuando corresponda, las opciones disponibles para dejar una reseña.',
    icon: { ios: 'clock.arrow.circlepath', android: 'history', web: 'history' },
  },
  {
    href: '/perfil',
    route: 'perfil',
    title: 'Tu cuenta y seguridad',
    description: 'En Perfil puedes revisar la protección biométrica, volver a ver este recorrido y cerrar sesión.',
    icon: { ios: 'person.fill', android: 'person', web: 'person' },
  },
] as const;

type GuidedTourContextValue = {
  visible: boolean;
  stepIndex: number;
  stepCount: number;
  startTour: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTour: () => void;
};

const GuidedTourContext = createContext<GuidedTourContextValue | null>(null);

export function GuidedTourProvider({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useSessionContext();
  const segments = useSegments();
  const [storageReady, setStorageReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    void hasCompletedFirstRunTour()
      .catch(() => false)
      .then((hasCompleted) => {
        if (!mounted) return;
        setCompleted(hasCompleted);
        setStorageReady(true);
      });
    return () => { mounted = false; };
  }, []);

  const routeSegments: readonly string[] = segments;
  const shouldShowFirstRun = storageReady && !isLoading && Boolean(session) && !completed && routeSegments.includes('(tabs)');
  const routeStepIndex = TOUR_STEPS.findIndex((step) => routeSegments.includes(step.route));
  const displayedStepIndex = visible ? stepIndex : routeStepIndex < 0 ? 0 : routeStepIndex;
  const isTourVisible = visible || shouldShowFirstRun;

  const finishTour = useCallback(() => {
    setVisible(false);
    setCompleted(true);
    void markFirstRunTourCompleted().catch(() => {
      // Si falla el almacenamiento, el recorrido podrá volver a aparecer en la siguiente apertura.
    });
  }, []);

  const startTour = useCallback(() => {
    setStepIndex(0);
    setVisible(true);
    router.navigate(TOUR_STEPS[0].href);
  }, []);

  const goToStep = useCallback((index: number) => {
    setStepIndex(index);
    setVisible(true);
    router.navigate(TOUR_STEPS[index].href);
  }, []);

  const nextStep = useCallback(() => {
    if (displayedStepIndex >= TOUR_STEPS.length - 1) {
      finishTour();
      return;
    }
    goToStep(displayedStepIndex + 1);
  }, [displayedStepIndex, finishTour, goToStep]);

  const previousStep = useCallback(() => {
    if (displayedStepIndex > 0) goToStep(displayedStepIndex - 1);
  }, [displayedStepIndex, goToStep]);

  const value = useMemo(() => ({
    visible: isTourVisible,
    stepIndex: displayedStepIndex,
    stepCount: TOUR_STEPS.length,
    startTour,
    nextStep,
    previousStep,
    skipTour: finishTour,
  }), [displayedStepIndex, finishTour, isTourVisible, nextStep, previousStep, startTour]);

  return <GuidedTourContext.Provider value={value}>{children}</GuidedTourContext.Provider>;
}

export function useGuidedTour() {
  const context = useContext(GuidedTourContext);
  if (!context) throw new Error('useGuidedTour debe usarse dentro de GuidedTourProvider.');
  return context;
}

export function getGuidedTourStep(index: number) {
  return TOUR_STEPS[index] ?? TOUR_STEPS[0];
}
