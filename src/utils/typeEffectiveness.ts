// Fator de dano de um tipo de golpe contra UM tipo defensor (2 = 2×, 0.5 = ½×, 0 = imune)
export interface DamageRelation {
    attackingType: string;
    factor: number;
}

export interface Matchup {
    type: string;
    multiplier: number;
}

export interface TypeMatchups {
    weaknesses: Matchup[];   // > 1×, mais forte primeiro
    resistances: Matchup[];  // entre 0 e 1×, mais resistente primeiro
    immunities: string[];    // 0×
}

// Recebe uma lista de relações por tipo do Pokémon (1 ou 2 tipos). Para cada tipo
// defensor a API só lista os fatores diferentes de 1×; o multiplicador final de um tipo
// de golpe é o produto dos fatores dos dois tipos (Rock em Charizard: 2 × 2 = 4×;
// Ice: ½ × 2 = 1×, que some da lista por ser neutro).
export function computeTypeMatchups(relationsPerDefendingType: DamageRelation[][]): TypeMatchups {
    const multipliers = relationsPerDefendingType.flat().reduce<Record<string, number>>(
        (acc, { attackingType, factor }) => ({ ...acc, [attackingType]: (acc[attackingType] ?? 1) * factor }),
        {}
    );

    const matchups = Object.entries(multipliers).map(([type, multiplier]) => ({ type, multiplier }));

    return {
        weaknesses: matchups
            .filter((m) => m.multiplier > 1)
            .sort((a, b) => b.multiplier - a.multiplier || a.type.localeCompare(b.type)),
        resistances: matchups
            .filter((m) => m.multiplier > 0 && m.multiplier < 1)
            .sort((a, b) => a.multiplier - b.multiplier || a.type.localeCompare(b.type)),
        immunities: matchups
            .filter((m) => m.multiplier === 0)
            .map((m) => m.type)
            .sort(),
    };
}

const fractionLabels: Record<number, string> = { 0.5: '½', 0.25: '¼' };

export function formatMultiplier(multiplier: number): string {
    return `${fractionLabels[multiplier] ?? multiplier}×`;
}
