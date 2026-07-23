'use client';
import { useEffect } from 'react';
import { track } from '../lib/track';
export default function Track({ type, meta }) {
  useEffect(() => { track(type, meta); }, []);
  return null;
}
