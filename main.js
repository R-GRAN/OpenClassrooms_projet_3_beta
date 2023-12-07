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
          .then((projets) => genererGallery(projets))
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
        // Si ok : Recupère les projets, actualise la homepage et la gallery de la modale
        getProjets().then((projets) => {
          genererModal_1(projets);
          genererGallery(projets);
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
function genererGallery(projets) {
  //recupere la gallery dans le DOM
  const sectionGallery = document.querySelector(".gallery");

  //efface le contenu de la gallery
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
  //Appel API et affichage dans la gallery
  try {
    let projets = await getProjets();
    genererGallery(projets);
  } catch (error) {
    console.log("error", error);
  }
}

/* Filtres */

/* Function generant les boutons filtre par catégorie */
function genererBtnFiltre() {
  //recupere la div "filters" dans le DOM
  const filters = document.getElementById("filters");

  //boucle la variable categories
  for (let category of categories) {
    //cree un element input de type button avec sa valeur et ajoute sa classe
    const btn_filters = document.createElement("input");
    btn_filters.setAttribute("type", "button");
    btn_filters.value = category.name;
    btn_filters.classList.add("btn-filters");
    //ajoute l'element au parent filters
    filters.appendChild(btn_filters);
  }
}

/* Fonction filtrant et affichant les projets dans la gallery selon le clic sur les filtres  */
async function filtrerProjets(evt) {
  try {
    //Appel API pour recuperer les projets
    let projets = await getProjets();

    // si le clic a pour valeur "tous", affiche tous les projets dans la gallery
    if (evt.target.value === "Tous") {
      genererGallery(projets);
    } else {
      // recupere les projets dont la categorie est egale à la valeur du clic
      const projetsFiltres = projets.filter(
        (projet) => projet.category.name === evt.target.value
      );
      // genère la gallery avec les projets filtrés
      genererGallery(projetsFiltres);
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
  genererModal_1(projets);

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
    afficherImg();
  }

  //enleve la modale de l'ecran et met son statut à null
  modal.style.display = "none";
  modal = null;
}

/* Fonction gerant le retour de la modale */
async function backModal() {
  const projets = await getProjets();
  const modal_wrapper_form = document.querySelector(".modal-wrapper-form");

  //efface les valeurs du formulaire
  modal_wrapper_form.reset();

  //affiche les details si l'input file ou l'image du projet à ajouter s'il y en a une
  afficherImg();

  //genere la module
  genererModal_1(projets);
}

/* Fonction generant l'affichage stade 1 de la modale : Supprimer un projet */
function genererModal_1(projets) {
  const modal_wrapper_gallery = document.querySelector(
    ".modal-wrapper-gallery"
  );

  const first_step = document.querySelector(".first-step");
  const second_step = document.querySelector(".second-step");
  const modal_back = document.querySelector(".modal-back");

  // cache le bouton "back" et lui attribut sa fonction
  modal_back.style.visibility = "hidden";
  modal_back.addEventListener("click", backModal);

  // affiche le premier contenu de la modale et enleve le second contenu
  first_step.style.display = null;
  second_step.style.display = "none";

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

    //cree l'icone poubelle et lui attibue l'id de projet
    const poubelle = document.createElement("i");
    poubelle.dataset.id = projet.id;

    //attribue la fonction permettant d'effacer le projet lors du clic
    poubelle.addEventListener("click", (evt) => supprimerProjet(evt));

    poubelle.classList.add("fa-solid", "fa-trash-can");
    figureModal.appendChild(poubelle);
  }

  //attribue au bouton "Ajouter" la fonction qui affiche le second contenu
  const modal_wrapper_btn = document.querySelector(".modal-wrapper-btn");
  modal_wrapper_btn.addEventListener("click", genererModal_2);
}

/* Fonction generant l'affichage stade 2 de la modale : Ajouter un projet */
async function genererModal_2() {
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

  //si la longueur du select du formulaire ===1 (donc n'a pas été chargé)
  if (form_select.length === 1) {
    // ecoute lorsqu'un fichier est saisi et affiche l'image du fichier
    fileUpload.addEventListener("input", afficherImg);

    //ecoute les elements du formulaire, active le bouton "valider" quand tous les elements sont remplis
    fileUpload.addEventListener("input", handleBtnValider);
    title.addEventListener("input", handleBtnValider);
    category.addEventListener("input", handleBtnValider);

    // bouton "valider" en gris
    modal_btn_valider.style.background = "#b3b3b3";

    //boucle les categories pour les mettre en options dans le select du formulaire
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
}

/* Fonction permettant d'afficher l'image du projet à ajouter*/
function afficherImg() {
  const imgToProcess = document.getElementById("fileUpload");
  const input_details = document.querySelector(".input-details ");
  const uploadedImageDiv = document.getElementById("uploadedImageDiv");

  //si aucun fichier : vider la zone d'affichage du fichier et afficher la zone explicative
  if (imgToProcess.files[0] === undefined) {
    uploadedImageDiv.innerHTML = null;
    input_details.style.display = null;
  } else {
    // si fichier chargé : créer une nouvelle image, enlever la zone explicative et afficher une image du fichier
    let newImage = new Image();
    newImage.src = URL.createObjectURL(imgToProcess.files[0]);
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

/* fonction permettant de se deconnecter en effacant le token */
function logout() {
  localStorage.removeItem("token");
}

/* Script pour index.html */

/* Fonction enregistrant les categories dans le sessionStorage si ce n'est pas le cas et generant les boutons */
async function handleBtnFiltre() {
  if (categories === null || categories === undefined) {
    categories = await getCategories();
    const categoriesValue = JSON.stringify(categories);
    sessionStorage.setItem("categories", categoriesValue);
  } else {
    categories = JSON.parse(categories);
  }
  genererBtnFiltre();
  handleBoutonsActive();
}

//recupere les projets de l'API et genère la gallery

let modal = null;
let token = localStorage.getItem("token");
let categories = sessionStorage.getItem("categories");

initialiserPage();
//enregiste les categories dans le sessionStorage  et gerant les boutons
handleBtnFiltre();

/* Si token Mode édition */

if (token !== null) {
  //modifie le lien login dans la nav en logout, la redirection et retire le token au clic
  const log = document.getElementById("loginAndOut");
  log.innerText = "logout";
  log.setAttribute("href", "index.html");
  log.addEventListener("click", logout);

  //affiche la bannière du mode édition
  const banner = document.getElementById("editor-banner");
  banner.style.display = "flex";

  //enleve les filtres
  const filters = document.getElementById("filters");
  filters.style.display = "none";

  // affiche le lien d'accès à la modale
  const modal_link = document.querySelector(".modal-link");
  modal_link.style.display = null;
  modal_link.addEventListener("click", openModal);
}
