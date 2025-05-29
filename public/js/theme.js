const html = document.querySelector("html");
(function () {
  window.addEventListener("load", init);
  function init() {
    document.getElementById("theme").addEventListener("click", setTheme);
    if (window.localStorage) {
      if (localStorage.getItem("data-theme") == "dark") {
        html.setAttribute("data-theme", "dark");
        document.getElementById("theme").innerHTML = "Включить светлую тему";
      } else
        document.getElementById("theme").innerHTML = "Включить темную тему";
    }
  }
})();

function setTheme() {
  if (window.localStorage) {
    if (localStorage.getItem("data-theme") == "dark") {
      html.setAttribute("data-theme", "light");
      document.getElementById("theme").innerHTML = "Включить темную тему";
      localStorage.setItem("data-theme", "light");
    } else {
      html.setAttribute("data-theme", "dark");
      document.getElementById("theme").innerHTML = "Включить светлую тему";
      localStorage.setItem("data-theme", "dark");
    }
  }
}
