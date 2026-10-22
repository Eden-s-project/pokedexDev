import { Link } from 'react-router-dom';
import { typeColors } from '../utils/constants';

interface PokemonCardProps {
    name: string;
    number: string;
    image: string;
    types?: string[];
}

export function PokemonCard({ name, number, image, types }: PokemonCardProps) {
    return (
        <Link
            to={`/pokemon/${name.toLowerCase()}`}
            className="flex flex-col items-center bg-white border-4 border-slate-900 rounded-xl p-4 shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(15,23,42,1)] transition-all duration-200"
        >
            <p className="text-slate-500 font-retro text-lg self-start">{number}</p>
            {/* lazy: com "Mostrar: Todos" são 1025 artes oficiais; só baixa as que chegam perto da tela.
                width/height reservam o espaço e evitam a grade pular enquanto carrega */}
            <img
                src={image}
                alt={name}
                loading="lazy"
                decoding="async"
                width={112}
                height={112}
                className="w-28 h-28 hover:scale-110 transition-transform duration-300 drop-shadow-md"
            />
            <h1 className="text-lg font-bold text-slate-900 capitalize mt-2">{name}</h1>

            {/* O React só desenha isso se a variável 'types' existir e tiver itens! */}
            {types && types.length > 0 && (
                // flex-wrap + pílula compacta no celular: em 360px o miolo do card tem 112px e
                // "NORMAL FLYING" precisava de ~146px, passando da borda do card
                <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mt-2">
                    {types.map((type) => (
                        <p key={type} className={`${typeColors[type.toLowerCase()] || 'bg-gray-200 text-gray-800'} px-2 sm:px-3 py-1 rounded-full text-xs font-bold uppercase tracking-normal sm:tracking-wide border-2 border-slate-900`}>
                            {type}
                        </p>
                    ))}
                </div>
            )}
        </Link>
    )
}