import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

// Mesma moldura e cores do card real (PokemonProfileCard + PokemonDexEntry),
// para a troca esqueleto -> conteúdo não piscar de branco para escuro
export function SkeletonDetails() {
  return (
    <div className="bg-slate-900 rounded-2xl shadow-[8px_8px_0_0_rgba(0,0,0,0.6)] overflow-hidden max-w-5xl w-full flex flex-col md:flex-row border-4 border-slate-900">
      {/* LADO ESQUERDO: Imagem e Informações Básicas */}
      <SkeletonTheme baseColor="#334155" highlightColor="#475569">
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col items-center bg-slate-800 border-b-4 md:border-b-0 md:border-r-4 border-slate-900">
          <div className="w-48 mb-2 mt-4"><Skeleton height={44} /></div>
          <div className="w-20 mb-8"><Skeleton height={32} /></div>

          <div className="bg-slate-200 rounded-xl p-6 mb-8 w-64 h-64 flex justify-center items-center border-4 border-slate-900">
            <SkeletonTheme baseColor="#cbd5e1" highlightColor="#e2e8f0">
              <Skeleton circle width={176} height={176} />
            </SkeletonTheme>
          </div>

          <div className="flex gap-3 mt-auto">
            <div className="w-24"><Skeleton height={36} borderRadius={9999} /></div>
            <div className="w-24"><Skeleton height={36} borderRadius={9999} /></div>
          </div>
        </div>
      </SkeletonTheme>

      {/* LADO DIREITO: Entrada da Dex, Peso/Altura e Status Base */}
      <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-slate-100">
        <div className="mb-8 bg-[#8b9a70] p-5 border-4 border-slate-900 rounded-lg">
          <SkeletonTheme baseColor="#7a8962" highlightColor="#9aa982">
            <div className="w-40 mb-3"><Skeleton height={16} /></div>
            <Skeleton count={3} />
          </SkeletonTheme>
        </div>

        <SkeletonTheme baseColor="#334155" highlightColor="#475569">
          <div className="flex gap-8 mb-10 bg-slate-800 p-4 md:p-6 rounded-xl border-4 border-slate-900">
            <div className="flex flex-col flex-1 items-center gap-2">
              <div className="w-12"><Skeleton height={12} /></div>
              <div className="w-20"><Skeleton height={24} /></div>
            </div>
            <div className="flex flex-col flex-1 items-center gap-2">
              <div className="w-12"><Skeleton height={12} /></div>
              <div className="w-20"><Skeleton height={24} /></div>
            </div>
          </div>
        </SkeletonTheme>

        <div>
          <div className="w-40 mb-6"><Skeleton height={28} /></div>
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12"><Skeleton height={16} /></div>
                <div className="w-10"><Skeleton height={20} /></div>
                <div className="flex-1"><Skeleton height={20} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
