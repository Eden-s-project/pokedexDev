import { typeColors } from './constants';

export const itemsPerPageOptions = [10, 20, 50, 100, 1025] as const;
const defaultItemsPerPage = 20;

export interface ListFilters {
    search: string;
    type: string; // '' = todos os tipos
    page: number;
    perPage: number;
}

// Filtros da lista na URL: ?q=pika&tipo=electric&pag=2&por=50
// Valor ausente ou inválido cai no padrão, para um link editado à mão não quebrar a tela
export function readListFilters(params: URLSearchParams): ListFilters {
    const type = params.get('tipo') ?? '';
    const page = Number(params.get('pag'));
    const perPage = Number(params.get('por'));

    return {
        search: params.get('q') ?? '',
        type: Object.hasOwn(typeColors, type) ? type : '',
        page: Number.isInteger(page) && page >= 1 ? page : 1,
        perPage: itemsPerPageOptions.some((option) => option === perPage) ? perPage : defaultItemsPerPage,
    };
}

// Grava só o que difere do padrão, para a lista sem filtro continuar com a URL limpa
export function writeListFilters(filters: ListFilters): URLSearchParams {
    const params = new URLSearchParams();
    if (filters.search) params.set('q', filters.search);
    if (filters.type) params.set('tipo', filters.type);
    if (filters.page > 1) params.set('pag', String(filters.page));
    if (filters.perPage !== defaultItemsPerPage) params.set('por', String(filters.perPage));
    return params;
}
