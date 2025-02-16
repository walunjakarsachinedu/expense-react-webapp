import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import deepmerge from "deepmerge";
import fs from "fs";
import path from "path";

export default defineConfig(async ({ mode }) => {
  const configDir = path.resolve(__dirname, "src/config");

  // Validate mode by checking for corresponding config files
  const availableModes = fs
    .readdirSync(configDir)
    .filter((file) => /^config\..+\.ts$/.test(file))
    .map((file) => file.replace(/^config\.(.+)\.ts$/, "$1"));

  if (!availableModes.includes(mode) && mode !== "development") {
    throw new Error(
      `Invalid mode: "${mode}". Supported modes: ${availableModes.join(", ")}`
    );
  }

  if (mode == "development") mode = "default";

  // Dynamically import default and environment-specific configs
  const defaultConfig = (await import(`./src/config/config.default.ts`))
    .default;
  const envConfig = (await import(`./src/config/config.${mode}.ts`)).default;

  const finalConfig = deepmerge(defaultConfig, envConfig);

  return {
    plugins: [react()],
    define: {
      config: finalConfig,
    },
  };
});
