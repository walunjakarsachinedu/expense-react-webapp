import config from "./config.default";

declare global {
  interface Window {
    config: typeof config;
  }
}
