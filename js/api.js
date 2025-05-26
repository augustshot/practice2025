"use strict";
(function () {
  const URL = "https://randomfox.ca/floof/";

  window.addEventListener("load", init);

  function init() {
    document.getElementById("show").addEventListener("click", showFox);
  }
  function showFox() {
    fetch(URL)
      .then(checkStatus)
      .then((resp) => resp.json())
      .then(showResult)
      .catch(console.error);
  }

  function showResult(response) {
    console.log(response.image);
    let img = document.getElementById("fox");
    img.src = response.image;
  }
  function checkStatus(response) {
    if (!response.ok) {
      console.log("err");
      throw Error("Ошибка запроса: " + response.statusText);
    }
    return response;
  }
})();
