import { z } from 'zod';
import { computeTypeMatchups, type TypeMatchups } from '../utils/typeEffectiveness';
import { formatPlace, groupEncounters, type EncounterRow, type GameEncounters } from '../utils/encounters';
import { describeEvolutions, type EvolutionCondition } from '../utils/evolution';
import type { EvYieldEntry, SpeciesInfo } from '../utils/speciesInfo';
import { titleCase } from '../utils/text';

// Endpoint GraphQL da PokéAPI. O antigo (beta.pokeapi.co/graphql/v1beta) passou a responder 401.
const POKEAPI_GRAPHQL_URL = 'https://graphql.pokeapi.co/v1beta2';

const pokeApiGraphQLSchema = z.object({
    data: z.object({
        pokemon: z.array(
            z.object({
                id: z.number(),
                name: z.string(),
                pokemontypes: z.array(
                    z.object({
                        type: z.object({
                            name: z.string()
                        })
                    })
                )
            })
        )
    })
});

const nameSchema = z.object({ name: z.string() }).nullable();

const evolutionSpeciesSchema = z.object({
    id: z.number(),
    name: z.string(),
    evolves_from_species_id: z.number().nullable(),
    // Formas de evoluir a partir da espécie anterior (vazio na espécie base)
    pokemonevolutions: z.array(
        z.object({
            min_level: z.number().nullable(),
            min_happiness: z.number().nullable(),
            min_affection: z.number().nullable(),
            min_beauty: z.number().nullable(),
            time_of_day: z.string().nullable(),
            needs_overworld_rain: z.boolean().nullable(),
            turn_upside_down: z.boolean().nullable(),
            relative_physical_stats: z.number().nullable(),
            evolutiontrigger: nameSchema,
            item: nameSchema,
            ItemByHeldItemId: nameSchema,
            move: nameSchema,
            type: nameSchema,
            location: nameSchema,
            gender: nameSchema,
            PokemonspecyByPartySpeciesId: nameSchema,
            TypeByPartyTypeId: nameSchema,
            PokemonspecyByTradeSpeciesId: nameSchema
        })
    )
});

export type EvolutionSpecies = z.infer<typeof evolutionSpeciesSchema>;

