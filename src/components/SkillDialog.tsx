import { useEffect, useRef } from 'react';
import Skeleton from 'react-loading-skeleton';
import type { PokemonDetailedData } from '../services/pokemon';
import { useSkillDescription } from '../hooks/useSkillDescription';
import { typeColors } from '../utils/constants';

type Move = PokemonDetailedData['moves'][number];
type Ability = PokemonDetailedData['abilities'][number];

export type SelectedSkill =
    | { kind: 'move'; data: Move }
    | { kind: 'ability'; data: Ability };

interface SkillDialogProps {
    skill: SelectedSkill | null;
    onClose: () => void;
}

const damageClassLabels: Record<string, string> = {
    physical: 'Físico',
    special: 'Especial',
    status: 'Status',
};

export function SkillDialog({ skill, onClose }: SkillDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    // Só fecha pelo fundo se o clique também COMEÇOU no fundo; arrastar uma seleção
    // de texto de dentro para fora gera um click no <dialog> e fecharia sem querer
    const pressedOnBackdrop = useRef(false);
    const { data, isPending, isError } = useSkillDescription(
        skill ? { kind: skill.kind, name: skill.data.name } : null
    );

    // O <dialog> nativo só vira modal (fundo escuro, foco preso, Esc fecha) via showModal()
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (skill && !dialog.open) dialog.showModal();
        if (!skill && dialog.open) dialog.close();
    }, [skill]);

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            // Clique no fundo escuro: o alvo é o próprio <dialog>, não o conteúdo
            onPointerDown={(e) => {
                pressedOnBackdrop.current = e.target === e.currentTarget;
            }}
            // pointerup e não click: o click vai para o ancestral comum de onde apertou e
            // soltou, que é o próprio <dialog> mesmo quando o arrasto termina no conteúdo
            onPointerUp={(e) => {
                if (pressedOnBackdrop.current && e.target === e.currentTarget) dialogRef.current?.close();
            }}
            aria-labelledby="skill-dialog-title"
            className="w-[calc(100%-2rem)] max-w-md p-0 bg-transparent backdrop:bg-slate-900/70"
        >
            {skill && (
                <div className="bg-white border-4 border-slate-900 rounded-xl overflow-hidden shadow-[8px_8px_0_0_rgba(0,0,0,0.6)]">
                    <div className="bg-slate-900 text-white flex items-center justify-between gap-4 px-5 py-3">
                        <h2 id="skill-dialog-title" className="font-retro text-xl uppercase tracking-widest">
                            {skill.data.name.replaceAll('-', ' ')}
                        </h2>
                        <button
                            type="button"
                            onClick={() => dialogRef.current?.close()}
                            aria-label="Fechar"
                            className="w-11 h-11 sm:w-8 sm:h-8 shrink-0 rounded-full bg-red-600 border-2 border-white font-bold leading-none hover:bg-red-700 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="p-5 flex flex-col gap-4">
                        <div className="flex flex-wrap gap-2">
                            {skill.kind === 'move' && (
                                <span className={`${typeColors[skill.data.type] || 'bg-gray-400 text-gray-800'} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border-2 border-slate-900`}>
                                    {skill.data.type}
                                </span>
                            )}
                            {skill.kind === 'move' && isPending && (
                                <span className="w-20">
                                    <Skeleton height={28} borderRadius={9999} />
                                </span>
                            )}
                            {data?.damageClass && (
                                <span className="bg-slate-200 text-slate-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border-2 border-slate-900">
                                    {damageClassLabels[data.damageClass] || data.damageClass}
                                </span>
                            )}
                            {skill.kind === 'ability' && (
                                <span className={`${skill.data.isHidden ? 'bg-slate-900 text-yellow-400' : 'bg-slate-200 text-slate-900'} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border-2 border-slate-900`}>
                                    {skill.data.isHidden ? 'Habilidade secreta' : 'Habilidade'}
                                </span>
                            )}
                        </div>

                        {/* No diálogo o ACC aparece mesmo no celular, onde a tabela o esconde */}
                        {skill.kind === 'move' && (
                            <dl className="grid grid-cols-4 gap-2 text-center">
                                {[
                                    { label: 'LVL', value: skill.data.level },
                                    { label: 'PWR', value: skill.data.power },
                                    { label: 'ACC', value: skill.data.accuracy },
                                    { label: 'PP', value: skill.data.pp },
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-slate-800 rounded-lg border-2 border-slate-900 py-2">
                                        <dt className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{stat.label}</dt>
                                        {/* ?? e não ||: nível 0 ("aprende ao evoluir") é um valor real */}
                                        <dd className="text-white font-retro text-xl">{stat.value ?? '--'}</dd>
                                    </div>
                                ))}
                            </dl>
                        )}

                        {isError ? (
                            <p className="text-red-600 font-bold text-sm">
                                Não foi possível carregar a descrição. Tente novamente mais tarde.
                            </p>
                        ) : (
                            // Caixas e títulos já aparecem carregando; só o texto vira esqueleto,
                            // dentro do mesmo <p>, para o diálogo não pular quando o texto chega
                            <>
                                <div className="bg-[#8b9a70] p-4 border-4 border-slate-900 rounded-lg shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)]">
                                    <h3 className="text-xs font-bold text-[#2e3b1f] mb-1 uppercase tracking-widest font-retro">
                                        Descrição
                                    </h3>
                                    <p className="text-[#1a2410] leading-relaxed font-retro">
                                        {data
                                            ? data.flavorText ?? 'Descrição não disponível.'
                                            : <Skeleton count={3} baseColor="#7a8962" highlightColor="#9aa982" />}
                                    </p>
                                </div>

                                {(isPending || data?.effect) && (
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                                            Efeito
                                        </h3>
                                        <p className="text-slate-800 text-sm leading-relaxed">
                                            {data?.effect ?? <Skeleton count={2} />}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </dialog>
    );
}
