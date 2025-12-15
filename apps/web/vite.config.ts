import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@kuraxx/contracts": path.resolve(
        __dirname,
        "../../libs/shared/contracts/src"
      ),
      "@kuraxx/types": path.resolve(__dirname, "../../libs/shared/types/src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://kurax-api-wqjoy.ondigitalocean.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "../../dist/apps/web",
    emptyOutDir: true,
  },
});
