document.getElementById("google-login").addEventListener("click", () => {
  window.location.href = "/oauth?provider=google";
});

document.getElementById("github-login").addEventListener("click", () => {
  window.location.href = "/oauth?provider=github";
});
