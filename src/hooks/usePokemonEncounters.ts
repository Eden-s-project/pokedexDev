import { skipToken, useQuery } from '@tanstack/react-query';
import { fetchPokemonEncounters } from '../services/pokemon';

// Locais de encontro por jogo. Consulta separada da página de detalhe: o resto da página
// não espera por ela, e Pokémon como o Zubat têm mais de 1.200 linhas de encontro.
export function usePokemonEncounters(pokemonId: number | undefined) {
    return useQuery({
        queryKey: ['encounters', pokemonId],
        queryFn: pokemonId === undefined ? skipToken : () => fetchPokemonEncounters(pokemonId),
    });
}
