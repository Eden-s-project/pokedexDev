import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPokemonByName } from "../services/pokemon";
import { SkeletonDetails } from "../components/SkeletonDetails";
import { ErrorMessage } from "../components/ErrorMessage";
import { DetailsNavigation } from "../components/DetailsNavigation";
import { PokemonProfileCard } from "../components/PokemonProfileCard";
import { PokemonDexEntry } from "../components/PokemonDexEntry";
import { EvolutionChain } from "../components/EvolutionChain";
import { PokemonSkills } from "../components/PokemonSkills";

export function PokemonDetails() {
  const { name } = useParams<{ name: string }>();
  const { data: pokemon, isLoading, isError } = useQuery({
    queryKey: ['pokemon', name],
    queryFn: () => fetchPokemonByName(name as string),
    enabled: !!name,
  });

  return (
    <div className="min-h-screen bg-red-600 flex flex-col items-center pt-10 pb-20 px-4">
      {/* Navegação Topo */}
      <DetailsNavigation pokemon={pokemon} />

      {isLoading && <div className="w-full flex justify-center mt-10"><SkeletonDetails /></div>}
      {isError && <ErrorMessage />}

      {pokemon && !isLoading && !isError && (
        <div className="flex flex-col gap-8 max-w-5xl w-full">
          <div className="bg-slate-900 rounded-2xl shadow-[8px_8px_0_0_rgba(0,0,0,0.6)] overflow-hidden w-full flex flex-col md:flex-row border-4 border-slate-900 relative">
            <PokemonProfileCard pokemon={pokemon} />
            <PokemonDexEntry pokemon={pokemon} />
          </div>
          <PokemonSkills abilities={pokemon.abilities} moves={pokemon.moves} />
          <EvolutionChain stages={pokemon.evolutionStages} />
        </div>
      )}
    </div>
  );
}
