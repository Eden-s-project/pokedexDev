import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { usePokemonEncounters } from '../hooks/usePokemonEncounters';
import { conditionLabel, methodLabel, type EncounterSpot } from '../utils/encounters';

interface EncounterLocationsProps {
    pokemonId: number;
}

function levelLabel(spot: EncounterSpot) {
    return spot.minLevel === spot.maxLevel ? `Nv. ${spot.minLevel}` : `Nv. ${spot.minLevel}–${spot.maxLevel}`;
}

export function EncounterLocations({ pokemonId }: EncounterLocationsProps) {
    const { data: games, isPending, isError } = usePokemonEncounters(pokemonId);
    // null = ainda não escolheu: mostra o jogo mais recente com dados
    const [selected, setSelected] = useState<number | null>(null);

    const current = games && games.length > 0 ? games[selected ?? games.length - 1] : undefined;

    return (
        <div className="bg-white p-4 sm:p-6 md:p-10 rounded-xl shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] border-4 border-slate-900 w-full">
            <h3 className="text-xl font-bold text-slate-800 mb-6 uppercase tracking-widest font-retro border-b-4 border-slate-900 pb-2 flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-400 border-2 border-slate-900 rounded-full"></span>
                Onde encontrar
            </h3>

            {isPending && <Skeleton count={4} height={24} />}

            {isError && (
                <p className="text-red-600 font-bold text-sm">
                    Não foi possível carregar os locais de encontro. Tente novamente mais tarde.
                </p>
            )}

            {games && games.length === 0 && (
                <p className="text-slate-500 font-bold text-sm">
                    A PokéAPI não tem locais de encontro para este Pokémon. Os dados vão só até
                    Ultra Sun / Ultra Moon (geração 7), e Pokémon obtidos só por evolução não têm local próprio.
                </p>
            )}

            {games && current && (
                <>
                    <div role="tablist" aria-label="Jogo" className="flex flex-wrap gap-2 mb-6">
                        {games.map((game, index) => {
                            const isSelected = game === current;
                            return (
                                <button
                                    key={game.versions.join('/')}
                                    id={`encounter-tab-${index}`}
                                    type="button"
                                    role="tab"
                                    aria-selected={isSelected}
                                    aria-controls="encounter-panel"
                                    onClick={() => setSelected(index)}
                                    className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide border-2 border-slate-900 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500 ${isSelected
                                        ? 'bg-slate-900 text-white shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {game.versions.join(' / ')}
                                </button>
                            );
                        })}
                    </div>

                    <ul
                        id="encounter-panel"
                        role="tabpanel"
                        aria-labelledby={`encounter-tab-${games.indexOf(current)}`}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                        {current.spots.map((spot) => (
                            <li
                                key={`${spot.place}|${spot.method}`}
                                className="p-3 border-4 border-slate-900 rounded-lg bg-slate-100 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                            >
                                <p className="font-bold uppercase tracking-wider text-slate-900 break-words">{spot.place}</p>
                                {/* Cada parte inteira numa linha: no celular o "· 60%" descia sozinho */}
                                <p className="text-sm font-bold text-slate-600 mt-1">
                                    <span className="whitespace-nowrap">{methodLabel(spot.method)}</span>
                                    {' · '}
                                    <span className="whitespace-nowrap">{levelLabel(spot)} · {spot.chance}%</span>
                                </p>
                                {spot.conditions.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {spot.conditions.map((condition) => (
                                            <span
                                                key={condition}
                                                className="text-[10px] sm:text-xs font-black bg-slate-900 text-yellow-400 px-2 py-0.5 rounded-full uppercase tracking-widest"
                                            >
                                                {conditionLabel(condition)}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>

                    <p className="text-xs text-slate-500 font-bold mt-6">
                        Dados da PokéAPI, que vão só até Ultra Sun / Ultra Moon. A chance é a soma dos
                        slots do local; com horário, vale a do melhor horário.
                    </p>
                </>
            )}
        </div>
    );
}
