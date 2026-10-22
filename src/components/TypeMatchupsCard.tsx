import type { Matchup, TypeMatchups } from '../utils/typeEffectiveness';
import { formatMultiplier } from '../utils/typeEffectiveness';
import { typeColors } from '../utils/constants';

interface TypeMatchupsCardProps {
    matchups: TypeMatchups;
}

function MatchupBadge({ matchup }: { matchup: Matchup }) {
    return (
        <span className={`${typeColors[matchup.type] || 'bg-gray-400 text-gray-800'} inline-flex items-center gap-2 pl-3 pr-1 py-1 rounded-full text-xs font-bold uppercase tracking-widest border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)]`}>
            {matchup.type}
            <span className="bg-slate-900 text-white font-retro text-sm px-2 rounded-full normal-case tracking-normal">
                {formatMultiplier(matchup.multiplier)}
            </span>
        </span>
    );
}

function MatchupGroup({ title, dotClass, matchups }: { title: string; dotClass: string; matchups: Matchup[] }) {
    return (
        <div>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className={`w-3 h-3 border-2 border-slate-900 rounded-full ${dotClass}`}></span>
                {title}
            </h4>
            {matchups.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {matchups.map((matchup) => (
                        <MatchupBadge key={matchup.type} matchup={matchup} />
                    ))}
                </div>
            ) : (
                <p className="text-slate-400 font-bold italic text-sm">Nenhuma</p>
            )}
        </div>
    );
}

// Dano que golpes de cada tipo causam NESTE Pokémon (lado defensivo)
export function TypeMatchupsCard({ matchups }: TypeMatchupsCardProps) {
    return (
        <div className="bg-white p-4 sm:p-6 md:p-10 rounded-xl shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] border-4 border-slate-900 w-full">
            <h3 className="text-xl font-bold text-slate-800 mb-6 uppercase tracking-widest font-retro border-b-4 border-slate-900 pb-2">
                Fraquezas e resistências
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <MatchupGroup title="Fraco contra" dotClass="bg-red-500" matchups={matchups.weaknesses} />
                <MatchupGroup title="Resistente a" dotClass="bg-green-500" matchups={matchups.resistances} />
                <MatchupGroup
                    title="Imune a"
                    dotClass="bg-slate-400"
                    matchups={matchups.immunities.map((type) => ({ type, multiplier: 0 }))}
                />
            </div>
        </div>
    );
}
