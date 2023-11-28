/* Fonction recuperant les projets de l'API */
async function fetchProjets() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("error", error);
  }
}

/* Fonction recuperant les categories de l'API */
async function fetchCategories() {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("error", error);
  }
}

/* Fonction postant un projet sur l'API */
async function postProjet() {
  const ParsedToken = JSON.parse(token);

  const newProjet = {
    image: evt.target.querySelector(/* SRC ? */).value,
    title: evt.target.querySelector("[name=title]").value,
    category: evt.target.querySelector("[name=category]").value,
  };

  const chargeUtile = JSON.stringify(newProjet);

  try {
    fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ParsedToken.token}`,
      },
      body: chargeUtile,
    }).then((res) => {
      if (!res.ok) {
        res.json().then((error) => console.log("error", error));

        let formError = document.getElementById("form-error");
        formError.innerHTML = "Erreur dans l’identifiant ou le mot de passe";
        setTimeout(() => {
          formError.innerHTML = "";
        }, 3550);
      } else {
        res
          .json()
          .then((data) => storeToken(data))
          .then((location.href = "index.html"));
      }
    });
  } catch (error) {
    console.log("error", error);
  }
}

/* Fonction generant la gallery */
function genererProjets(projets) {
  for (let i = 0; i < projets.length; i++) {
    const projet = projets[i];

    const imageElement = document.createElement("img");
    imageElement.src = projet.imageUrl;

    const figcaptionElement = document.createElement("figcaption");
    figcaptionElement.innerText = projet.title;

    const figure = document.createElement("figure");

    const sectionGallery = document.querySelector(".gallery");
    sectionGallery.appendChild(figure);
    figure.appendChild(imageElement);
    figure.appendChild(figcaptionElement);
  }
}

/* Fonction generant la gallery au début du chargement de la page */
async function initialiserPage() {
  activeBoutons();

  try {
    let projets = await fetchProjets();
    genererProjets(projets);
  } catch (error) {
    console.log("error", error);
  }
}

/* Fonction effacant la gallery */
function resetGallery() {
  document.querySelector(".gallery").innerHTML = "";
}

/* Fonction filtrant et affichant les projets selon le clic sur les filtres  */
async function filtrerProjets(evt) {
  try {
    let projets = await fetchProjets();

    if (evt.target.value === "Tous") {
      resetGallery();
      genererProjets(projets);
    } else {
      resetGallery();
      const projetsFiltres = projets.filter(
        (projet) => projet.category.name === evt.target.value
      );
      genererProjets(projetsFiltres);
    }
  } catch (error) {
    console.log("error", error);
  }
}

/* Fonction enregistrant le token dans le localStorage */
function storeToken(data) {
  localStorage.setItem("token", JSON.stringify(data));
}

/* Fonction permettant de se connecter */
function login() {
  const formulaireLogin = document.querySelector(".formulaire-login");
  formulaireLogin.addEventListener("submit", (evt) => {
    evt.preventDefault();

    const authentifiant = {
      email: evt.target.querySelector("[name=email]").value,
      password: evt.target.querySelector("[name=password]").value,
    };

    const chargeUtile = JSON.stringify(authentifiant);

    try {
      fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: chargeUtile,
      }).then((res) => {
        if (!res.ok) {
          res.json().then((error) => console.log("error", error));

          let formError = document.getElementById("form-error");
          formError.innerHTML = "Erreur dans l’identifiant ou le mot de passe";
          setTimeout(() => {
            formError.innerHTML = "";
          }, 3550);
        } else {
          res
            .json()
            .then((data) => storeToken(data))
            .then((location.href = "index.html"));
        }
      });
    } catch (error) {
      console.log("error", error);
    }
  });
}

/* fonction permettant de se deconnecter */
function logout() {
  localStorage.removeItem("token");
}

/* Modale */

let modal = null;

/* Fonction gerant l'ouverture de la modale */
async function openModal(evt) {
  evt.preventDefault();
  let projets = await fetchProjets();
  genererProjetsModal(projets);
  let target = document.querySelector(evt.target.getAttribute("href"));
  target.style.display = null;
  modal = target;
  modal.addEventListener("click", closeModal);
  modal.querySelector(".modal-close").addEventListener("click", closeModal);
  modal.querySelector(".modal-stop").addEventListener("click", stopPropagation);
}

/* Fonction gerant la fermeture de la modale */
function closeModal(evt) {
  if (modal === null) return;
  evt.preventDefault();
  modal.style.display = "none";
  modal = null;
}

function stopPropagation(evt) {
  evt.stopPropagation();
}

/* Fonction permettant de supprimer un projet de l'API*/
function supprimerProjet(evt) {
  const id = evt.target.dataset.id;
  const ParsedToken = JSON.parse(token);
  try {
    fetch(`http://localhost:5678/api/works/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${ParsedToken.token}` },
    }).then((res) => {
      if (!res.ok) {
        (error) => console.log("error", error);
      } else {
        fetchProjets().then((res) => genererProjetsModal(res));
      }
    });
  } catch (error) {
    console.log("error", error);
  }
}

