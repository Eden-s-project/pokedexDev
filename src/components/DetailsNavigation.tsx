import { useLocation, useNavigate } from "react-router-dom";
import type { PokemonDetailedData } from "../services/pokemon";

interface DetailsNavigationProps {
    pokemon: PokemonDetailedData | undefined;
}

export function DetailsNavigation({ pokemon }: DetailsNavigationProps) {
    const navigate = useNavigate();
    const location = useLocation();

    // Voltar = voltar do navegador, que devolve a lista com busca/tipo/página da URL.
    // key "default" é a primeira página aberta na aba (link direto): aí não há lista atrás.
    const goBack = () => (location.key === 'default' ? navigate('/') : navigate(-1));

    // Anterior/Próximo substituem a entrada do histórico: depois de passear por vários
    // Pokémon, um único "voltar" ainda cai na lista
    const goToNumber = (number: number) => navigate(`/pokemon/${number}`, { replace: true });

    return (
        <div className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mb-6">
            <button
                onClick={goBack}
                className="w-full sm:w-auto text-white font-bold uppercase tracking-wider bg-slate-900 border-4 border-slate-900 rounded-full px-6 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] transition-all active:scale-95"
            >
                &larr; Voltar
            </button>

            {pokemon && (
                <div className="flex w-full sm:w-auto justify-between sm:justify-end gap-2 sm:gap-4">
                    <button
                        onClick={() => goToNumber(Number(pokemon.number.replace('#', '')) - 1)}
                        disabled={Number(pokemon.number.replace('#', '')) <= 1}
                        className="flex-1 sm:flex-none px-2 sm:px-6 py-2 bg-slate-900 text-white font-bold uppercase tracking-wider border-4 border-slate-900 rounded-full disabled:bg-slate-400 disabled:border-slate-400 disabled:cursor-not-allowed shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] transition-all active:scale-95 text-center text-sm sm:text-base"
                    >
                        &larr; Anterior
                    </button>
                    <button
                        onClick={() => goToNumber(Number(pokemon.number.replace('#', '')) + 1)}
                        disabled={Number(pokemon.number.replace('#', '')) >= 1025}
                        className="flex-1 sm:flex-none px-2 sm:px-6 py-2 bg-slate-900 text-white font-bold uppercase tracking-wider border-4 border-slate-900 rounded-full disabled:bg-slate-400 disabled:border-slate-400 disabled:cursor-not-allowed shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] transition-all active:scale-95 text-center text-sm sm:text-base"
                    >
                        Próximo &rarr;
                    </button>
                </div>
            )}
        </div>
    );
}
