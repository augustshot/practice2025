(function () {
  window.addEventListener("load", init);
  function init() {
    document
      .getElementById("to-classification")
      .addEventListener("mouseover", changeImg);
    document
      .getElementById("to-collection")
      .addEventListener("mouseover", changeImg);
    document.getElementById("to-info").addEventListener("mouseover", changeImg);
    document
      .getElementById("to-classification")
      .addEventListener("mouseout", returnImg);
    document
      .getElementById("to-collection")
      .addEventListener("mouseout", returnImg);
    document.getElementById("to-info").addEventListener("mouseout", returnImg);
  }
})();
function changeImg() {
  if (this.id == "to-classification") {
    document.getElementById("well").src = "https://i.ibb.co/d6Y5nhr/well-hover.jpg";
  }
  if (this.id == "to-collection") {
    document.getElementById("basket").src = "https://i.ibb.co/GMVsmXH/basket-hover.jpg";
  }
  if (this.id == "to-info") {
    document.getElementById("sin").src = "https://i.ibb.co/L9p2wp3/sin-hover.jpg";
  }
}
function returnImg() {
  if (this.id == "to-classification") {
    document.getElementById("well").src = "https://i.ibb.co/ckX2X11/well.jpg";
  }
  if (this.id == "to-collection") {
    document.getElementById("basket").src = "https://i.ibb.co/WyLhkcg/basket.jpg";
  }
  if (this.id == "to-info") {
    document.getElementById("sin").src = "https://i.ibb.co/42H1GZx/sin.jpg";
  }
}
