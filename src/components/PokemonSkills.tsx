
import { typeColors } from '../utils/constants';

// Cabeçalho e linhas usam o mesmo grid, senão as colunas desalinham.
// No celular as colunas fixas são estreitas e a ACC fica escondida para sobrar
// espaço ao nome do golpe (antes as colunas ocupavam a tabela inteira e o nome ficava com 0px).
const movesGrid = 'grid grid-cols-[28px_minmax(0,1fr)_64px_28px_24px] sm:grid-cols-[60px_1fr_100px_60px_60px_60px] gap-1.5 sm:gap-2 p-2 sm:p-3';

interface PokemonSkillsProps {
    abilities: { name: string; isHidden: boolean }[];
    moves: { name: string; type: string; power: number | null; accuracy: number | null; pp: number | null; level: number }[];
}

export function PokemonSkills({ abilities, moves }: PokemonSkillsProps) {
    return (
        <div className="mt-8 bg-white p-4 sm:p-6 md:p-10 rounded-xl shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] border-4 border-slate-900 w-full max-w-5xl">
            <div className="flex flex-col lg:flex-row gap-10">

                {/* Lado Esquerdo: Abilities */}
                <div className="lg:w-1/3">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 uppercase tracking-widest font-retro border-b-4 border-slate-900 pb-2 flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 border-2 border-slate-900 rounded-full"></div>
                        Habilidades
                    </h3>
                    <div className="flex flex-col gap-4">
                        {abilities.map((ability, index) => (
                            <div
                                key={index}
                                className={`p-4 border-4 border-slate-900 rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${ability.isHidden ? 'bg-yellow-400' : 'bg-slate-200'}`}
                            >
                                <div className="flex justify-between items-center gap-2">
                                    <span className="font-bold uppercase tracking-wider text-slate-900 break-words">
                                        {ability.name.replaceAll('-', ' ')}
                                    </span>
                                    {ability.isHidden && (
                                        <span className="text-[10px] sm:text-xs font-black bg-slate-900 text-yellow-400 px-2 py-1 rounded-full uppercase tracking-widest shrink-0">
                                            Secreta
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {abilities.length === 0 && (
                            <p className="text-slate-500 font-bold italic">Nenhuma habilidade encontrada.</p>
                        )}
                    </div>
                </div>

                {/* Lado Direito: Moveset Table */}
                <div className="lg:w-2/3">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 uppercase tracking-widest font-retro border-b-4 border-slate-900 pb-2 flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                        Movimentos
                    </h3>

                    <div className="border-4 border-slate-900 rounded-xl overflow-hidden shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-slate-100 flex flex-col">
                        {/* Table Header */}
                        <div className={`${movesGrid} bg-slate-900 text-white text-xs sm:text-sm font-retro uppercase tracking-normal sm:tracking-widest`}>
                            <span>LVL</span>
                            <span>GOLPE</span>
                            <span className="text-center">TIPO</span>
                            <span className="text-center">PWR</span>
                            <span className="hidden sm:block text-center">ACC</span>
                            <span className="text-center">PP</span>
                        </div>

                        {/* Table Body */}
                        <div className="max-h-80 overflow-y-auto">
                            {moves.map((move, index) => (
                                <div
                                    key={index}
                                    className={`${movesGrid} border-b-4 border-slate-900 last:border-b-0 items-center hover:bg-slate-200 transition-colors text-xs sm:text-sm font-bold text-slate-800`}
                                >
                                    <span className="font-retro text-slate-600">
                                        {move.level}
                                    </span>
                                    <span className="uppercase text-[11px] sm:text-sm tracking-normal sm:tracking-wider break-words sm:truncate" title={move.name.replaceAll('-', ' ')}>
                                        {move.name.replaceAll('-', ' ')}
                                    </span>

                                    <div className="flex justify-center">
                                        <span
                                            className={`${typeColors[move.type.toLowerCase()] || 'bg-gray-400 text-gray-800'} px-1 sm:px-2 py-1 rounded text-[10px] sm:text-xs uppercase tracking-normal sm:tracking-widest border-2 border-slate-900 text-center shadow-[2px_2px_0_0_rgba(0,0,0,1)] w-full block`}
                                        >
                                            {move.type}
                                        </span>
                                    </div>

                                    <span className="text-center font-retro text-slate-600">
                                        {move.power || '--'}
                                    </span>
                                    <span className="hidden sm:block text-center font-retro text-slate-600">
                                        {move.accuracy || '--'}
                                    </span>
                                    <span className="text-center font-retro text-slate-900">
                                        {move.pp || '--'}
                                    </span>
                                </div>
                            ))}
                            {moves.length === 0 && (
                                <div className="p-6 text-center text-slate-500 font-bold italic">
                                    Nenhum movimento encontrado.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
