import { itemsPerPageOptions } from '../utils/listFilters';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (items: number) => void;
}

export function Pagination({
    currentPage,
    totalPages,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
}: PaginationProps) {
    return (
        <div className="flex flex-col items-center mt-10 gap-4">
            <div className="flex justify-center items-center space-x-6">
                <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-6 py-2 bg-slate-900 text-white font-bold uppercase tracking-widest border-4 border-slate-900 rounded-md disabled:bg-slate-400 disabled:border-slate-400 disabled:cursor-not-allowed hover:bg-slate-800 transition shadow-[4px_4px_0_0_rgba(255,255,255,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0_0_rgba(255,255,255,1)]"
                >
                    Anterior
                </button>

                <span className="text-white font-bold font-retro text-xl bg-slate-900 px-4 py-1 border-2 border-white rounded-md shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]">
                    Pág {currentPage} de {totalPages}
                </span>

                <button
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-6 py-2 bg-slate-900 text-white font-bold uppercase tracking-widest border-4 border-slate-900 rounded-md disabled:bg-slate-400 disabled:border-slate-400 disabled:cursor-not-allowed hover:bg-slate-800 transition shadow-[4px_4px_0_0_rgba(255,255,255,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0_0_rgba(255,255,255,1)]"
                >
                    Próximo
                </button>
            </div>

            <div className="flex items-center gap-2 text-white font-bold text-sm mt-4 bg-slate-900 px-4 py-2 rounded-lg border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]">
                <label htmlFor="itemsPerPage" className="uppercase tracking-wide">Mostrar:</label>
                <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="border-2 border-slate-700 rounded-md p-1 focus:outline-none focus:border-white bg-slate-800 text-white font-retro text-lg"
                >
                    {itemsPerPageOptions.map((option) => (
                        <option key={option} value={option}>
                            {option === 1025 ? 'Todos (1025)' : option}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
