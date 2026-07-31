import styles from './pilot.module.css';

const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">{children}</svg>
);

export const metadata = {
  title: 'ONE Material Pilot',
  robots: { index: false, follow: false },
};

export default function MaterialPilot() {
  return (
    <main className={styles.page}>
      <section className={styles.shell} aria-labelledby="pilot-title">
        <div className={styles.eyebrow}>ONE MATERIAL · PILOTO INTERATIVO</div>
        <h1 id="pilot-title">O mesmo material.<br />Cada ação com peso.</h1>
        <p className={styles.intro}>Uma referência isolada para validar profundidade, luz e toque antes de alterar a experiência real.</p>
        <div className={styles.section}><p className={styles.label}>Ações</p><div className={styles.row}><button className={`${styles.button} ${styles.primary}`} type="button"><span>+</span> Começar hoje</button><button className={`${styles.button} ${styles.secondary}`} type="button">Ver jornada <span>›</span></button></div></div>
        <label className={styles.field}><span>Registro do dia</span><input placeholder="Escreva um passo pequeno…" /></label>
        <div className={styles.section}><p className={styles.label}>Escolhas</p><div className={styles.row}><button className={`${styles.chip} ${styles.chipActive}`} type="button">● Recomeço</button><button className={styles.chip} type="button">• Presença</button><button className={styles.chip} type="button">• 7 dias</button></div></div>
        <article className={styles.card}><div className={styles.cardHead}><div className={styles.avatar}>V</div><div><strong>Voltar a ser bem-vindo</strong><small>Dia 12 · manhã tranquila</small></div></div><p>Um card para destacar progresso sem transformar a jornada em placar. A sombra o sustenta, mas não pesa.</p><button className={styles.cardAction} type="button">Continuar <span>→</span></button></article>
        <div className={styles.section}><p className={styles.label}>Navegação tátil</p><nav className={styles.iconRow} aria-label="Exemplo de ícones"><button className={`${styles.iconButton} ${styles.iconActive}`} aria-label="Criar" type="button"><Icon><path d="M12 5v14M5 12h14" /></Icon></button><button className={styles.iconButton} aria-label="Concluir" type="button"><Icon><path d="m6 12 4 4 8-8" /></Icon></button><button className={styles.iconButton} aria-label="Avançar" type="button"><Icon><path d="M5 12h13m-5-5 5 5-5 5" /></Icon></button><button className={styles.iconButton} aria-label="Mais opções" type="button"><Icon><path d="M6 12h.01M12 12h.01M18 12h.01" /></Icon></button></nav></div>
      </section>
      <nav className={styles.footer} aria-label="Prévia da navegação inferior"><button aria-label="Início" className={styles.footerItem}><Icon><path d="m4 11 8-7 8 7v9H4zM9 20v-6h6v6" /></Icon></button><button aria-label="Explorar" className={styles.footerItem}><Icon><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></Icon></button><button aria-label="Criar" className={`${styles.footerItem} ${styles.footerCreate}`}><Icon><path d="M12 5v14M5 12h14" /></Icon></button><button aria-label="Jornadas" className={styles.footerItem}><Icon><circle cx="12" cy="12" r="8" /><path d="m9 13 2 2 4-5" /></Icon></button><button aria-label="Perfil" className={styles.footerItem}><span className={styles.footerAvatar}>V</span></button></nav>
    </main>
  );
}
