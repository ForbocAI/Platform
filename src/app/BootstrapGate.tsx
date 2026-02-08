'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { appBootstrap } from '@/store';

export default function BootstrapGate({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(appBootstrap);
  }, [dispatch]);

  return <>{children}</>;
}
