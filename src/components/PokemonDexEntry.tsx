
import type { PokemonDetailedData } from "../services/pokemon";
import { BaseStats } from "./BaseStats";

interface PokemonDexEntryProps {
  pokemon: PokemonDetailedData;
}

export function PokemonDexEntry({ pokemon }: PokemonDexEntryProps) {
  return (
    <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-slate-100">
      <div className="mb-8 relative">
        <div className="bg-[#8b9a70] p-5 border-4 border-slate-900 rounded-lg relative shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[repeating-linear-gradient(transparent,transparent_2px,#000_2px,#000_4px)]"></div>
          <h3 className="text-sm font-bold text-[#2e3b1f] mb-2 uppercase tracking-widest font-retro z-10 relative">
            DADOS DA POKÉDEX
          </h3>
          <p className="text-[#1a2410] leading-relaxed text-lg font-retro z-10 relative uppercase">
            "{pokemon.description}"
          </p>
        </div>
      </div>

      <div className="flex gap-2 md:gap-8 mb-10 bg-slate-800 p-4 md:p-6 rounded-xl border-4 border-slate-900 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col flex-1 items-center justify-center text-center">
          <span className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">PESO</span>
          <span className="text-xl md:text-2xl font-bold text-white font-retro tracking-wider">
            {pokemon.weight} <span className="text-sm md:text-lg text-slate-500 font-medium">kg</span>
          </span>
        </div>
        <div className="w-1 bg-slate-900 rounded-full shrink-0"></div>
        <div className="flex flex-col flex-1 items-center justify-center text-center">
          <span className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">ALTURA</span>
          <span className="text-xl md:text-2xl font-bold text-white font-retro tracking-wider">
            {pokemon.height} <span className="text-sm md:text-lg text-slate-500 font-medium">m</span>
          </span>
        </div>
      </div>

      <BaseStats stats={pokemon.stats} />
    </div>
  );
}
