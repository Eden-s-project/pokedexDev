import { describe, expect, test } from 'bun:test';
import { computeTypeMatchups, formatMultiplier, type DamageRelation } from './typeEffectiveness';

// Dados reais da PokéAPI (pokemonV2TypeefficaciesByTargetTypeId, fatores != 100)
const fire: DamageRelation[] = [
    { attackingType: 'ground', factor: 2 },
    { attackingType: 'rock', factor: 2 },
    { attackingType: 'bug', factor: 0.5 },
    { attackingType: 'steel', factor: 0.5 },
    { attackingType: 'fire', factor: 0.5 },
    { attackingType: 'water', factor: 2 },
    { attackingType: 'grass', factor: 0.5 },
    { attackingType: 'ice', factor: 0.5 },
    { attackingType: 'fairy', factor: 0.5 },
];

const flying: DamageRelation[] = [
    { attackingType: 'fighting', factor: 0.5 },
    { attackingType: 'ground', factor: 0 },
    { attackingType: 'rock', factor: 2 },
    { attackingType: 'bug', factor: 0.5 },
    { attackingType: 'grass', factor: 0.5 },
    { attackingType: 'electric', factor: 2 },
    { attackingType: 'ice', factor: 2 },
];

describe('computeTypeMatchups', () => {
    test('um tipo só: usa os fatores como vieram', () => {
        const result = computeTypeMatchups([fire]);

        expect(result.weaknesses).toEqual([
            { type: 'ground', multiplier: 2 },
            { type: 'rock', multiplier: 2 },
            { type: 'water', multiplier: 2 },
        ]);
        expect(result.resistances.map((m) => m.type)).toEqual(['bug', 'fairy', 'fire', 'grass', 'ice', 'steel']);
        expect(result.immunities).toEqual([]);
    });

    test('Charizard (fire/flying): multiplica os fatores dos dois tipos', () => {
        const result = computeTypeMatchups([fire, flying]);

        expect(result.weaknesses).toEqual([
            { type: 'rock', multiplier: 4 },
            { type: 'electric', multiplier: 2 },
            { type: 'water', multiplier: 2 },
        ]);
        expect(result.resistances).toEqual([
            { type: 'bug', multiplier: 0.25 },
            { type: 'grass', multiplier: 0.25 },
            { type: 'fairy', multiplier: 0.5 },
            { type: 'fighting', multiplier: 0.5 },
            { type: 'fire', multiplier: 0.5 },
            { type: 'steel', multiplier: 0.5 },
        ]);
        // Ground: 2 × 0 = imune
        expect(result.immunities).toEqual(['ground']);
    });

    test('fatores que se anulam viram neutros e somem (Ice em Charizard: ½ × 2)', () => {
        const result = computeTypeMatchups([fire, flying]);
        const allTypes = [
            ...result.weaknesses.map((m) => m.type),
            ...result.resistances.map((m) => m.type),
            ...result.immunities,
        ];

        expect(allTypes).not.toContain('ice');
    });

    test('sem relações: tudo vazio', () => {
        expect(computeTypeMatchups([])).toEqual({ weaknesses: [], resistances: [], immunities: [] });
    });
});

describe('formatMultiplier', () => {
    test.each([
        [4, '4×'],
        [2, '2×'],
        [0.5, '½×'],
        [0.25, '¼×'],
        [0, '0×'],
    ])('%p vira %p', (multiplier, label) => {
        expect(formatMultiplier(multiplier)).toBe(label);
    });
});
