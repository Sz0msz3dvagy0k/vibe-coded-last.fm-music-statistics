# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Configuration

### Base Path

The application can be deployed under different base paths (e.g., `/dashboard/`, `/music/`) instead of the root path `/`.

To configure the base path:

1. Create a `.env` file in the frontend directory (or copy from `.env.example`)
2. Set the `VITE_BASE_PATH` variable:
   ```env
   VITE_BASE_PATH=/dashboard/
   ```
3. Build the application:
   ```bash
   npm run build
   ```

**Examples:**
- Root path: `VITE_BASE_PATH=/`
- Subdirectory: `VITE_BASE_PATH=/dashboard/`
- Custom path: `VITE_BASE_PATH=/my-music-app/`

**Note:** The base path must start and end with `/`

When deploying to a subdirectory, ensure your web server is configured to serve the application from that path.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
