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
async function postProjet(evt) {
  evt.preventDefault();

  //parse le token pour pouvoir l'inclure dans le header
  const ParsedToken = JSON.parse(token);

  //recupère les valeurs du formulaire
  const image = document.getElementById("fileUpload").files[0];
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;

  //Crée un "objet" qui formate les valeurs du formulaire
  const formData = new FormData();
  formData.append("image", image);
  formData.append("title", title);
  formData.append("category", category);

  try {
    fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ParsedToken.token}`,
      },
      body: formData,
    }).then((res) => {
      if (!res.ok) {
        res.json().then((error) => console.log("error", error));
      } else {
        // Si ok : Recupère les projets, actualise la galerie, ferme la modale
        getProjets()
          .then((projets) => genererProjetsGallery(projets))
          .then(closeModal(evt));
      }
    });
  } catch (error) {
    console.log("error", error);
  }
}

/* Fonction permettant de supprimer un projet de l'API*/
async function supprimerProjet(evt) {
  //Recupère l'id de l'element sur lequel on a cliqué
  const id = evt.target.dataset.id;

  //Parse le token pour l'inclure au header
  const ParsedToken = JSON.parse(token);

  try {
    fetch(`http://localhost:5678/api/works/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${ParsedToken.token}` },
    }).then((res) => {
      if (!res.ok) {
        (error) => console.log("error", error);
      } else {
        // Si ok : Recupère les projets, actualise la gallery et la gallery de la modale
        getProjets().then((projets) => {
          genererProjetsModal(projets);
          genererProjetsGallery(projets);
        });
      }
    });
  } catch (error) {
    console.log("error", error);
  }
}

/* ------  Gestion de contenu ------*/

/* Gallery */

