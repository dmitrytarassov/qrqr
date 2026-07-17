import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  // на GitHub Pages сайт живёт в подпути /<repo>/ — воркфлоу передаёт его через BASE_PATH
  base: process.env.BASE_PATH ?? "/",
  plugins: [react(), tailwindcss()],
});
