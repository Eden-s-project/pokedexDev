import { titleCase } from './text';

// Uma linha de encontro da PokéAPI, já com os nomes resolvidos
export interface EncounterRow {
    versionId: number;
    versionName: string;
    areaId: number;
    place: string;
    method: string;      // slug da API: walk, surf, old-rod...
    rarity: number;      // chance do slot, em %
    minLevel: number;
    maxLevel: number;
    conditions: string[]; // slugs: time-morning, swarm-yes...
}

// Um local + método dentro de um jogo, com as linhas (slots) já somadas
export interface EncounterSpot {
    place: string;
    method: string;
    minLevel: number;
    maxLevel: number;
    chance: number;
    conditions: string[]; // só as que importam para o jogador (sem swarm-no, radar-off...)
}

// Jogos com exatamente os mesmos locais ficam juntos (Red / Blue)
export interface GameEncounters {
    versions: string[];
    spots: EncounterSpot[];
}

// Condições que são o "normal" do jogo e não precisam aparecer na tela
const defaultConditions = new Set(['swarm-no', 'radar-off', 'radio-off', 'slot2-none']);

const conditionOrder = [
    'time-morning', 'time-day', 'time-night',
    'season-spring', 'season-summer', 'season-autumn', 'season-winter',
];

const byConditionOrder = (a: string, b: string) => {
    const ia = conditionOrder.indexOf(a);
    const ib = conditionOrder.indexOf(b);
    return (ia === -1 ? conditionOrder.length : ia) - (ib === -1 ? conditionOrder.length : ib) || a.localeCompare(b);
};

const groupBy = <T>(items: T[], keyOf: (item: T) => string): Map<string, T[]> =>
    items.reduce(
        (acc, item) => new Map(acc).set(keyOf(item), [...(acc.get(keyOf(item)) ?? []), item]),
        new Map<string, T[]>()
    );

// Soma os slots de um local + método. A API separa a mesma vaga por condição
// (manhã, dia, noite...): somar tudo passaria de 100%, então soma dentro de cada
// conjunto de condições e fica com o maior.
function toSpot(rows: EncounterRow[]): EncounterSpot {
    const chancePerConditionSet = [...groupBy(rows, (r) => [...r.conditions].sort().join('|')).values()]
        .map((set) => set.reduce((sum, r) => sum + r.rarity, 0));

    return {
        place: rows[0].place,
        method: rows[0].method,
        minLevel: Math.min(...rows.map((r) => r.minLevel)),
        maxLevel: Math.max(...rows.map((r) => r.maxLevel)),
        chance: Math.min(100, Math.max(...chancePerConditionSet)),
        conditions: [...new Set(rows.flatMap((r) => r.conditions))]
            .filter((c) => !defaultConditions.has(c))
            .sort(byConditionOrder),
    };
}

export function groupEncounters(rows: EncounterRow[]): GameEncounters[] {
    const perVersion = [...groupBy(rows, (r) => String(r.versionId)).values()]
        .sort((a, b) => a[0].versionId - b[0].versionId)
        .map((versionRows) => ({
            versionName: versionRows[0].versionName,
            // Ordem por nome com números naturais (Route 1, Route 2, Route 12): o id da área
            // não segue a ordem do jogo em Kanto
            spots: [...groupBy(versionRows, (r) => `${r.areaId}|${r.method}`).values()]
                .sort((a, b) =>
                    a[0].place.localeCompare(b[0].place, 'en', { numeric: true }) ||
                    a[0].method.localeCompare(b[0].method))
                .map(toSpot),
        }));

    // Junta versões com a mesma lista de locais, mantendo a ordem da primeira
    const merged = groupBy(perVersion, (v) => JSON.stringify(v.spots));
    return [...merged.values()].map((group) => ({
        versions: group.map((v) => v.versionName),
        spots: group[0].spots,
    }));
}

// "mt-moon" + "mt-moon-1f" -> "Mt. Moon (1F)"; área "...-area" sem sufixo vira só o local
export function formatPlace(locationLabel: string, locationSlug: string, areaSlug: string): string {
    const suffix = areaSlug.replace(new RegExp(`^${locationSlug}-?`), '').replace(/-?area$/, '');
    if (!suffix) return locationLabel;

    const words = suffix.split('-').map((word) =>
        /^b?\d+f$/.test(word) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)
    );
    return `${locationLabel} (${words.join(' ')})`;
}

const methodLabels: Record<string, string> = {
    'walk': 'Andando (mato ou caverna)',
    'dark-grass': 'Mato escuro',
    'surf': 'Surfando',
    'old-rod': 'Vara velha',
    'good-rod': 'Vara boa',
    'super-rod': 'Super vara',
    'rock-smash': 'Rock Smash',
    'headbutt': 'Headbutt',
    'headbutt-low': 'Headbutt',
    'headbutt-normal': 'Headbutt',
    'headbutt-high': 'Headbutt',
    'gift': 'Presente',
    'gift-egg': 'Ovo de presente',
    'only-one': 'Encontro único',
    'npc-trade': 'Troca com NPC',
    'roaming-grass': 'Errante (mato)',
    'roaming-water': 'Errante (água)',
    'sos-encounter': 'Chamado SOS',
};

const conditionLabels: Record<string, string> = {
    'time-morning': 'Manhã',
    'time-day': 'Dia',
    'time-night': 'Noite',
    'season-spring': 'Primavera',
    'season-summer': 'Verão',
    'season-autumn': 'Outono',
    'season-winter': 'Inverno',
    'swarm-yes': 'Enxame',
    'radar-on': 'Poké Radar',
    'radio-hoenn': 'Rádio de Hoenn',
    'radio-sinnoh': 'Rádio de Sinnoh',
};


export function methodLabel(method: string): string {
    return methodLabels[method] ?? titleCase(method);
}

const gbaCartridges: Record<string, string> = {
    ruby: 'Ruby',
    sapphire: 'Sapphire',
    emerald: 'Emerald',
    firered: 'FireRed',
    leafgreen: 'LeafGreen',
};

export function conditionLabel(condition: string): string {
    // slot2-firered -> "FireRed no slot GBA" (Pokémon que só aparecem com o cartucho no DS)
    if (condition.startsWith('slot2-')) {
        const cartridge = condition.slice(6);
        return `${gbaCartridges[cartridge] ?? titleCase(cartridge)} no slot GBA`;
    }
    return conditionLabels[condition] ?? titleCase(condition);
}