/* Fonction generant la gallery */
function genererProjetsGallery(projets) {
  //efface le contenu de la gallery
  const sectionGallery = document.querySelector(".gallery");
  resetGallery();

  //boucle les projets en parametre pour les integrer dans la gallery
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

/* Fonction effacant la gallery */
function resetGallery() {
  document.querySelector(".gallery").innerHTML = "";
}

/* Fonction generant la gallery au début du chargement de la page */
async function initialiserPage() {
  //filtre et affiche les projets selon le clic sur les filtres
  handleBoutonsActive();

  //Appel API et affichage dans la gallery
  try {
    let projets = await getProjets();
    genererProjetsGallery(projets);
  } catch (error) {
    console.log("error", error);
  }
}

/* Filtres */

/* Fonction filtrant et affichant les projets dans la gallery selon le clic sur les filtres  */
async function filtrerProjets(evt) {
  try {
    //Appel API
    let projets = await getProjets();

    // efface la gallery
    resetGallery();

    // si le clic a pour valeur "tous", affiche tous les projets dans la gallery
    if (evt.target.value === "Tous") {
      genererProjetsGallery(projets);
    } else {
      // recupere les projets dont la categorie est egale à la valeur du clic
      const projetsFiltres = projets.filter(
        (projet) => projet.category.name === evt.target.value
      );
      // genère la gallery avec les projets filtrés
      genererProjetsGallery(projetsFiltres);
    }
  } catch (error) {
    console.log("error", error);
  }
}

/* Fonction attribuant et gerant le comportement des boutons filtres */
function handleBoutonsActive() {
  //recupere les boutons filtres et leurs ajoute la fonction pour filtrer et afficher les projets
  const btns_filters = document.querySelectorAll(".btn-filters");
  btns_filters.forEach((btn) =>
    btn.addEventListener("click", (evt) => {
      filtrerProjets(evt);
      //recupere le bouton avec la classe "active", lui enleve et l'attribue au bouton cliqué
      document.querySelector(".active").classList.remove("active");
      btn.classList.add("active");
    })
  );
}

/* Modale */
/* Fonction gerant l'ouverture de la modale */
async function openModal(evt) {
  evt.preventDefault();

  //recupere les projets et les affiche dans la modale
  let projets = await getProjets();
  genererProjetsModal(projets);

  //recupere la modale et l'affiche
  let target = document.querySelector(evt.target.getAttribute("href"));
  target.style.display = null;

  // definie la modale dans le scope global
  modal = target;

  //ajoute les fonctions gerant la fermeture de la modale
  modal.addEventListener("click", closeModal);
  modal.querySelector(".modal-close").addEventListener("click", closeModal);
  modal
    .querySelector(".modal-stop")
    .addEventListener("click", (evt) => evt.stopPropagation());
}

/* Fonction gerant la fermeture de la modale */
function closeModal(evt) {
  evt.preventDefault();
  const modal_wrapper_form = document.querySelector(".modal-wrapper-form");
  //verification : si le status de la modale est null, ne rien faire
  if (modal === null) return;

  //si le formulaire est défini, efface ses valeurs
  if (modal_wrapper_form) {
    modal_wrapper_form.reset();
  }

  //enleve la modale de l'ecran et met son statut à null
  modal.style.display = "none";
  modal = null;
}

/* Fonction generant l'affichage stade 1 de la modale : Supprimer un projet */
function genererProjetsModal(projets) {
  const modal_wrapper_gallery = document.querySelector(
    ".modal-wrapper-gallery"
  );

  const first_step = document.querySelector(".first-step");
  const second_step = document.querySelector(".second-step");
  const modal_back = document.querySelector(".modal-back");

  // cache le bouton "back" et lui attribut sa fonction
  modal_back.style.visibility = "hidden";
  modal_back.addEventListener("click", (projets) =>
    genererProjetsModal(projets)
  );

  // affiche le premier contenu de la modale et enleve le second contenu
  first_step.style.display = null;
  second_step.style.display = "none";

  //attribue au bouton "Ajouter" la fonction qui affiche le second contenu
  const modal_wrapper_btn = document.querySelector(".modal-wrapper-btn");
  modal_wrapper_btn.addEventListener("click", genererModalAjouter);

  //vide la gallery de la modale
  modal_wrapper_gallery.innerHTML = "";

  //boucle les projets en parametre pour les integrer dans la gallery de la modale
  for (let i = 0; i < projets.length; i++) {
    const projet = projets[i];

    const figureModal = document.createElement("figure");

    const imageElement = document.createElement("img");
    imageElement.src = projet.imageUrl;

    modal_wrapper_gallery.appendChild(figureModal);
    figureModal.appendChild(imageElement);

    const poubelle = document.createElement("i");
    poubelle.dataset.id = projet.id;

    //attribue la fonction permettant d'effacer le projet lors du clic
    poubelle.addEventListener("click", (evt) => supprimerProjet(evt));

    poubelle.classList.add("fa-solid", "fa-trash-can");
    figureModal.appendChild(poubelle);
  }
}

/* Fonction generant l'affichage stade 2 de la modale : Ajouter un projet */
async function genererModalAjouter() {
  const first_step = document.querySelector(".first-step");
  const second_step = document.querySelector(".second-step");
  const modal_back = document.querySelector(".modal-back");
  const form_select = document.querySelector(".form-select");
  const modal_wrapper_form = document.querySelector(".modal-wrapper-form");
  const fileUpload = document.getElementById("fileUpload");
  const title = document.getElementById("title");
  const category = document.getElementById("category");
  const modal_btn_valider = document.getElementById("modal-btn-valider");

  //enleve le premier contenu de la modale et affiche le second
  first_step.style.display = "none";
  second_step.style.display = null;

  // rend visible le bouton "back"
  modal_back.style.visibility = "visible";

  // ecoute lorsqu'un fichier est saisi et affiche l'image du fichier
  fileUpload.addEventListener("input", (img) => afficherImg(img));

  //ecoute les elements du formulaire, active le bouton "valider" quand tous les elements sont remplis
  fileUpload.addEventListener("input", handleBtnValider);
  title.addEventListener("input", handleBtnValider);
  category.addEventListener("input", handleBtnValider);

  // bouton "valider" en gris
  modal_btn_valider.style.background = "#b3b3b3";

  //recupere les categories de l'API et les boucles pour les mettre en options dans le select du formulaire
  let categories = await getCategories();

  for (let i = 0; i < categories.length; i++) {
    let categorie = categories[i];

    let optionElement = document.createElement("option");
    optionElement.innerText = categorie.name;
    optionElement.value = categorie.id;
    form_select.appendChild(optionElement);
  }

  //Ajoute la fonction qui permet de poster un projet lors du declenchement du submit
  modal_wrapper_form.addEventListener("submit", (evt) => postProjet(evt));
}

/* Fonction permettant d'afficher l'image du projet à ajouter*/
function afficherImg(img) {
  const imgToProcess = img.target.files[0];
  const input_details = document.querySelector(".input-details ");
  const uploadedImageDiv = document.getElementById("uploadedImageDiv");
  //si aucun fichier : vider la zone d'affichage du fichier et afficher la zone explicative
  if (imgToProcess === undefined) {
    uploadedImageDiv.innerHTML = null;
    input_details.style.display = null;
  } else {
    // si fichier chargé : créer une nouvelle image, enlever la zone explicative et afficher une image du fichier
    let newImage = new Image();
    newImage.src = URL.createObjectURL(imgToProcess);

    input_details.style.display = "none";
    uploadedImageDiv.innerHTML = null;
    uploadedImageDiv.appendChild(newImage);
  }
}

/* fonction gerant le comportement du bouton "valider" */
function handleBtnValider() {
  const modal_btn_valider = document.getElementById("modal-btn-valider");

  //si les elements du formulaire sont définis : bouton "valider" activé et son background passe a sa couleur d'origine (vert)
  if (fileUpload.files[0] && title.value && category.value) {
    modal_btn_valider.disabled = false;
    modal_btn_valider.style.background = null;
  } else {
    //sinon : bouton "valider" désactivé, background passe au gris
    modal_btn_valider.disabled = true;
    modal_btn_valider.style.background = "#A7A7A7";
  }
}

/* ------  Gestion Logout ------*/

/* fonction permettant de se deconnecter en effacant le tooken */
function logout() {
  localStorage.removeItem("token");
}

/* Script pour index.html */

initialiserPage();

let modal = null;
let token = localStorage.getItem("token");

/* Si token Mode édition */

if (token !== null) {
  const log = document.getElementById("inAndOut");
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
