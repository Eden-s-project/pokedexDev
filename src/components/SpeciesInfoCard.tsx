import type { PokemonDetailedData } from '../services/pokemon';
import {
    catchChanceLabel,
    eggGroupLabel,
    evYieldLabel,
    genderLabel,
    growthRateLabel,
    habitatLabel,
} from '../utils/speciesInfo';

interface SpeciesInfoCardProps {
    pokemon: PokemonDetailedData;
}

export function SpeciesInfoCard({ pokemon }: SpeciesInfoCardProps) {
    const { species, evYield, baseExperience } = pokemon;
    if (!species) return null;

    const defeatParts = [
        evYield.length > 0 ? evYieldLabel(evYield) : null,
        baseExperience !== null ? `${baseExperience} XP base` : null,
    ].filter((part): part is string => part !== null);

    // Linhas sem valor (habitat só existe até a geração 3, por exemplo) não aparecem
    const rows = [
        { label: 'Categoria', value: species.genus },
        { label: 'Sexo', value: genderLabel(species.genderRate) },
        { label: 'Taxa de captura', value: catchChanceLabel(species.captureRate) },
        { label: 'Crescimento', value: species.growthRate && growthRateLabel(species.growthRate) },
        { label: 'Grupos de ovo', value: species.eggGroups.map(eggGroupLabel).join(', ') || null },
        { label: 'Ciclos de ovo', value: species.hatchCounter !== null ? `${species.hatchCounter} ciclos` : null },
        { label: 'Amizade inicial', value: species.baseHappiness !== null ? String(species.baseHappiness) : null },
        { label: 'Habitat', value: species.habitat && habitatLabel(species.habitat) },
        { label: 'Ao derrotar', value: defeatParts.join(' · ') || null },
    ].filter((row): row is { label: string; value: string } => row.value !== null);

    return (
        <div className="bg-white p-4 sm:p-6 md:p-10 rounded-xl shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] border-4 border-slate-900 w-full">
            <h3 className="text-xl font-bold text-slate-800 mb-6 uppercase tracking-widest font-retro border-b-4 border-slate-900 pb-2 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 border-2 border-slate-900 rounded-full"></span>
                Ficha
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {rows.map((row) => (
                    <div key={row.label} className="p-3 border-4 border-slate-900 rounded-lg bg-slate-100">
                        <dt className="text-xs font-bold text-slate-500 uppercase tracking-widest">{row.label}</dt>
                        <dd className="mt-1 font-bold text-slate-900 break-words">{row.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
