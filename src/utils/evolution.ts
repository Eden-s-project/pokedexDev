// Uma forma de evoluir, como vem da PokéAPI (pokemon_v2_pokemonevolution), com os nomes em slug
export interface EvolutionCondition {
    trigger: string;            // level-up, use-item, trade, shed...
    minLevel: number | null;
    item: string | null;        // item usado (use-item)
    heldItem: string | null;    // item segurado
    minHappiness: number | null;
    minAffection: number | null;
    minBeauty: number | null;
    timeOfDay: string;          // '' quando não importa
    knownMove: string | null;
    knownMoveType: string | null;
    location: string | null;
    gender: string | null;
    needsRain: boolean;
    partySpecies: string | null;
    partyType: string | null;
    relativeStats: number | null; // 1: Ataque > Defesa, -1: Ataque < Defesa, 0: iguais
    tradeSpecies: string | null;
    upsideDown: boolean;
}

const titleCase = (slug: string) =>
    slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

// "a", "a ou b", "a, b ou c"
const joinOr = (items: string[]) =>
    items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} ou ${items[items.length - 1]}`;

const triggerLabels: Record<string, string> = {
    'trade': 'Troca',
    'shed': 'Vaga na equipe ao evoluir Nincada',
    'spin': 'Girar segurando um doce',
    'three-critical-hits': '3 golpes críticos numa batalha',
    'take-damage': 'Perder 49+ de HP e passar sob o arco',
    'tower-of-darkness': 'Torre da Escuridão',
    'tower-of-waters': 'Torre da Água',
};

const timeLabels: Record<string, string> = { day: 'de dia', night: 'à noite', dusk: 'ao entardecer' };
const genderLabels: Record<string, string> = { female: 'fêmea', male: 'macho' };
const relativeStatsLabels: Record<string, string> = { '1': 'Ataque > Defesa', '-1': 'Ataque < Defesa', '0': 'Ataque = Defesa' };

function baseLabel(c: EvolutionCondition): string {
    if (c.trigger === 'level-up') return c.minLevel !== null ? `Nv. ${c.minLevel}` : 'Subir de nível';
    if (c.trigger === 'use-item') return c.item ? titleCase(c.item) : 'Usar item';
    return triggerLabels[c.trigger] ?? titleCase(c.trigger);
}

// Condições extras, sem o local (os locais de várias versões são juntados num texto só)
function extraLabels(c: EvolutionCondition): string[] {
    return [
        c.heldItem && `segurando ${titleCase(c.heldItem)}`,
        c.tradeSpecies && `com ${titleCase(c.tradeSpecies)}`,
        c.minHappiness !== null && 'amizade alta',
        c.minAffection !== null && 'afeição alta',
        c.minBeauty !== null && 'beleza alta',
        timeLabels[c.timeOfDay],
        c.knownMove && `sabendo ${titleCase(c.knownMove)}`,
        c.knownMoveType && `sabendo golpe tipo ${titleCase(c.knownMoveType)}`,
        c.gender && genderLabels[c.gender],
        c.needsRain && 'com chuva',
        c.partySpecies && `com ${titleCase(c.partySpecies)} na equipe`,
        c.partyType && `com tipo ${titleCase(c.partyType)} na equipe`,
        c.relativeStats !== null && relativeStatsLabels[String(c.relativeStats)],
        c.upsideDown && 'console de cabeça para baixo',
    ].filter((label): label is string => typeof label === 'string' && label !== '');
}

const conditionLabel = (c: EvolutionCondition) => {
    const extras = extraLabels(c);
    return extras.length > 0 ? `${baseLabel(c)} · ${extras.join(', ')}` : baseLabel(c);
};

// Texto de como uma espécie evolui da anterior. A API lista uma linha por forma de evoluir,
// às vezes repetidas entre jogos (Milotic: beleza 170 e 171) ou variando só o local
// (Leafeon: Eterna Forest, Pinwheel Forest, Route 20); repetições somem e locais viram uma lista.
export function describeEvolutions(conditions: EvolutionCondition[]): string | null {
    const withoutLocation = conditions.filter((c) => c.location === null).map(conditionLabel);

    const locationsByLabel = conditions
        .filter((c): c is EvolutionCondition & { location: string } => c.location !== null)
        .reduce(
            (acc, c) => new Map(acc).set(conditionLabel(c), [...(acc.get(conditionLabel(c)) ?? []), titleCase(c.location)]),
            new Map<string, string[]>()
        );
    const withLocation = [...locationsByLabel].map(([label, places]) => `${label} em ${joinOr([...new Set(places)])}`);

    const labels = [...new Set([...withoutLocation, ...withLocation])];
    return labels.length > 0 ? labels.join(' ou ') : null;
}
