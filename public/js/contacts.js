(function () {
  window.addEventListener("load", init);
  function init() {
    document
      .getElementById("contacts")
      .addEventListener("click", contactsClick);
  }
})();
let shown = false;
function contactsClick() {
  if (shown) {
    shown = false;
    document.getElementById("vk").innerHTML = "";
    document.getElementById("telegram").innerHTML = "";
    document.getElementById("number").innerHTML = "";
    document.getElementById("email").innerHTML = "";
  } else {
    shown = true;
    let vk = document.createElement("a");
    vk.href = "https://t.me/augustshot";
    vk.textContent = "@augustshot";
    document.getElementById("vk").append(vk);
    let tg = document.createElement("a");
    tg.href = "https://t.me/elel_ul";
    tg.textContent = "@elel_ul";
    document.getElementById("telegram").append(tg);
    document.getElementById("email").innerHTML =
      "ageevaa50@gmail.com";
    document.getElementById("number").innerHTML = "ulyana.yamanova@yandex.ru";
  }
}
