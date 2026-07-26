// Loop da marca: o pingo desce, atravessa o fundo do U e volta.
// Usar só em momentos de ESPERA ou de VIRADA — nunca ao lado de conteúdo.
// SVG de 2 KB; a animação roda dentro da tag img em qualquer navegador atual.
export default function LoopMarca({ size = 120, className = '' }) {
  return (
    <img
      src="/oud-loop.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={Math.round(size * 390 / 512)}
      className={`oud-loop ${className}`.trim()}
      draggable="false"
    />
  );
}
