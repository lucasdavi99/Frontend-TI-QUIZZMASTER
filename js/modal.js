var modal = document.getElementById("myModal");
var span = document.getElementsByClassName("close")[0];
var modalText = document.getElementById("modalText");

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    window.location.href = "index.html";
  }
}

function showModal(text) {
  modalText.textContent = text;
  modal.style.display = "block";
}
