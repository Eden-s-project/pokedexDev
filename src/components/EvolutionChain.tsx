import { Fragment } from 'react';
import type { EvolutionNode } from '../services/pokemon';
import { Link } from 'react-router-dom';

interface EvolutionChainProps {
    stages: EvolutionNode[][];
}

function EvolutionCard({ evo }: { evo: EvolutionNode }) {
    return (
        // Link pelo número: o nome da espécie nem sempre é o nome do Pokémon (wormadam -> wormadam-plant)
        // replace: igual ao Anterior/Próximo, um único "voltar" ainda cai na lista
        <Link
            to={`/pokemon/${evo.id}`}
            replace
            className="flex flex-col items-center hover:translate-y-[-4px] transition-transform duration-200"
        >
            <div className="w-20 h-20 md:w-28 md:h-28 bg-slate-200 border-4 border-slate-900 rounded-full flex items-center justify-center mb-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
                <div className="absolute inset-0 bg-white/40"></div>
                <img
                    src={evo.image}
                    alt={evo.name}
                    className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-md z-10"
                    loading="lazy"
                />
            </div>
            <span className="font-bold text-slate-900 uppercase tracking-widest font-retro text-lg">{evo.name}</span>
            {/* Como evolui da anterior. Fica sob o nome (e não na seta) porque irmãs como as
                8 evoluções da Eevee dividem a mesma seta e cada uma tem sua condição */}
            {evo.condition && (
                <span className="mt-1 max-w-[11rem] text-center text-xs font-bold text-slate-600 leading-snug">
                    {evo.condition}
                </span>
            )}
        </Link>
    );
}

export function EvolutionChain({ stages }: EvolutionChainProps) {
    if (stages.flat().length <= 1) {
        return null;
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] border-4 border-slate-900 w-full max-w-5xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center uppercase tracking-widest font-retro border-b-4 border-slate-900 pb-4">
                Evolution Chain
            </h3>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                {stages.map((stage, index) => (
                    <Fragment key={index}>
                        {/* Estágio: evoluções irmãs lado a lado (ex.: as 8 da Eevee) */}
                        <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-xl">
                            {stage.map((evo) => (
                                <EvolutionCard key={evo.id} evo={evo} />
                            ))}
                        </div>

                        {/* Seta entre estágios: para baixo no celular, para a direita no desktop */}
                        {index < stages.length - 1 && (
                            <div className="flex text-slate-900 md:mx-6 rotate-90 md:rotate-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="drop-shadow-[2px_2px_0_rgba(0,0,0,0.3)]"
                                >
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </div>
                        )}
                    </Fragment>
                ))}
            </div>
        </div>
    );
}
