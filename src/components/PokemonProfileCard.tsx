import { useEffect, useRef, useState } from "react";
import { typeColors } from "../utils/constants";
import type { PokemonDetailedData } from "../services/pokemon";

interface PokemonProfileCardProps {
  pokemon: PokemonDetailedData;
}

// Os gritos da PokéAPI são .ogg; Safari antigo não toca esse formato
const canPlayOgg = typeof Audio !== 'undefined' && new Audio().canPlayType('audio/ogg; codecs="vorbis"') !== '';

const cryLabels = { idle: '🔊 Grito', playing: '🔊 Tocando…', error: '🔊 Tentar de novo' };

export function PokemonProfileCard({ pokemon }: PokemonProfileCardProps) {
  const badges = [
    pokemon.species?.isLegendary && { label: 'Lendário', className: 'bg-yellow-400 text-slate-900' },
    pokemon.species?.isMythical && { label: 'Mítico', className: 'bg-pink-400 text-slate-900' },
    pokemon.species?.isBaby && { label: 'Bebê', className: 'bg-sky-300 text-slate-900' },
  ].filter((badge): badge is { label: string; className: string } => Boolean(badge));

  const [shiny, setShiny] = useState(false);
  // Falha ao carregar a arte shiny (rede instável ou forma sem arte) volta para a normal,
  // mas o botão continua ativo para tentar de novo
  const [shinyFailed, setShinyFailed] = useState(false);
  const shinyImage = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemon.id}.png`;

  const [cryState, setCryState] = useState<keyof typeof cryLabels>('idle');
  // Áudio tocando agora + o controlador que remove os ouvintes dele
  const cryRef = useRef<{ audio: HTMLAudioElement; listeners: AbortController } | null>(null);

  // Ao sair do Pokémon (o card é recriado a cada navegação), o grito para
  useEffect(() => {
    const cry = cryRef;
    return () => {
      cry.current?.listeners.abort();
      cry.current?.audio.pause();
    };
  }, []);

  const playCry = () => {
    cryRef.current?.listeners.abort();
    cryRef.current?.audio.pause();

    const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`);
    const listeners = new AbortController();
    audio.volume = 0.5;
    // Qualquer fim destrava o botão: acabou, pausado pelo sistema/outra mídia, ou erro de rede
    audio.addEventListener('ended', () => setCryState('idle'), { signal: listeners.signal });
    audio.addEventListener('pause', () => setCryState('idle'), { signal: listeners.signal });
    audio.addEventListener('error', () => setCryState('error'), { signal: listeners.signal });
    cryRef.current = { audio, listeners };

    setCryState('playing');
    audio.play().catch(() => setCryState('error'));
  };

  return (
    <div className="md:w-1/2 p-8 md:p-12 flex flex-col items-center bg-slate-800 border-b-4 md:border-b-0 md:border-r-4 border-slate-900 relative">
      <div className="absolute top-4 left-4 w-4 h-4 bg-red-500 rounded-full shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.5)] border-2 border-slate-900"></div>
      <div className="absolute top-4 left-10 w-4 h-4 bg-yellow-400 rounded-full shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.5)] border-2 border-slate-900"></div>
      <div className="absolute top-4 left-16 w-4 h-4 bg-green-500 rounded-full shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.5)] border-2 border-slate-900"></div>

      <h1 className="text-4xl md:text-5xl font-black text-white mb-2 capitalize text-center tracking-widest drop-shadow-[2px_2px_0_rgba(0,0,0,1)] mt-4">
        {pokemon.name}
      </h1>
      <p className="text-slate-400 font-bold font-retro text-3xl mb-8">{pokemon.number}</p>

      {badges.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 -mt-5 mb-6">
          {badges.map((badge) => (
            <span
              key={badge.label}
              className={`${badge.className} px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)]`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      <div className="bg-slate-200 rounded-xl p-6 mb-4 w-64 h-64 flex justify-center items-center shadow-[inset_4px_4px_10px_rgba(0,0,0,0.2)] border-4 border-slate-900 relative">
        <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.3)]"></div>
        <img
          src={shiny ? shinyImage : pokemon.image}
          alt={shiny ? `${pokemon.name} shiny` : pokemon.name}
          onError={() => {
            if (shiny) {
              setShiny(false);
              setShinyFailed(true);
            }
          }}
          className="w-56 h-56 object-contain hover:scale-110 transition-transform duration-300 relative z-10 drop-shadow-md"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          type="button"
          onClick={() => {
            setShinyFailed(false);
            setShiny((value) => !value);
          }}
          aria-pressed={shiny}
          title={shinyFailed ? 'Não foi possível carregar a arte shiny. Clique para tentar de novo.' : undefined}
          // Ligado: fundo escuro e borda amarela (amarelo sobre amarelo escondia o ✨)
          className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border-2 shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500 ${shiny ? 'bg-slate-900 text-yellow-300 border-yellow-300' : 'bg-slate-200 text-slate-900 border-slate-900 hover:bg-white'}`}
        >
          {shinyFailed ? '✨ Tentar shiny de novo' : '✨ Shiny'}
        </button>
        <button
          type="button"
          onClick={playCry}
          disabled={!canPlayOgg || cryState === 'playing'}
          title={!canPlayOgg ? 'Seu navegador não toca áudio OGG' : cryState === 'error' ? 'Não foi possível tocar o grito' : undefined}
          className="px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)] bg-slate-200 text-slate-900 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500"
        >
          {cryLabels[cryState]}
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-auto">
        {pokemon.types.map((type) => (
          <span
            key={type}
            className={`${typeColors[type.toLowerCase()] || 'bg-gray-200 text-gray-800'} px-6 py-2 rounded-full font-bold text-sm tracking-widest uppercase border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)]`}
          >
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}
