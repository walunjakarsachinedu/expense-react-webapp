import { useEffect, useState } from "react";
import { Themes } from "../types/Theme";
import LocalStorageApi from "../api/LocalStorageApi";

export default function ThemeBtn() {
  const [theme, setTheme] = useState<Themes>(LocalStorageApi.provider.getSelectedTheme());

  const toggleTheme = () => {
    const newTheme = theme === Themes.dark ? Themes.indigo : Themes.dark;
    setTheme(newTheme);
  };

  useEffect(() => {
    LocalStorageApi.provider.storeSelectedTheme(theme);
    const htmlElement = document.documentElement;
    htmlElement.setAttribute("data-theme", theme);
  }, [theme]); 

  return <i 
    className="pi cursor-pointer icon-btn pi-sun"
    onClick={toggleTheme}>
  </i>;
}