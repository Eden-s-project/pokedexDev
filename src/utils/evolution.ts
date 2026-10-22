import { titleCase } from './text';

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
    // Gatilhos da geração 9 / Legends: Arceus
    'other': 'Condição especial',
    'agile-style-move': 'Usar golpe em estilo Ágil',
    'strong-style-move': 'Usar golpe em estilo Forte',
    'recoil-damage': 'Receber dano de recuo',
};

const timeLabels: Record<string, string> = {
    'day': 'de dia',
    'night': 'à noite',
    'dusk': 'ao entardecer',
    'full-moon': 'em noite de lua cheia',
};
const genderLabels: Record<string, string> = { female: 'fêmea', male: 'macho' };
const relativeStatsLabels: Record<string, string> = { '1': 'Ataque > Defesa', '-1': 'Ataque < Defesa', '0': 'Ataque = Defesa' };

// Valor que o mapa não conhece vira o slug formatado: nunca some da tela
const labelOrSlug = (labels: Record<string, string>, slug: string) => labels[slug] ?? titleCase(slug);

function baseLabel(c: EvolutionCondition): string {
    if (c.trigger === 'use-item') return c.item ? titleCase(c.item) : 'Usar item';
    // "other" com nível é evolução por nível com regra extra fora da API (Palafin Nv. 38, Maushold Nv. 25)
    if (c.minLevel !== null && (c.trigger === 'level-up' || c.trigger === 'other')) return `Nv. ${c.minLevel}`;
    if (c.trigger === 'level-up') return 'Subir de nível';
    return labelOrSlug(triggerLabels, c.trigger);
}

// Condições extras, sem o local (os locais de várias versões são juntados num texto só)
function extraLabels(c: EvolutionCondition): string[] {
    return [
        c.heldItem && `segurando ${titleCase(c.heldItem)}`,
        c.tradeSpecies && `com ${titleCase(c.tradeSpecies)}`,
        c.minHappiness !== null && 'amizade alta',
        c.minAffection !== null && 'afeição alta',
        c.minBeauty !== null && 'beleza alta',
        c.timeOfDay && labelOrSlug(timeLabels, c.timeOfDay),
        c.knownMove && `sabendo ${titleCase(c.knownMove)}`,
        c.knownMoveType && `sabendo golpe tipo ${titleCase(c.knownMoveType)}`,
        c.gender && labelOrSlug(genderLabels, c.gender),
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
    // Texto montado uma vez por linha
    const labeled = conditions.map((c) => ({ label: conditionLabel(c), location: c.location }));

    const placesByLabel = labeled
        .filter((row): row is { label: string; location: string } => row.location !== null)
        .map((row) => ({ label: row.label, place: titleCase(row.location) }));
    const labelsWithPlace = [...new Set(placesByLabel.map((row) => row.label))];

    const withLocation = labelsWithPlace.map((label) => {
        const places = [...new Set(placesByLabel.filter((row) => row.label === label).map((row) => row.place))];
        return `${label} em ${joinOr(places)}`;
    });

    // Linha igual sem local some quando a mesma condição tem locais: "Subir de nível" solto
    // do Magnezone ficava parecendo que vale em qualquer lugar
    const withoutLocation = labeled
        .filter((row) => row.location === null && !labelsWithPlace.includes(row.label))
        .map((row) => row.label);

    const labels = [...new Set([...withoutLocation, ...withLocation])];
    return labels.length > 0 ? labels.join(' ou ') : null;
}
