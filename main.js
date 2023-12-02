/* ------ Appels API  ------*/

/* Fonction recuperant les projets de l'API */
async function getProjets() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("error", error);
  }
}

/* Fonction recuperant les categories de l'API */
async function getCategories() {
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
  const file = document.getElementById("fileUpload").files[0];
  const title = document.getElementById("title").value;
  const categorie = document.getElementById("category").value;

  const ParsedToken = JSON.parse(token);

  const formData = new FormData();

  formData.append("image", file);
  formData.append("title", title);
  formData.append("category", categorie);

  try {
    let response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ParsedToken.token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      let error = await response.json();
      console.log("error", error);
    } else {
      let result = await response.json();
      console.log(result);
    }
  } catch (error) {
    console.log("error", error);
  }
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
        console.log("suppression ok");
      }
    });
  } catch (error) {
    console.log("error", error);
  }
}

/* ------  Fin Appels API  ------*/

/* ------  Gestion de contenu ------*/

/* Gallery */

/* Fonction generant la gallery */
function genererProjetsGallery(projets) {
  /* Efface la gallery */
  const sectionGallery = document.querySelector(".gallery");
  sectionGallery.innerHTML = "";

  /* Boucle chaque projet pour l'afficher dans la gallery  */
  for (const projet of projets) {
    const imageElement = document.createElement("img");
    imageElement.src = projet.imageUrl;

    const figcaptionElement = document.createElement("figcaption");
    figcaptionElement.innerText = projet.title;

    const figure = document.createElement("figure");

    sectionGallery.appendChild(figure);
    figure.appendChild(imageElement);
    figure.appendChild(figcaptionElement);
  }
}

/* Fonction generant la gallery au début du chargement de la page */
async function initialiserPage() {
  activeBoutons();
  try {
    let projets = await getProjets();
    genererProjetsGallery(projets);
  } catch (error) {
    console.log("error", error);
  }
}

/* Fonction gerant l'affichage des gallery + gallery modale apres la suppression d'un projet */
async function refresh() {
  const projets = await getProjets();

  /* actualise l'affichage avec les nouveaux projets */
  genererProjetsGallery(projets);
  genererProjetsModal(projets);
}

/* Filtres */

/* Fonction filtrant et affichant les projets selon le clic sur les filtres  */
async function filtrerProjets(evt) {
  try {
    let projets = await getProjets();

    resetGallery();

    if (evt.target.value === "Tous") {
      genererProjetsGallery(projets);
    } else {
      const projetsFiltres = projets.filter(
        (projet) => projet.category.name === evt.target.value
      );
      genererProjetsGallery(projetsFiltres);
    }
  } catch (error) {
    console.log("error", error);
  }
}

/* Fonction attribuant et gerant le comportement des boutons filtres */
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

/* Modale */

/* Fonction gerant l'ouverture de la modale */
async function openModal(evt) {
  evt.preventDefault();
  let projets = await getProjets();
  genererProjetsModal(projets);
  let target = document.querySelector(evt.target.getAttribute("href"));
  target.style.display = null;
  modal = target;
  modal.addEventListener("click", closeModal);
  modal.querySelector(".modal-close").addEventListener("click", closeModal);
  modal
    .querySelector(".modal-stop")
    .addEventListener("click", (evt) => evt.stopPropagation());
}

/* Fonction gerant la fermeture de la modale */
function closeModal(evt) {
  if (modal === null) return;
  evt.preventDefault();
  modal.style.display = "none";
  modal = null;
}

/* Fonction generant l'affichage stade 1 de la modale : Supprimer un projet */
function genererProjetsModal(projets) {
  const modal_wrapper_gallery = document.querySelector(
    ".modal-wrapper-gallery"
  );
  const modal_wrapper_form = document.querySelector(".modal-wrapper-form");
  const modal_wrapper_btn = document.querySelector(".modal-wrapper-btn");

  /* vide le contenu des projets de la modale */
  modal_wrapper_gallery.innerHTML = "";
  /* Enleve le formulaire de la modale */
  modal_wrapper_form.style.display = "none";

  modal_wrapper_btn.addEventListener("click", genererModalAjouter);

  /* Boucle les projets pour ajouter l'icone et la fonction de suppression du projet */

  for (let i = 0; i < projets.length; i++) {
    const projet = projets[i];

    const figureModal = document.createElement("figure");
    const imageElement = document.createElement("img");
    imageElement.src = projet.imageUrl;

    const poubelle = document.createElement("i");
    poubelle.dataset.id = projet.id;
    poubelle.addEventListener("click", (evt) => {
      supprimerProjet(evt);
      refresh();
    });
    poubelle.classList.add("fa-solid", "fa-trash-can");

    modal_wrapper_gallery.appendChild(figureModal);
    figureModal.appendChild(imageElement);

    figureModal.appendChild(poubelle);
  }
}

/* Fonction generant l'affichage stade 2 de la modale : Ajouter un projet */
async function genererModalAjouter() {
  const modal_back = document.querySelector(".modal-back");
  const modal_wrapper_title = document.querySelector(".modal-wrapper-title");
  const modal_wrapper_gallery = document.querySelector(
    ".modal-wrapper-gallery"
  );
  const form_select = document.querySelector(".form-select");
  const modal_wrapper_form = document.querySelector(".modal-wrapper-form");
  const fileUpload = document.getElementById("fileUpload");

  modal_back.style.visibility = "visible";
  modal_wrapper_title.innerText = "Ajout photo";
  modal_wrapper_form.style.display = "";
  modal_wrapper_gallery.style.display = "none";
  fileUpload.addEventListener("change", (img) => afficherImg(img));

  let categories = await getCategories();

  for (let i = 0; i < categories.length; i++) {
    let categorie = categories[i];

    let optionElement = document.createElement("option");
    optionElement.innerText = categorie.name;
    optionElement.value = categorie.id;
    form_select.appendChild(optionElement);
  }

  modal_wrapper_form.addEventListener("submit", (evt) => {
    evt.preventDefault();
    postProjet();
    closeModal(evt);
    refresh();
  });
}

/* Fonction permettant d'afficher l'image du projet à ajouter*/
function afficherImg(img) {
  let imgToProcess = img.target.files[0];

  let newImage = new Image();
  newImage.src = URL.createObjectURL(imgToProcess);

  let display = document.getElementById("uploadedImageDiv");
  const input_details = document.querySelector(".input-details ");
  input_details.style.display = "none";
  display.appendChild(newImage);
}

/* ------  Fin Gestion de contenu ------*/

/* ------  Gestion Login ------*/

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

/* ------  Fin Gestion Login ------*/

/* Script pour index.html */

let modal = null;

let token = localStorage.getItem("token");

initialiserPage();

/* Comportement si le token est détécté ( Mode Edition ) */

if (token !== null) {
  const log = document.getElementById("loginAndOut");
  log.innerText = "logout";
  log.setAttribute("href", "index.html");
  log.addEventListener("click", logout);

  const banner = document.getElementById("editor-banner");
  banner.style.display = "flex";

  const filters = document.getElementById("filters");
  filters.style.display = "none";

  const modal_link = document.querySelector(".modal-link");
  modal_link.style.display = "";
  modal_link.addEventListener("click", openModal);
}

/* Script pour page form.html TODO : EXPORT OU MODIFIER STRUCTURE */

login();
