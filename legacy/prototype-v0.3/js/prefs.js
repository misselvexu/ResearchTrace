/* ResearchTrace · prefs.js
 * Synchronously bootstraps language + theme BEFORE first paint to avoid FOUC.
 * Must be loaded in <head>, before stylesheets are applied to body content.
 *
 * Persists in localStorage:
 *   rt-lang   = "zh" | "en"   (default: "zh")
 *   rt-theme  = "light" | "dark" (default: "light")
 */
(function () {
  const LS_LANG  = "rt-lang";
  const LS_THEME = "rt-theme";

  function readLang() {
    try { return localStorage.getItem(LS_LANG) || "zh"; } catch (e) { return "zh"; }
  }
  function readTheme() {
    try { return localStorage.getItem(LS_THEME) || "light"; } catch (e) { return "light"; }
  }
  function writeLang(v)  { try { localStorage.setItem(LS_LANG, v); } catch (e) {} }
  function writeTheme(v) { try { localStorage.setItem(LS_THEME, v); } catch (e) {} }

  const lang  = readLang();
  const theme = readTheme();

  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-lang",  lang);
  root.setAttribute("lang",       lang === "zh" ? "zh-CN" : "en");

  function setLang(v) {
    if (v !== "zh" && v !== "en") return;
    writeLang(v);
    root.setAttribute("data-lang", v);
    root.setAttribute("lang", v === "zh" ? "zh-CN" : "en");
    if (window.RTI18n && typeof window.RTI18n.apply === "function") {
      window.RTI18n.apply();
    }
    document.dispatchEvent(new CustomEvent("rt:langchange", { detail: { lang: v } }));
  }
  function setTheme(v) {
    if (v !== "light" && v !== "dark") return;
    writeTheme(v);
    root.setAttribute("data-theme", v);
    document.dispatchEvent(new CustomEvent("rt:themechange", { detail: { theme: v } }));
  }
  function toggleTheme() { setTheme(readTheme() === "dark" ? "light" : "dark"); }
  function toggleLang()  { setLang(readLang()  === "zh"   ? "en"    : "zh"); }

  window.RTPrefs = {
    getLang:  readLang,
    getTheme: readTheme,
    setLang, setTheme,
    toggleLang, toggleTheme,
  };
})();
