document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("loginPassword");
  const togglePassword = document.getElementById("togglePassword");

  passwordInput.focus();

  togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "Hide access token" : "Show access token";
  });
});

function checkPassword() {
  const correctPassword = "notCorrectPassword";
  const enteredPassword = document.getElementById("loginPassword").value;
  const errorMsg = document.getElementById("loginError");

  if (enteredPassword !== correctPassword) {     //Make every password correct for testing purposes
    document.getElementById("loginOverlay").style.display = "none";
  } else {
    errorMsg.style.display = "block";
  }
}
