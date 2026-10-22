import { z } from 'zod';
import { computeTypeMatchups, type TypeMatchups } from '../utils/typeEffectiveness';

const pokeApiGraphQLSchema = z.object({
    data: z.object({
        pokemon_v2_pokemon: z.array(
            z.object({
                id: z.number(),
                name: z.string(),
                pokemon_v2_pokemontypes: z.array(
                    z.object({
                        pokemon_v2_type: z.object({
                            name: z.string()
                        })
                    })
                )
            })
        )
    })
});

const evolutionSpeciesSchema = z.object({
    id: z.number(),
    name: z.string(),
    evolves_from_species_id: z.number().nullable()
});

export type EvolutionSpecies = z.infer<typeof evolutionSpeciesSchema>;

const pokeApiDetailedGraphQLSchema = z.object({
    data: z.object({
        pokemon_v2_pokemon: z.array(
            z.object({
                id: z.number(),
                name: z.string(),
                height: z.number(),
                weight: z.number(),
                pokemon_v2_pokemonspecy: z.object({
                    pokemon_v2_pokemonspeciesflavortexts: z.array(
                        z.object({
                            flavor_text: z.string()
                        })
                    ),
                    pokemon_v2_evolutionchain: z.object({
                        pokemon_v2_pokemonspecies: z.array(evolutionSpeciesSchema)
                    }).nullable()
                }).nullable(),
                pokemon_v2_pokemonstats: z.array(
                    z.object({
                        base_stat: z.number(),
                        pokemon_v2_stat: z.object({
                            name: z.string()
                        })
                    })
                ),
                pokemon_v2_pokemontypes: z.array(
                    z.object({
                        pokemon_v2_type: z.object({
                            name: z.string(),
                            // Golpes que acertam este tipo com fator != 100 (pokemon_v2_type = tipo do golpe)
                            pokemonV2TypeefficaciesByTargetTypeId: z.array(
                                z.object({
                                    damage_factor: z.number(),
                                    pokemon_v2_type: z.object({
                                        name: z.string()
                                    })
                                })
                            )
                        })
                    })
                ),
                pokemon_v2_pokemonabilities: z.array(
                    z.object({
                        is_hidden: z.boolean(),
                        pokemon_v2_ability: z.object({
                            name: z.string()
                        })
                    })
                ),
                pokemon_v2_pokemonmoves: z.array(
                    z.object({
                        level: z.number(),
                        pokemon_v2_move: z.object({
                            name: z.string(),
                            accuracy: z.number().nullable(),
                            power: z.number().nullable(),
                            pp: z.number().nullable(),
                            pokemon_v2_type: z.object({
                                name: z.string()
                            })
                        })
                    })
                )
            })
        )
    })
});

export interface PokemonSimpleData {
    name: string;
    number: string;
    image: string;
    types: string[];
}

export async function fetchAllPokemon(): Promise<PokemonSimpleData[]> {
    // Usamos GraphQL para pedir exatamente os campos que queremos para os 1025 Pokémons, em 1 única requisição!
    const query = `
      query {
        pokemon_v2_pokemon(limit: 1025) {
          id
          name
          pokemon_v2_pokemontypes {
            pokemon_v2_type {
              name
            }
          }
        }
      }
    `;

    const response = await fetch('https://beta.pokeapi.co/graphql/v1beta', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    });

    if (!response.ok) {
        throw new Error('Falha ao buscar a lista de Pokémons!');
    }

    // 2. Transforma a resposta em JSON (sem desestruturar o 'data' ainda)
    const json = await response.json();

    // 3. O Zod valida o json contra o nosso schema
    const validResponse = pokeApiGraphQLSchema.parse(json);

    // 4. Mapeamos os dados! 
    // Repare que não usamos mais "any" pois o Zod já garantiu pro TypeScript que os dados estão corretos.
    return validResponse.data.pokemon_v2_pokemon.map((pokemon) => {
        return {
            name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
            number: `#${pokemon.id.toString().padStart(3, '0')}`,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
            types: pokemon.pokemon_v2_pokemontypes.map((t) => t.pokemon_v2_type.name)
        };
    });
}

export interface EvolutionNode {
    id: number;
    name: string;
    image: string;
}

export interface PokemonDetailedData extends PokemonSimpleData {
    weight: number;
    height: number;
    stats: { name: string; value: number }[];
    description: string;
    // Cada posição é um estágio: [base], [1ª evolução], [2ª evolução]
    evolutionStages: EvolutionNode[][];
    typeMatchups: TypeMatchups;
    abilities: { name: string; isHidden: boolean }[];
    moves: { name: string; type: string; power: number | null; accuracy: number | null; pp: number | null; level: number }[];
}

