import { describe, expect, test } from 'bun:test';
import { conditionLabel, formatPlace, groupEncounters, methodLabel, type EncounterRow } from './encounters';

const row = (overrides: Partial<EncounterRow>): EncounterRow => ({
    versionId: 1,
    versionName: 'Red',
    areaId: 10,
    place: 'Viridian Forest',
    method: 'walk',
    rarity: 5,
    minLevel: 3,
    maxLevel: 3,
    conditions: [],
    ...overrides,
});

describe('groupEncounters', () => {
    test('soma os slots do mesmo local e método (Pikachu em Red: 4% + 1%)', () => {
        const [game] = groupEncounters([
            row({ rarity: 4, minLevel: 3, maxLevel: 3 }),
            row({ rarity: 1, minLevel: 5, maxLevel: 5 }),
        ]);

        expect(game.spots).toEqual([
            { place: 'Viridian Forest', method: 'walk', minLevel: 3, maxLevel: 5, chance: 5, conditions: [] },
        ]);
    });

    test('não soma condições diferentes: fica com a maior chance e lista os horários', () => {
        // Pidgey em Gold, National Park: dia 10+4+1 = 15%, manhã 10+5+4+1 = 20%
        const [game] = groupEncounters([
            row({ rarity: 10, conditions: ['time-day'] }),
            row({ rarity: 4, conditions: ['time-day'] }),
            row({ rarity: 1, conditions: ['time-day'] }),
            row({ rarity: 10, conditions: ['time-morning'] }),
            row({ rarity: 5, conditions: ['time-morning'] }),
            row({ rarity: 4, conditions: ['time-morning'] }),
            row({ rarity: 1, conditions: ['time-morning'] }),
        ]);

        expect(game.spots[0].chance).toBe(20);
        expect(game.spots[0].conditions).toEqual(['time-morning', 'time-day']);
    });

    test('esconde condições que são o padrão do jogo (swarm-no, radar-off...)', () => {
        const [game] = groupEncounters([
            row({ conditions: ['swarm-no', 'radar-off', 'slot2-none', 'radio-off'] }),
            row({ conditions: ['swarm-yes', 'radar-off'] }),
        ]);

        expect(game.spots[0].conditions).toEqual(['swarm-yes']);
    });

    test('chance nunca passa de 100%', () => {
        const [game] = groupEncounters([row({ rarity: 100, method: 'gift' }), row({ rarity: 100, method: 'gift' })]);
        expect(game.spots[0].chance).toBe(100);
    });

    test('jogos com os mesmos locais ficam juntos, na ordem dos jogos', () => {
        const games = groupEncounters([
            row({ versionId: 4, versionName: 'Gold', place: 'Route 1', areaId: 300 }),
            row({ versionId: 2, versionName: 'Blue' }),
            row({ versionId: 1, versionName: 'Red' }),
            row({ versionId: 3, versionName: 'Yellow', rarity: 50 }),
        ]);

        expect(games.map((g) => g.versions)).toEqual([['Red', 'Blue'], ['Yellow'], ['Gold']]);
    });

    test('locais em ordem natural de nome (Route 2 antes de Route 12) e separados por método', () => {
        const [game] = groupEncounters([
            row({ areaId: 5, place: 'Route 12' }),
            row({ areaId: 20, place: 'Route 2' }),
            row({ areaId: 10, place: 'Route 1', method: 'surf' }),
            row({ areaId: 10, place: 'Route 1', method: 'old-rod' }),
        ]);

        expect(game.spots.map((s) => `${s.place} ${s.method}`)).toEqual([
            'Route 1 old-rod',
            'Route 1 surf',
            'Route 2 walk',
            'Route 12 walk',
        ]);
    });

    test('sem encontros: lista vazia', () => {
        expect(groupEncounters([])).toEqual([]);
    });
});

describe('formatPlace', () => {
    test('área padrão vira só o nome do local', () => {
        expect(formatPlace('Viridian Forest', 'viridian-forest', 'viridian-forest-area')).toBe('Viridian Forest');
    });

    test('andares ficam em maiúsculas', () => {
        expect(formatPlace('Mt. Moon', 'mt-moon', 'mt-moon-1f')).toBe('Mt. Moon (1F)');
        expect(formatPlace('Mt. Moon', 'mt-moon', 'mt-moon-b2f')).toBe('Mt. Moon (B2F)');
    });

    test('sub-área por extenso', () => {
        expect(formatPlace('Route 2', 'kanto-route-2', 'kanto-route-2-south-towards-viridian-city'))
            .toBe('Route 2 (South Towards Viridian City)');
    });
});

describe('rótulos', () => {
    test('métodos conhecidos em português, desconhecidos formatados', () => {
        expect(methodLabel('walk')).toBe('Andando (mato ou caverna)');
        expect(methodLabel('old-rod')).toBe('Vara velha');
        expect(methodLabel('berry-piles')).toBe('Berry Piles');
    });

    test('condições', () => {
        expect(conditionLabel('time-night')).toBe('Noite');
        expect(conditionLabel('swarm-yes')).toBe('Enxame');
        expect(conditionLabel('slot2-firered')).toBe('FireRed no slot GBA');
    });
});
