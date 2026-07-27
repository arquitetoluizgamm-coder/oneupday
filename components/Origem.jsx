'use client';
import { useEffect } from 'react';
import { guardarOrigem, lerOrigem } from '../lib/origem';

// Guarda o marcador do link na chegada e, se a pessoa já estiver
// logada, manda para o servidor gravar no perfil.
//
// Manda em toda visita, não só no cadastro. O motivo: o login com
// Google sai do site e volta, e nesse trajeto não há um momento
// confiável para disparar o registro. A rota do servidor só grava
// se o perfil ainda estiver sem origem, então repetir não estraga
// nada — e não perder é mais importante que não repetir.
export default function Origem() {
  useEffect(() => {
    guardarOrigem();
    const o = lerOrigem();
    if (!o) return;
    try {
      fetch('/api/origem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origem: o }),
        keepalive: true,
      });
    } catch { }
  }, []);
  return null;
}
