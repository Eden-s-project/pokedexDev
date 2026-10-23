import { describe, expect, test } from 'bun:test';
import { describeEvolutions, type EvolutionCondition } from './evolution';

// Valores reais da PokéAPI (pokemon_v2_pokemonevolution)
const evo = (overrides: Partial<EvolutionCondition>): EvolutionCondition => ({
    trigger: 'level-up',
    minLevel: null,
    item: null,
    heldItem: null,
    minHappiness: null,
    minAffection: null,
    minBeauty: null,
    timeOfDay: '',
    knownMove: null,
    knownMoveType: null,
    location: null,
    gender: null,
    needsRain: false,
    partySpecies: null,
    partyType: null,
    relativeStats: null,
    tradeSpecies: null,
    upsideDown: false,
    ...overrides,
});

describe('describeEvolutions', () => {
    test('espécie base (sem evolução anterior): null', () => {
        expect(describeEvolutions([])).toBeNull();
    });

    test.each([
        ['Ivysaur: nível', [evo({ minLevel: 16 })], 'Nv. 16'],
        ['Raichu: item', [evo({ trigger: 'use-item', item: 'thunder-stone' })], 'Thunder Stone'],
        ['Machamp: troca', [evo({ trigger: 'trade' })], 'Troca'],
        ['Espeon: amizade de dia', [evo({ minHappiness: 160, timeOfDay: 'day' })], 'Subir de nível · amizade alta, de dia'],
        ['Hitmontop: Ataque = Defesa', [evo({ minLevel: 20, relativeStats: 0 })], 'Nv. 20 · Ataque = Defesa'],
        ['Mantine: Remoraid na equipe', [evo({ partySpecies: 'remoraid' })], 'Subir de nível · com Remoraid na equipe'],
        ['Shedinja', [evo({ trigger: 'shed' })], 'Vaga na equipe ao evoluir Nincada'],
        ['Tangrowth: sabendo golpe', [evo({ knownMove: 'ancient-power' })], 'Subir de nível · sabendo Ancient Power'],
        ['Gallade: item + macho', [evo({ trigger: 'use-item', item: 'dawn-stone', gender: 'male' })], 'Dawn Stone · macho'],
        ['Escavalier: troca com espécie', [evo({ trigger: 'trade', tradeSpecies: 'shelmet' })], 'Troca · com Shelmet'],
        ['Malamar: de cabeça para baixo', [evo({ minLevel: 30, upsideDown: true })], 'Nv. 30 · console de cabeça para baixo'],
        ['Goodra: chuva', [evo({ minLevel: 50, needsRain: true })], 'Nv. 50 · com chuva'],
    ])('%s', (_, conditions, expected) => {
        expect(describeEvolutions(conditions)).toBe(expected);
    });

    test('Milotic: repetições somem e alternativas viram "ou"', () => {
        expect(describeEvolutions([
            evo({ minBeauty: 171 }),
            evo({ trigger: 'trade', heldItem: 'prism-scale' }),
            evo({ minBeauty: 170 }),
        ])).toBe('Subir de nível · beleza alta ou Troca · segurando Prism Scale');
    });

    test('Leafeon: locais de vários jogos viram uma lista só', () => {
        expect(describeEvolutions([
            evo({ location: 'eterna-forest' }),
            evo({ location: 'pinwheel-forest' }),
            evo({ location: 'kalos-route-20' }),
            evo({ trigger: 'use-item', item: 'leaf-stone' }),
        ])).toBe('Leaf Stone ou Subir de nível em Eterna Forest, Pinwheel Forest ou Kalos Route 20');
    });

    test('Sylveon: golpe tipo Fada com afeição ou com amizade', () => {
        expect(describeEvolutions([
            evo({ minAffection: 2, knownMoveType: 'fairy' }),
            evo({ minHappiness: 160, knownMoveType: 'fairy' }),
        ])).toBe('Subir de nível · afeição alta, sabendo golpe tipo Fairy ou Subir de nível · amizade alta, sabendo golpe tipo Fairy');
    });

    // Casos da geração 9 achados no code review, com os dados reais da API
    test('Palafin: gatilho "other" com nível mostra o nível', () => {
        expect(describeEvolutions([evo({ trigger: 'other', minLevel: 38 })])).toBe('Nv. 38');
    });

    test('gatilho "other" sem nível vira "Condição especial"', () => {
        expect(describeEvolutions([evo({ trigger: 'other' })])).toBe('Condição especial');
    });

    test('Ursaluna: lua cheia não some', () => {
        expect(describeEvolutions([evo({ trigger: 'use-item', item: 'peat-block', timeOfDay: 'full-moon' })]))
            .toBe('Peat Block · em noite de lua cheia');
    });

    test('Magnezone: "Subir de nível" solto some quando a mesma condição tem locais', () => {
        expect(describeEvolutions([
            evo({ location: 'mt-coronet' }),
            evo({ location: 'chargestone-cave' }),
            evo({ location: 'kalos-route-13' }),
            evo({}),
            evo({ trigger: 'use-item', item: 'thunder-stone' }),
        ])).toBe('Thunder Stone ou Subir de nível em Mt Coronet, Chargestone Cave ou Kalos Route 13');
    });

    test('valores desconhecidos aparecem formatados em vez de sumir', () => {
        expect(describeEvolutions([evo({ trigger: 'new-trigger', timeOfDay: 'eclipse' })]))
            .toBe('New Trigger · Eclipse');
    });
});
