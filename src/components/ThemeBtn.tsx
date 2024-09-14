import { useState } from "react";

enum  Themes {
  indigo = "indigo",
  dark = "dark"
}

export default function ThemeBtn() {
  const [theme, setTheme] = useState(Themes.indigo);
  const changeTheme = () => {
    const htmlElement = document.documentElement;
    const newTheme = (theme === Themes.indigo) ? Themes.dark : Themes.indigo;
    htmlElement.setAttribute("data-theme", newTheme);
    setTheme(newTheme);
  }
  return <i 
    className="pi cursor-pointer icon-btn pi-sun"
    onClick={changeTheme}>
  </i>;
}