const pokeApiDetailedGraphQLSchema = z.object({
    data: z.object({
        pokemon: z.array(
            z.object({
                id: z.number(),
                name: z.string(),
                height: z.number(),
                weight: z.number(),
                base_experience: z.number().nullable(),
                pokemonspecy: z.object({
                    gender_rate: z.number(),
                    capture_rate: z.number(),
                    base_happiness: z.number().nullable(),
                    hatch_counter: z.number().nullable(),
                    is_legendary: z.boolean(),
                    is_mythical: z.boolean(),
                    is_baby: z.boolean(),
                    growthrate: nameSchema,
                    pokemonhabitat: nameSchema,
                    pokemonspeciesnames: z.array(z.object({ genus: z.string() })),
                    pokemonegggroups: z.array(
                        z.object({ egggroup: nameSchema })
                    ),
                    pokemonspeciesflavortexts: z.array(
                        z.object({
                            flavor_text: z.string()
                        })
                    ),
                    evolutionchain: z.object({
                        pokemonspecies: z.array(evolutionSpeciesSchema)
                    }).nullable()
                }).nullable(),
                pokemonstats: z.array(
                    z.object({
                        base_stat: z.number(),
                        effort: z.number(),
                        stat: z.object({
                            name: z.string()
                        })
                    })
                ),
                pokemontypes: z.array(
                    z.object({
                        type: z.object({
                            name: z.string(),
                            // Golpes que acertam este tipo com fator != 100 (type = tipo do golpe)
                            TypeefficaciesByTargetTypeId: z.array(
                                z.object({
                                    damage_factor: z.number(),
                                    type: z.object({
                                        name: z.string()
                                    })
                                })
                            )
                        })
                    })
                ),
                pokemonabilities: z.array(
                    z.object({
                        is_hidden: z.boolean(),
                        ability: z.object({
                            name: z.string()
                        })
                    })
                ),
                pokemonmoves: z.array(
                    z.object({
                        level: z.number(),
                        move: z.object({
                            name: z.string(),
                            accuracy: z.number().nullable(),
                            power: z.number().nullable(),
                            pp: z.number().nullable(),
                            type: z.object({
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
        pokemon(limit: 1025) {
          id
          name
          pokemontypes {
            type {
              name
            }
          }
        }
      }
    `;

    const response = await fetch(POKEAPI_GRAPHQL_URL, {
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
    return validResponse.data.pokemon.map((pokemon) => {
        return {
            name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
            number: `#${pokemon.id.toString().padStart(3, '0')}`,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
            types: pokemon.pokemontypes.map((t) => t.type.name)
        };
    });
}

export interface EvolutionNode {
    id: number;
    name: string;
    image: string;
    condition: string | null; // como evolui da anterior ("Nv. 16", "Thunder Stone"...); null na base
}

const toEvolutionCondition = (e: EvolutionSpecies['pokemonevolutions'][number]): EvolutionCondition => ({
    trigger: e.evolutiontrigger?.name ?? 'other',
    minLevel: e.min_level,
    item: e.item?.name ?? null,
    heldItem: e.ItemByHeldItemId?.name ?? null,
    minHappiness: e.min_happiness,
    minAffection: e.min_affection,
    minBeauty: e.min_beauty,
    timeOfDay: e.time_of_day ?? '',
    knownMove: e.move?.name ?? null,
    knownMoveType: e.type?.name ?? null,
    location: e.location?.name ?? null,
    gender: e.gender?.name ?? null,
    needsRain: e.needs_overworld_rain ?? false,
    partySpecies: e.PokemonspecyByPartySpeciesId?.name ?? null,
    partyType: e.TypeByPartyTypeId?.name ?? null,
    relativeStats: e.relative_physical_stats,
    tradeSpecies: e.PokemonspecyByTradeSpeciesId?.name ?? null,
    upsideDown: e.turn_upside_down ?? false
});

export interface PokemonDetailedData extends PokemonSimpleData {
    id: number;
    weight: number;
    height: number;
    stats: { name: string; value: number }[];
    description: string;
    // Cada posição é um estágio: [base], [1ª evolução], [2ª evolução]
    evolutionStages: EvolutionNode[][];
    typeMatchups: TypeMatchups;
    species: SpeciesInfo | null;
    baseExperience: number | null;
    evYield: EvYieldEntry[]; // EVs dados ao ser derrotado
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
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${s.id}.png`,
                condition: describeEvolutions(s.pokemonevolutions.map(toEvolutionCondition))
            }))
    );
}

// --------------------------------------------------------
// Nova função para buscar os dados completos de 1 Pokémon
// Aceita o nome ("pikachu") ou o número ("25") vindo da URL
// --------------------------------------------------------
// Mensagem do erro de "não existe": a página usa para mostrar aviso próprio e não repetir a busca
export const POKEMON_NOT_FOUND = 'Pokémon não encontrado';

export async function fetchPokemonByName(name: string): Promise<PokemonDetailedData> {
    // O valor vai como variável do GraphQL, nunca colado no texto da query
    const where = /^\d+$/.test(name)
        ? { id: { _eq: Number(name) } }
        : { name: { _eq: name.toLowerCase() } };

    const query = `
      query ($where: pokemon_bool_exp!) {
        pokemon(where: $where) {
          id
          name
          height
          weight
          base_experience
          pokemonspecy {
            gender_rate
            capture_rate
            base_happiness
            hatch_counter
            is_legendary
            is_mythical
            is_baby
            growthrate { name }
            pokemonhabitat { name }
            pokemonspeciesnames(where: {language_id: {_eq: 9}}) { genus }
            pokemonegggroups { egggroup { name } }
            pokemonspeciesflavortexts(where: {language_id: {_eq: 9}}, order_by: {version_id: desc}, limit: 1) {
              flavor_text
            }
            evolutionchain {
              pokemonspecies(order_by: {id: asc}) {
                id
                name
                evolves_from_species_id
                pokemonevolutions {
                  min_level
                  min_happiness
                  min_affection
                  min_beauty
                  time_of_day
                  needs_overworld_rain
                  turn_upside_down
                  relative_physical_stats
                  evolutiontrigger { name }
                  item { name }
                  ItemByHeldItemId { name }
                  move { name }
                  type { name }
                  location { name }
                  gender { name }
                  PokemonspecyByPartySpeciesId { name }
                  TypeByPartyTypeId { name }
                  PokemonspecyByTradeSpeciesId { name }
                }
              }
            }
          }
          pokemonstats {
            base_stat
            effort
            stat {
              name
            }
          }
          pokemontypes {
            type {
              name
              TypeefficaciesByTargetTypeId(where: {damage_factor: {_neq: 100}}) {
                damage_factor
                type {
                  name
                }
              }
            }
          }
          pokemonabilities {
            is_hidden
            ability {
              name
            }
          }
          pokemonmoves(where: {movelearnmethod: {name: {_eq: "level-up"}}}, distinct_on: move_id) {
            level
            move {
              name
              accuracy
              power
              pp
              type {
                name
              }
            }
          }
        }
      }
    `;

    const response = await fetch(POKEAPI_GRAPHQL_URL, {
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

    if (validResponse.data.pokemon.length === 0) {
        throw new Error(POKEMON_NOT_FOUND);
    }

    const data = validResponse.data.pokemon[0];
    const specy = data.pokemonspecy;

    const flavorTexts = data.pokemonspecy?.pokemonspeciesflavortexts || [];
    const description = flavorTexts.length > 0 
        ? flavorTexts[0].flavor_text.replace(/[\n\f\r]/g, ' ') 
        : 'Descrição não disponível.';

    const speciesList = data.pokemonspecy?.evolutionchain?.pokemonspecies || [];
    const evolutionStages = groupByEvolutionStage(speciesList);

    // A API dá o fator em porcentagem (200 = 2×, 50 = ½×, 0 = imune)
    const typeMatchups = computeTypeMatchups(
        data.pokemontypes.map((t) =>
            t.type.TypeefficaciesByTargetTypeId.map((e) => ({
                attackingType: e.type.name,
                factor: e.damage_factor / 100
            }))
        )
    );

    return {
        id: data.id,
        name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
        number: `#${data.id.toString().padStart(3, '0')}`,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`,
        types: data.pokemontypes.map((t) => t.type.name),
        weight: data.weight / 10,
        height: data.height / 10,
        stats: data.pokemonstats.map((s) => ({
            name: s.stat.name,
            value: s.base_stat
        })),
        description,
        evolutionStages,
        typeMatchups,
        species: specy && {
            genus: specy.pokemonspeciesnames[0]?.genus ?? null,
            genderRate: specy.gender_rate,
            captureRate: specy.capture_rate,
            baseHappiness: specy.base_happiness,
            hatchCounter: specy.hatch_counter,
            growthRate: specy.growthrate?.name ?? null,
            habitat: specy.pokemonhabitat?.name ?? null,
            eggGroups: specy.pokemonegggroups.flatMap((g) => g.egggroup?.name ?? []),
            isLegendary: specy.is_legendary,
            isMythical: specy.is_mythical,
            isBaby: specy.is_baby
        },
        baseExperience: data.base_experience,
        evYield: data.pokemonstats
            .filter((s) => s.effort > 0)
            .map((s) => ({ name: s.stat.name, value: s.effort })),
        abilities: data.pokemonabilities.map((a) => ({
            name: a.ability.name,
            isHidden: a.is_hidden
        })),
        moves: data.pokemonmoves
          .map((m) => ({
            name: m.move.name,
            type: m.move.type.name,
            power: m.move.power,
            accuracy: m.move.accuracy,
            pp: m.move.pp,
            level: m.level
          }))
          .sort((a, b) => a.level - b.level)
    };
}

// --------------------------------------------------------
// Descrição de 1 golpe ou habilidade (aberta no diálogo)
// A PokéAPI não tem esses textos em pt-BR, então vêm em inglês (language_id 9)
// --------------------------------------------------------
const effectTextSchema = z.object({ short_effect: z.string() });
const flavorTextSchema = z.object({ flavor_text: z.string() });

const moveDescriptionSchema = z.object({
    data: z.object({
        move: z.array(
            z.object({
                move_effect_chance: z.number().nullable(),
                movedamageclass: z.object({ name: z.string() }).nullable(),
                moveeffect: z.object({
                    moveeffecteffecttexts: z.array(effectTextSchema)
                }).nullable(),
                moveflavortexts: z.array(flavorTextSchema)
            })
        )
    })
});

const abilityDescriptionSchema = z.object({
    data: z.object({
        ability: z.array(
            z.object({
                abilityeffecttexts: z.array(effectTextSchema),
                abilityflavortexts: z.array(flavorTextSchema)
            })
        )
    })
});

export interface SkillRef {
    kind: 'move' | 'ability';
    name: string;
}

export interface SkillDescription {
    flavorText: string | null;
    effect: string | null;
    damageClass: string | null; // só golpes: physical, special ou status
}

// Os textos da API vêm com quebras de linha do cartucho e espaços duplos
function cleanText(text: string): string {
    return text.replace(/[\n\f\r]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function postGraphQL(query: string, variables: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(POKEAPI_GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
        throw new Error('Falha ao buscar a descrição!');
    }

    return response.json();
}

async function fetchMoveDescription(name: string): Promise<SkillDescription> {
    // Pega o texto do jogo mais recente (maior version_group_id)
    const query = `
      query ($name: String!) {
        move(where: {name: {_eq: $name}}) {
          move_effect_chance
          movedamageclass {
            name
          }
          moveeffect {
            moveeffecteffecttexts(where: {language_id: {_eq: 9}}) {
              short_effect
            }
          }
          moveflavortexts(where: {language_id: {_eq: 9}}, order_by: {version_group_id: desc}, limit: 1) {
            flavor_text
          }
        }
      }
    `;

    const json = await postGraphQL(query, { name });
    const move = moveDescriptionSchema.parse(json).data.move[0];

    if (!move) {
        throw new Error('Golpe não encontrado');
    }

    const shortEffect = move.moveeffect?.moveeffecteffecttexts[0]?.short_effect;
    const flavorText = move.moveflavortexts[0]?.flavor_text;

    return {
        flavorText: flavorText ? cleanText(flavorText) : null,
        // "$effect_chance% chance to paralyze" -> "10% chance to paralyze"
        effect: shortEffect
            ? cleanText(shortEffect.replaceAll('$effect_chance', String(move.move_effect_chance ?? '')))
            : null,
        damageClass: move.movedamageclass?.name ?? null
    };
}

async function fetchAbilityDescription(name: string): Promise<SkillDescription> {
    const query = `
      query ($name: String!) {
        ability(where: {name: {_eq: $name}}) {
          abilityeffecttexts(where: {language_id: {_eq: 9}}) {
            short_effect
          }
          abilityflavortexts(where: {language_id: {_eq: 9}}, order_by: {version_group_id: desc}, limit: 1) {
            flavor_text
          }
        }
      }
    `;

    const json = await postGraphQL(query, { name });
    const ability = abilityDescriptionSchema.parse(json).data.ability[0];

    if (!ability) {
        throw new Error('Habilidade não encontrada');
    }

    const shortEffect = ability.abilityeffecttexts[0]?.short_effect;
    const flavorText = ability.abilityflavortexts[0]?.flavor_text;

    return {
        flavorText: flavorText ? cleanText(flavorText) : null,
        effect: shortEffect ? cleanText(shortEffect) : null,
        damageClass: null
    };
}

export function fetchSkillDescription(skill: SkillRef): Promise<SkillDescription> {
    return skill.kind === 'move'
        ? fetchMoveDescription(skill.name)
        : fetchAbilityDescription(skill.name);
}

// --------------------------------------------------------
// Onde encontrar o Pokémon em cada jogo
// A PokéAPI só tem esses dados até Ultra Sun/Ultra Moon (geração 7)
// --------------------------------------------------------
const encountersSchema = z.object({
    data: z.object({
        encounters: z.array(
            z.object({
                min_level: z.number(),
                max_level: z.number(),
                version_id: z.number(),
                location_area_id: z.number(),
                encounterslot: z.object({
                    rarity: z.number().nullable(),
                    encounter_method_id: z.number()
                }).nullable(),
                encounterconditionvaluemaps: z.array(
                    z.object({
                        encounterconditionvalue: z.object({ name: z.string() })
                    })
                )
            })
        ),
        areas: z.array(
            z.object({
                id: z.number(),
                name: z.string(),
                location: z.object({
                    name: z.string(),
                    locationnames: z.array(z.object({ name: z.string() }))
                }).nullable()
            })
        ),
        versions: z.array(
            z.object({
                id: z.number(),
                name: z.string(),
                versionnames: z.array(z.object({ name: z.string() }))
            })
        ),
        methods: z.array(z.object({ id: z.number(), name: z.string() }))
    })
});

export async function fetchPokemonEncounters(pokemonId: number): Promise<GameEncounters[]> {
    // Linhas enxutas (só ids) + nomes de áreas, jogos e métodos uma vez cada:
    // o Zubat sozinho tem mais de 1.200 linhas de encontro
    const query = `
      query ($id: Int!) {
        encounters: encounter(where: {pokemon_id: {_eq: $id}}) {
          min_level
          max_level
          version_id
          location_area_id
          encounterslot {
            rarity
            encounter_method_id
          }
          encounterconditionvaluemaps {
            encounterconditionvalue {
              name
            }
          }
        }
        areas: locationarea(where: {encounters: {pokemon_id: {_eq: $id}}}) {
          id
          name
          location {
            name
            locationnames(where: {language_id: {_eq: 9}}) {
              name
            }
          }
        }
        versions: version(where: {encounters: {pokemon_id: {_eq: $id}}}) {
          id
          name
          versionnames(where: {language_id: {_eq: 9}}) {
            name
          }
        }
        methods: encountermethod {
          id
          name
        }
      }
    `;

    const json = await postGraphQL(query, { id: pokemonId });
    const { encounters, areas, versions, methods } = encountersSchema.parse(json).data;

    const placeById = new Map(areas.map((area) => {
        const location = area.location;
        const locationLabel = location?.locationnames[0]?.name ?? titleCase(location?.name ?? area.name);
        return [area.id, formatPlace(locationLabel, location?.name ?? '', area.name)];
    }));
    const versionNameById = new Map(versions.map((v) => [v.id, v.versionnames[0]?.name ?? titleCase(v.name)]));
    const methodById = new Map(methods.map((m) => [m.id, m.name]));

    const rows: EncounterRow[] = encounters.map((e) => ({
        versionId: e.version_id,
        versionName: versionNameById.get(e.version_id) ?? `Versão ${e.version_id}`,
        areaId: e.location_area_id,
        place: placeById.get(e.location_area_id) ?? `Área ${e.location_area_id}`,
        method: methodById.get(e.encounterslot?.encounter_method_id ?? -1) ?? 'unknown',
        rarity: e.encounterslot?.rarity ?? 0,
        minLevel: e.min_level,
        maxLevel: e.max_level,
        conditions: e.encounterconditionvaluemaps.map((c) => c.encounterconditionvalue.name)
    }));

    return groupEncounters(rows);
}