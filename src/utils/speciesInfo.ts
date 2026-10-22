import { titleCase } from './text';

// Dados da espécie (pokemon_v2_pokemonspecies) usados na ficha
export interface SpeciesInfo {
    genus: string | null;        // "Flame Pokémon" (a API não tem pt-BR)
    genderRate: number;          // -1 = sem gênero; 0..8 = oitavos de fêmea
    captureRate: number;         // 0..255
    baseHappiness: number | null;
    hatchCounter: number | null; // ciclos de ovo
    growthRate: string | null;
    habitat: string | null;      // só existe para as gerações 1 a 3
    eggGroups: string[];
    isLegendary: boolean;
    isMythical: boolean;
    isBaby: boolean;
}

const percent = (value: number) => `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

export function genderLabel(genderRate: number): string {
    if (genderRate < 0) return 'Sem gênero';
    const female = (genderRate / 8) * 100;
    if (female === 0) return '100% ♂';
    if (female === 100) return '100% ♀';
    return `${percent(100 - female)} ♂ · ${percent(female)} ♀`;
}

// Chance de captura com Poké Ball, HP cheio e sem status (fórmula das gerações 3 e 4):
// a = ⌊taxa / 3⌋ e a chance ≈ a / 255 (as 4 "balançadas" da bola dão quase exatamente isso)
export function catchChance(captureRate: number): number {
    const a = Math.floor(captureRate / 3);
    return Math.min(100, (a / 255) * 100);
}

export function catchChanceLabel(captureRate: number): string {
    const chance = catchChance(captureRate);
    const shown = chance > 0 && chance < 0.1 ? '< 0,1%' : percent(Math.round(chance * 10) / 10);
    return `${captureRate} (≈ ${shown} com Poké Ball e HP cheio)`;
}

const growthRateLabels: Record<string, string> = {
    'slow': 'Lento',
    'medium': 'Médio',
    'fast': 'Rápido',
    'medium-slow': 'Médio-lento',
    'slow-then-very-fast': 'Errático',
    'fast-then-very-slow': 'Flutuante',
};

const habitatLabels: Record<string, string> = {
    'cave': 'Caverna',
    'forest': 'Floresta',
    'grassland': 'Campo',
    'mountain': 'Montanha',
    'rare': 'Raro',
    'rough-terrain': 'Terreno acidentado',
    'sea': 'Mar',
    'urban': 'Cidade',
    'waters-edge': "Beira d'água",
};

// Slugs da API: "ground" é o grupo Field, "humanshape" é Human-Like, "indeterminate" é Amorphous
const eggGroupLabels: Record<string, string> = {
    'monster': 'Monstro',
    'water1': 'Água 1',
    'water2': 'Água 2',
    'water3': 'Água 3',
    'bug': 'Inseto',
    'flying': 'Voador',
    'ground': 'Campo',
    'fairy': 'Fada',
    'plant': 'Planta',
    'humanshape': 'Humanoide',
    'mineral': 'Mineral',
    'indeterminate': 'Amorfo',
    'ditto': 'Ditto',
    'dragon': 'Dragão',
    'no-eggs': 'Não procria',
};

const statLabels: Record<string, string> = {
    'hp': 'HP',
    'attack': 'Ataque',
    'defense': 'Defesa',
    'special-attack': 'Ataque Esp.',
    'special-defense': 'Defesa Esp.',
    'speed': 'Velocidade',
};


export const growthRateLabel = (slug: string) => growthRateLabels[slug] ?? titleCase(slug);
export const habitatLabel = (slug: string) => habitatLabels[slug] ?? titleCase(slug);
export const eggGroupLabel = (slug: string) => eggGroupLabels[slug] ?? titleCase(slug);

// EVs que o Pokémon dá ao ser derrotado: "+3 Ataque Esp." ou "+1 HP, +1 Ataque"
export function evYieldLabel(evYield: { name: string; value: number }[]): string {
    return evYield.map((ev) => `+${ev.value} ${statLabels[ev.name] ?? titleCase(ev.name)}`).join(', ');
}
