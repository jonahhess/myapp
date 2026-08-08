# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Testing

- `npm run test:unit` for fast unit checks (no network).
- `npm run test:integration` for mocked UI integration checks.
- `npm run test:integration:admin` for focused admin dashboard behavior.
- `npm run test:integration:recruiter` for focused recruiter dashboard behavior.
- `npm run test:smoke:prod` for rate-limited production-like smoke checks.
- `npm run test:smoke:prod:admin` for rate-limited admin endpoint smoke checks.
- `npm run test:smoke:prod:recruiter` for rate-limited recruiter endpoint smoke checks.

See `TESTING_STRATEGY.md` for full guidance and request-throttling rules.
