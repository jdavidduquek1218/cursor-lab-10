const timeEl = document.getElementById("time");
const btn = document.getElementById("btn");

function renderTime() {
  const now = new Date();
  timeEl.textContent = now.toLocaleString();
}

btn.addEventListener("click", renderTime);
renderTime();

