import { skipToken, useQuery } from '@tanstack/react-query';
import { fetchSkillDescription, type SkillRef } from '../services/pokemon';

// Busca a descrição só quando há um golpe/habilidade selecionado (diálogo aberto).
// O mesmo golpe aprendido por outro Pokémon reaproveita o cache.
export function useSkillDescription(skill: SkillRef | null) {
    return useQuery({
        queryKey: ['skill-description', skill?.kind, skill?.name],
        queryFn: skill ? () => fetchSkillDescription(skill) : skipToken,
    });
}
