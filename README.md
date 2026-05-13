# BLOOPI — Landing de pre-lanzamiento

Landing teaser de alto impacto para la red social BLOOPI.

## Cómo ejecutar

```bash
cd C:\Proyectos\Zoe\landing-bloopi
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## Build para producción

```bash
npm run build
npm run preview
```

## Estructura

```
landing-bloopi/
├── public/
│   └── assets/              # Assets copiados de images/ (SVG + PNG)
├── src/
│   ├── components/
│   │   ├── BloopiOrb.tsx    # Burbuja animada (canvas, física, partículas)
│   │   └── NavBar.tsx       # Barra de navegación fija
│   ├── sections/
│   │   ├── Hero.tsx         # Hero fullscreen con orbe
│   │   ├── HypeSection.tsx  # Sección de hype / cards
│   │   ├── GroupSection.tsx # "No es solo tu perfil"
│   │   ├── GlobalSection.tsx# "Nacida aquí, para el mundo"
│   │   ├── WaitlistSection.tsx # Formulario de acceso anticipado
│   │   └── Footer.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css            # Design tokens + todos los estilos
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Paleta visual

| Token            | HEX       | Uso                        |
|------------------|-----------|----------------------------|
| Dreamy start     | `#CAE6FF` | Azul cielo                 |
| Dreamy mid       | `#FFD7FB` | Rosa lavanda               |
| Dreamy end       | `#FFDDBD` | Melocotón                  |
| Steel light      | `#B8CAE3` | Bordes, glow               |
| Steel mid        | `#97AACA` | Subheadings, accents       |
| Slate            | `#8681A0` | CTAs, texto medio          |
| Ice              | `#CDDEFF` | Reflejos                   |

## BloopiOrb — Comportamiento

- Se mueve por el hero rebotando suavemente.
- Al tocar un borde: efecto **squash/stretch** (deformación de impacto).
- Pulso interno que respira en ciclos.
- Cada ~10-15 s entra en modo **carga**: el glow se intensifica, aparecen anillos de presión, el orbe parece a punto de explotar. Nunca explota.
- Partículas iridiscentes orbitan alrededor.
- Soporte para `prefers-reduced-motion`: se detienen las animaciones si el usuario lo tiene activado.
- En móvil la velocidad se reduce al 55%.

## Waitlist

Los emails se guardan en `localStorage` bajo la clave `bloopi_waitlist`.
Para conectar un backend real, sustituir el bloque `localStorage` en `WaitlistSection.tsx`.

## Assets originales

Originales en `C:\Proyectos\Zoe\images\` — no modificados.
Copias en `public/assets/` para uso en la landing.
