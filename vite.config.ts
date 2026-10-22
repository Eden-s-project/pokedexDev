import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  // Caminho do GitHub Pages: tem que ser o NOME DO REPOSITÓRIO (eden-s-project.github.io/pokedexDev/).
  // Se o repositório for renomeado, troque aqui; o roteador acompanha via import.meta.env.BASE_URL
  base: '/pokedexDev/',
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
