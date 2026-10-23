import { describe, expect, test } from 'bun:test';
import {
    catchChance,
    catchChanceLabel,
    eggGroupLabel,
    evYieldLabel,
    genderLabel,
    growthRateLabel,
    habitatLabel,
} from './speciesInfo';

describe('genderLabel', () => {
    test.each([
        [-1, 'Sem gênero'],           // Mewtwo
        [0, '100% ♂'],                // Tauros
        [8, '100% ♀'],                // Chansey
        [1, '87,5% ♂ · 12,5% ♀'],     // Charizard
        [4, '50% ♂ · 50% ♀'],         // Pikachu
        [6, '25% ♂ · 75% ♀'],         // Clefairy
    ])('gender_rate %p vira %p', (rate, label) => {
        expect(genderLabel(rate)).toBe(label);
    });
});

describe('catchChance', () => {
    test('Pidgey (255) ≈ 33,3%; Charizard (45) ≈ 5,9%; Mewtwo (3) ≈ 0,4%', () => {
        expect(catchChance(255)).toBeCloseTo(33.33, 1);
        expect(catchChance(45)).toBeCloseTo(5.88, 1);
        expect(catchChance(3)).toBeCloseTo(0.39, 1);
    });

    test('rótulo traz a taxa e a chance em formato brasileiro', () => {
        expect(catchChanceLabel(45)).toBe('45 (≈ 5,9% com Poké Ball e HP cheio)');
        expect(catchChanceLabel(3)).toBe('3 (≈ 0,4% com Poké Ball e HP cheio)');
    });

    test('taxa abaixo de 3 dá chance quase zero', () => {
        expect(catchChanceLabel(1)).toBe('1 (≈ 0% com Poké Ball e HP cheio)');
    });
});

describe('rótulos', () => {
    test('crescimento, habitat e grupos de ovo em português', () => {
        expect(growthRateLabel('medium-slow')).toBe('Médio-lento');
        expect(growthRateLabel('slow-then-very-fast')).toBe('Errático');
        expect(habitatLabel('waters-edge')).toBe("Beira d'água");
        expect(eggGroupLabel('ground')).toBe('Campo');
        expect(eggGroupLabel('no-eggs')).toBe('Não procria');
    });

    test('valor desconhecido vira slug formatado', () => {
        expect(habitatLabel('space-station')).toBe('Space Station');
    });

    test('EVs', () => {
        expect(evYieldLabel([{ name: 'special-attack', value: 3 }])).toBe('+3 Ataque Esp.');
        expect(evYieldLabel([{ name: 'hp', value: 1 }, { name: 'attack', value: 1 }])).toBe('+1 HP, +1 Ataque');
    });
});