// Agrupa as espécies da cadeia por estágio seguindo evolves_from_species_id.
// Ordenar só pelo id erra a ordem (Pichu #172 evolui para Pikachu #025)
// e enfileira evoluções que são irmãs (as 8 da Eevee).
export function groupByEvolutionStage(species: EvolutionSpecies[]): EvolutionNode[][] {
    const byId = new Map(species.map((s) => [s.id, s]));

    const stageOf = (s: EvolutionSpecies): number => {
        const parent = s.evolves_from_species_id === null ? undefined : byId.get(s.evolves_from_species_id);
        return parent ? stageOf(parent) + 1 : 0;
    };

    const stages = species.map(stageOf);
    const totalStages = Math.max(-1, ...stages) + 1;

    return Array.from({ length: totalStages }, (_, stage) =>
        species
            .filter((_, i) => stages[i] === stage)
            .map((s) => ({
                id: s.id,
                name: s.name.charAt(0).toUpperCase() + s.name.slice(1),
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${s.id}.png`
            }))
    );
}

// --------------------------------------------------------
// Nova função para buscar os dados completos de 1 Pokémon
// Aceita o nome ("pikachu") ou o número ("25") vindo da URL
// --------------------------------------------------------
export async function fetchPokemonByName(name: string): Promise<PokemonDetailedData> {
    // O valor vai como variável do GraphQL, nunca colado no texto da query
    const where = /^\d+$/.test(name)
        ? { id: { _eq: Number(name) } }
        : { name: { _eq: name.toLowerCase() } };

    const query = `
      query ($where: pokemon_v2_pokemon_bool_exp!) {
        pokemon_v2_pokemon(where: $where) {
          id
          name
          height
          weight
          pokemon_v2_pokemonspecy {
            pokemon_v2_pokemonspeciesflavortexts(where: {language_id: {_eq: 9}}, limit: 1) {
              flavor_text
            }
            pokemon_v2_evolutionchain {
              pokemon_v2_pokemonspecies(order_by: {id: asc}) {
                id
                name
                evolves_from_species_id
              }
            }
          }
          pokemon_v2_pokemonstats {
            base_stat
            pokemon_v2_stat {
              name
            }
          }
          pokemon_v2_pokemontypes {
            pokemon_v2_type {
              name
              pokemonV2TypeefficaciesByTargetTypeId(where: {damage_factor: {_neq: 100}}) {
                damage_factor
                pokemon_v2_type {
                  name
                }
              }
            }
          }
          pokemon_v2_pokemonabilities {
            is_hidden
            pokemon_v2_ability {
              name
            }
          }
          pokemon_v2_pokemonmoves(where: {pokemon_v2_movelearnmethod: {name: {_eq: "level-up"}}}, distinct_on: move_id) {
            level
            pokemon_v2_move {
              name
              accuracy
              power
              pp
              pokemon_v2_type {
                name
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://beta.pokeapi.co/graphql/v1beta', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables: { where } }),
    });

    if (!response.ok) {
        throw new Error('Falha ao buscar detalhes do Pokémon!');
    }

    const json = await response.json();
    const validResponse = pokeApiDetailedGraphQLSchema.parse(json);

    if (validResponse.data.pokemon_v2_pokemon.length === 0) {
        throw new Error('Pokémon não encontrado');
    }

    const data = validResponse.data.pokemon_v2_pokemon[0];

    const flavorTexts = data.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonspeciesflavortexts || [];
    const description = flavorTexts.length > 0 
        ? flavorTexts[0].flavor_text.replace(/[\n\f\r]/g, ' ') 
        : 'Descrição não disponível.';

    const speciesList = data.pokemon_v2_pokemonspecy?.pokemon_v2_evolutionchain?.pokemon_v2_pokemonspecies || [];
    const evolutionStages = groupByEvolutionStage(speciesList);

    // A API dá o fator em porcentagem (200 = 2×, 50 = ½×, 0 = imune)
    const typeMatchups = computeTypeMatchups(
        data.pokemon_v2_pokemontypes.map((t) =>
            t.pokemon_v2_type.pokemonV2TypeefficaciesByTargetTypeId.map((e) => ({
                attackingType: e.pokemon_v2_type.name,
                factor: e.damage_factor / 100
            }))
        )
    );

    return {
        name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
        number: `#${data.id.toString().padStart(3, '0')}`,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`,
        types: data.pokemon_v2_pokemontypes.map((t) => t.pokemon_v2_type.name),
        weight: data.weight / 10,
        height: data.height / 10,
        stats: data.pokemon_v2_pokemonstats.map((s) => ({
            name: s.pokemon_v2_stat.name,
            value: s.base_stat
        })),
        description,
        evolutionStages,
        typeMatchups,
        abilities: data.pokemon_v2_pokemonabilities.map((a) => ({
            name: a.pokemon_v2_ability.name,
            isHidden: a.is_hidden
        })),
        moves: data.pokemon_v2_pokemonmoves
          .map((m) => ({
            name: m.pokemon_v2_move.name,
            type: m.pokemon_v2_move.pokemon_v2_type.name,
            power: m.pokemon_v2_move.power,
            accuracy: m.pokemon_v2_move.accuracy,
            pp: m.pokemon_v2_move.pp,
            level: m.level
          }))
          .sort((a, b) => a.level - b.level)
    };
}