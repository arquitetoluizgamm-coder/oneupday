'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ABAS = [
  ['/admin', 'Painel'],
  ['/admin/pessoas', 'Pessoas'],
  ['/admin/comentarios', 'Comentários'],
  ['/admin/denuncias', 'Denúncias'],
  ['/admin/origens', 'Origens'],
];

export default function AdminAbas() {
  const aqui = usePathname();
  return (
    <nav className="admin-abas">
      {ABAS.map(([href, rot]) => (
        <Link key={href} href={href} className={aqui === href ? 'on' : ''}>{rot}</Link>
      ))}
    </nav>
  );
}
