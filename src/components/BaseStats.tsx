interface BaseStatsProps {
    stats: { name: string; value: number }[];
}

export function BaseStats({ stats }: BaseStatsProps) {
    return (
        <div>
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest font-retro border-b-4 border-slate-900 pb-2">
                <span className="text-red-600">Base</span> Stats
            </h3>
            <div className="flex flex-col gap-4">
                {stats.map((stat) => {
                    // Mapear os nomes longos da API para siglas curtas
                    const statNameMap: Record<string, string> = {
                        'hp': 'HP',
                        'attack': 'ATK',
                        'defense': 'DEF',
                        'special-attack': 'SpA',
                        'special-defense': 'SpD',
                        // "Spe" e não "SPD": o rótulo é exibido em maiúsculas e colidiria com SpD
                        'speed': 'Spe'
                    };
                    const label = statNameMap[stat.name] || stat.name.toUpperCase();

                    // Calcular a porcentagem baseada num valor máximo teórico (ex: 255)
                    const percentage = Math.min((stat.value / 255) * 100, 100);

                    // Definir cor dependendo do quão alto é o status
                    const colorClass =
                        stat.value >= 100 ? 'bg-green-500' :
                            stat.value >= 70 ? 'bg-yellow-400' :
                                stat.value >= 40 ? 'bg-orange-400' : 'bg-red-500';

                    return (
                        <div key={stat.name} className="flex items-center gap-4">
                            <span className="w-12 text-sm font-bold text-slate-500 text-right uppercase tracking-wider">{label}</span>
                            <span className="w-10 text-right font-black text-slate-800 font-retro text-xl">{stat.value}</span>
                            <div className="flex-1 h-5 bg-slate-200 border-2 border-slate-900 overflow-hidden shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.2)]">
                                <div
                                    className={`h-full border-r-2 border-slate-900 transition-all duration-1000 ease-out ${colorClass}`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
