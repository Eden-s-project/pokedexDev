import { describe, expect, test } from 'bun:test';
import { groupByEvolutionStage, type EvolutionSpecies } from './pokemon';

const species = (id: number, name: string, evolvesFrom: number | null): EvolutionSpecies => ({
    id,
    name,
    evolves_from_species_id: evolvesFrom,
    pokemon_v2_pokemonevolutions: [],
});

// Formato cru da API para uma evolução por nível
const byLevel = (level: number): EvolutionSpecies['pokemon_v2_pokemonevolutions'][number] => ({
    min_level: level,
    min_happiness: null,
    min_affection: null,
    min_beauty: null,
    time_of_day: '',
    needs_overworld_rain: false,
    turn_upside_down: false,
    relative_physical_stats: null,
    pokemon_v2_evolutiontrigger: { name: 'level-up' },
    pokemon_v2_item: null,
    pokemonV2ItemByHeldItemId: null,
    pokemon_v2_move: null,
    pokemon_v2_type: null,
    pokemon_v2_location: null,
    pokemon_v2_gender: null,
    pokemonV2PokemonspecyByPartySpeciesId: null,
    pokemonV2TypeByPartyTypeId: null,
    pokemonV2PokemonspecyByTradeSpeciesId: null,
});

const namesPerStage = (list: EvolutionSpecies[]) =>
    groupByEvolutionStage(list).map((stage) => stage.map((node) => node.name));

describe('groupByEvolutionStage', () => {
    test('cadeia linear simples', () => {
        expect(namesPerStage([
            species(1, 'bulbasaur', null),
            species(2, 'ivysaur', 1),
            species(3, 'venusaur', 2),
        ])).toEqual([['Bulbasaur'], ['Ivysaur'], ['Venusaur']]);
    });

    test('bebê com id maior vem primeiro (Pichu #172 evolui para Pikachu #025)', () => {
        // A API devolve ordenado por id, por isso Pichu chega por último
        expect(namesPerStage([
            species(25, 'pikachu', 172),
            species(26, 'raichu', 25),
            species(172, 'pichu', null),
        ])).toEqual([['Pichu'], ['Pikachu'], ['Raichu']]);
    });

    test('evoluções irmãs ficam no mesmo estágio (Eevee)', () => {
        const stages = namesPerStage([
            species(133, 'eevee', null),
            species(134, 'vaporeon', 133),
            species(135, 'jolteon', 133),
            species(136, 'flareon', 133),
            species(196, 'espeon', 133),
            species(197, 'umbreon', 133),
            species(470, 'leafeon', 133),
            species(471, 'glaceon', 133),
            species(700, 'sylveon', 133),
        ]);

        expect(stages).toHaveLength(2);
        expect(stages[1]).toHaveLength(8);
    });

    test('ramo no 2º estágio (Wurmple)', () => {
        expect(namesPerStage([
            species(265, 'wurmple', null),
            species(266, 'silcoon', 265),
            species(267, 'beautifly', 266),
            species(268, 'cascoon', 265),
            species(269, 'dustox', 268),
        ])).toEqual([['Wurmple'], ['Silcoon', 'Cascoon'], ['Beautifly', 'Dustox']]);
    });

    test('Pokémon sem evolução: um estágio só', () => {
        expect(namesPerStage([species(132, 'ditto', null)])).toEqual([['Ditto']]);
    });

    test('cadeia vazia', () => {
        expect(groupByEvolutionStage([])).toEqual([]);
    });

    test('link e imagem usam o número da espécie', () => {
        const [[pichu]] = groupByEvolutionStage([species(172, 'pichu', null)]);
        expect(pichu.id).toBe(172);
        expect(pichu.image).toEndWith('/172.png');
    });

    test('cada nó traz como evolui da anterior; a base fica sem condição', () => {
        const stages = groupByEvolutionStage([
            species(1, 'bulbasaur', null),
            { ...species(2, 'ivysaur', 1), pokemon_v2_pokemonevolutions: [byLevel(16)] },
            { ...species(3, 'venusaur', 2), pokemon_v2_pokemonevolutions: [byLevel(32)] },
        ]);

        expect(stages.map(([node]) => node.condition)).toEqual([null, 'Nv. 16', 'Nv. 32']);
    });
});
