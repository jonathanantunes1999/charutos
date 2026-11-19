import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" → o build funciona em qualquer sub-pasta ou domínio.
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: { port: 5173 },
});
