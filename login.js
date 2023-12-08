/* ------  Gestion Login ------*/

/* Fonction permettant de se connecter */
function login() {
  //recupere le formulaire dans le DOM
  const formulaireLogin = document.querySelector(".formulaire-login");
  //ajoute un preventDefault pour eviter de recharger la page
  formulaireLogin.addEventListener("submit", (evt) => {
    evt.preventDefault();

    //recupere les valeurs des champs email et mot de passe du formulaire
    const authentifiant = {
      email: evt.target.querySelector("[name=email]").value,
      password: evt.target.querySelector("[name=password]").value,
    };
    //formate les valeurs
    const chargeUtile = JSON.stringify(authentifiant);

    try {
      fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: chargeUtile,
      }).then((res) => {
        if (!res.ok) {
          //recupere la div dans le DOM et affiche le message d'erreur durant 3,5 sec puis l'effacer
          let formError = document.getElementById("form-error");

          formError.innerHTML = "Erreur dans l’identifiant ou le mot de passe";
          setTimeout(() => {
            formError.innerHTML = "";
          }, 3550);
        } else {
          // recupere la réponse et la formate
          res
            .json()
            //enregistre le token dans le sessionStorage
            .then((data) => storeToken(data))
            //redirige la page vers index.html
            .then((location.href = "index.html"));
        }
      });
    } catch (error) {
      console.log("error", error);
    }
  });
}

/* Fonction enregistrant le token dans le sessionStorage */
function storeToken(data) {
  sessionStorage.setItem("token", JSON.stringify(data));
}

login();