/* Fonction permettant d'uploader une image */
function uploadImg(img) {
  let imgToProcess = img.target.files[0];

  let newImage = new Image();
  newImage.src = URL.createObjectURL(imgToProcess);

  let display = document.getElementById("uploadedImageDiv");
  const input_details = document.querySelector(".input-details ");
  input_details.style.display = "none";
  display.appendChild(newImage);
}

/* Fonction generant la gallery de la modale */
function genererProjetsModal(projets) {
  const modal_wrapper_gallery = document.querySelector(
    ".modal-wrapper-gallery"
  );

  const modal_wrapper_form = document.querySelector(".modal-wrapper-form");
  modal_wrapper_form.style.display = "none";

  const modal_wrapper_btn = document.querySelector(".modal-wrapper-btn");
  modal_wrapper_btn.addEventListener("click", genererModalAjouter);

  modal_wrapper_gallery.innerHTML = "";

  for (let i = 0; i < projets.length; i++) {
    const projet = projets[i];

    const figureModal = document.createElement("figure");

    const imageElement = document.createElement("img");
    imageElement.src = projet.imageUrl;
    imageElement.dataset.id = projet.id;

    modal_wrapper_gallery.appendChild(figureModal);
    figureModal.appendChild(imageElement);

    const poubelle = document.createElement("i");

    figureModal.addEventListener("click", (evt) => supprimerProjet(evt));

    poubelle.classList.add("fa-solid", "fa-trash-can");
    figureModal.appendChild(poubelle);
  }
}

/* Fonction generant l'affichage stade 2 de la modale */
async function genererModalAjouter() {
  const modal_previously = document.querySelector(".modal-previoulsy");
  const modal_wrapper_title = document.querySelector(".modal-wrapper-title");
  const modal_wrapper_gallery = document.querySelector(
    ".modal-wrapper-gallery"
  );
  const form_select = document.querySelector(".form-select");
  const modal_wrapper_form = document.querySelector(".modal-wrapper-form");
  const fileUpload = document.getElementById("fileUpload");

  modal_previously.style.visibility = "visible";
  modal_wrapper_title.innerText = "Ajout photo";
  modal_wrapper_form.style.display = "";
  modal_wrapper_gallery.style.display = "none";
  fileUpload.addEventListener("change", (img) => uploadImg(img));

  let categories = await fetchCategories();

  for (let i = 0; i < categories.length; i++) {
    let categorie = categories[i];

    let optionElement = document.createElement("option");
    optionElement.innerText = categorie.name;
    optionElement.value = categorie.id;
    form_select.appendChild(optionElement);
  }
}

/* Filtre*/
/* Fonction gerant les boutons filtres */
function activeBoutons() {
  const btns_filters = document.querySelectorAll(".btn-filters");
  btns_filters.forEach((btn) =>
    btn.addEventListener("click", (evt) => {
      filtrerProjets(evt);
      document.querySelector(".active").classList.remove("active");
      btn.classList.add("active");
    })
  );
}

initialiserPage();

let token = localStorage.getItem("token");

if (token !== null) {
  const log = document.getElementById("inAndOut");
  log.innerText = "logout";
  log.setAttribute("href", "index.html");
  log.addEventListener("click", logout());

  const banner = document.getElementById("editor-banner");
  banner.style.display = "flex";

  const filters = document.getElementById("filters");
  filters.style.display = "none";

  const modal_link = document.querySelector(".modal-link");
  modal_link.style.display = "";
  modal_link.addEventListener("click", openModal);
}

login();
