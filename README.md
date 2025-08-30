# Portfolio Website

A modern, performant portfolio website built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Tech Stack**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Smooth Animations**: Framer Motion for fluid interactions
- **3D Elements**: Three.js integration for interactive resume display
- **Dark/Light Mode**: Theme switching with next-themes
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Performance Optimized**: Lazy loading, code splitting, and optimized animations
- **Type Safe**: Full TypeScript implementation

## 📁 Project Structure

```
portfolio/
├── app/
│   ├── globals.css       # Global styles and Tailwind imports
│   ├── layout.tsx        # Root layout with theme provider
│   └── page.tsx          # Main landing page
├── components/
│   ├── EnhancedHeaderFixed.tsx    # Navigation header with scroll effects
│   ├── EnhancedHero.tsx           # Hero section with animations
│   ├── StatsSection.tsx           # Statistics display
│   ├── EnhancedSkills.tsx         # Skills showcase
│   ├── LazyResume3D.tsx           # 3D resume viewer
│   ├── EnhancedProjectsSection.tsx # Projects portfolio
│   ├── EnhancedContact.tsx        # Contact form
│   ├── LazyComponent.tsx          # Lazy loading wrapper
│   ├── theme-provider.tsx         # Theme context provider
│   └── ui/                        # Reusable UI components
│       ├── animated-nav.tsx
│       ├── animated-text.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── textarea.tsx
│       ├── toast.tsx
│       └── toaster.tsx
├── hooks/
│   ├── use-intersection-observer.ts # Viewport detection
│   ├── use-mobile.ts                # Mobile device detection
│   ├── use-reduced-motion.ts       # Accessibility preference
│   └── use-toast.ts                # Toast notifications
├── lib/
│   ├── animation-utils.ts          # Animation utilities
│   ├── utils.ts                    # General utilities
│   └── constants/
│       └── animation.ts            # Animation constants
└── public/                         # Static assets

```

## 🛠️ Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run analyze` - Analyze bundle size

## 🎨 Components

### Core Components

- **EnhancedHeaderFixed**: Responsive navigation with scroll effects, theme toggle, and mobile menu
- **EnhancedHero**: Animated hero section with typewriter effects and particle animations
- **StatsSection**: Display key statistics and achievements
- **EnhancedSkills**: Interactive skills showcase with categorization
- **LazyResume3D**: 3D resume viewer using Three.js
- **EnhancedProjectsSection**: Project portfolio with filtering and animations
- **EnhancedContact**: Contact form with validation

### UI Components

- **animated-text**: TypewriterText and ScrambleText effects
- **button**: Customizable button with variants
- **badge**: Tag/badge component for skills and categories
- **toast**: Notification system

## 🎯 Performance Optimizations

- **Lazy Loading**: Components loaded on-demand
- **Code Splitting**: Automatic route-based splitting
- **Optimized Animations**: Reduced particle count, GPU acceleration
- **Image Optimization**: Next.js Image component usage
- **Bundle Analysis**: Webpack bundle analyzer integration

## 🔧 Configuration

### Tailwind CSS
Configuration in `tailwind.config.ts` includes:
- Custom color scheme
- Animation utilities
- Responsive breakpoints
- Dark mode support

### TypeScript
Strict type checking enabled in `tsconfig.json`

### ESLint
Code quality rules in `.eslintrc.json`

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

MIT License - feel free to use this project for your own portfolio!

## 👤 Author

**Awais Zegham**
- Full Stack Developer
- UI/UX Designer
- Available for freelance work

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS

## ☁️ Deploying to Vercel

This project is fully ready for Vercel deployment.

### Quick Deploy

1. Push the repository to GitHub (public or private)
2. Go to https://vercel.com/new and import the repo
3. Vercel will auto-detect Next.js and use:
	- Install Command: `npm install`
	- Build Command: `npm run build`
	- Output: `.next`
4. Click Deploy

### Environment Variables (optional)
If you later add API keys (e.g., OPENAI_API_KEY), set them in the Vercel dashboard under Project Settings → Environment Variables, then redeploy.

### Custom Domains
Add your domain in Vercel → Domains. Update DNS with the provided A / CNAME records. Propagation can take up to a few hours.

### Analytics & Speed
- Enable Vercel Analytics in the project settings for performance insights.
- Consider adding `next/script` for any external scripts to keep performance high.

### Edge / Serverless Notes
Currently no custom API routes or dynamic server functions are defined—static + client rendering should deploy seamlessly. If you add server code, it will run as Serverless Functions automatically.

### Local Preview of Production Build
```bash
npm run build
npm start
```

### Troubleshooting
| Issue | Fix |
|-------|-----|
| Build exceeds memory | Increase `NODE_OPTIONS` memory or remove large unused deps |
| Images from new domains blocked | Add domain to `images.domains` in `next.config.js` |
| 404 after adding new route | Ensure file exists under `app/` and redeploy |

`vercel.json` is included for explicit commands & region targeting (adjust region as desired).

