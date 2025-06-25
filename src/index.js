// Use the Met Museum API for public art
const API_SEARCH_URL = "https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=";
const API_OBJECT_URL = "https://collectionapi.metmuseum.org/public/collection/v1/objects/";
const gallerySection = document.getElementById("gallery-section");
const createSection = document.getElementById("create-section");
const viewGalleryBtn = document.getElementById("view-gallery-btn");
const createArtBtn = document.getElementById("create-art-btn");
const artworkList = document.getElementById("artwork-list"); 
const searchInput = document.getElementById("search");
const toggleThemeBtn = document.getElementById("toggle-theme");
const drawCanvas = document.getElementById("draw-canvas");
const colorPicker = document.getElementById("color-picker");
const eraserBtn = document.getElementById("eraser-btn");
const clearCanvasBtn = document.getElementById("clear-canvas-btn");


//  Navigation 
viewGalleryBtn.addEventListener("click", () => {
  gallerySection.style.display = "";
  createSection.style.display = "none";
});

createArtBtn.addEventListener("click", () => {
  gallerySection.style.display = "none";
  createSection.style.display = "";
});

// Theme Toggle 
  toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
});

// Fetch and Render Artworks from Met API
function fetchArtworks(query = "painting") {
  artworkList.innerHTML = "<p>Loading...</p>";
  fetch(API_SEARCH_URL + encodeURIComponent(query))
    .then(res => res.json())
    .then(data => {
      // Limit to first 20 artworks for performance
      const ids = data.objectIDs ? data.objectIDs.slice(0, 5) : [];
      return Promise.all(
        ids.map(id =>
          fetch(API_OBJECT_URL + id)
            .then(res => res.json())
        )
      );
    })
    .then(renderArtworks);
}

function renderArtworks(artworks) {
  artworkList.innerHTML = "";
  const validArtworks = artworks.filter(art => art.primaryImageSmall);
  if (validArtworks.length === 0) {
    artworkList.innerHTML = "<p>No artworks found for this search.</p>";
    return;
  }
  validArtworks.forEach(art => {
    const card = document.createElement("div");
    card.className = "art-card";
    card.innerHTML = `
      <img src="${art.primaryImageSmall}" alt="${art.title}" width="200">
      <h3>${art.title}</h3>
      <p>By: ${art.artistDisplayName || "Unknown"}</p>
      <p>Year: ${art.objectDate || "N/A"}</p>
    `;
    artworkList.appendChild(card);
  });
}

//  Search Artworks
let searchTimeout;
if (searchInput) {
  searchInput.addEventListener("input", e => {
    clearTimeout(searchTimeout);
    const term = e.target.value.trim();
    searchTimeout = setTimeout(() => {
      fetchArtworks(term || "painting");
    }, 500);
  });
}

// Drawing Canvas with Color Picker and Eraser
if (drawCanvas) {
  const ctx = drawCanvas.getContext("2d");
  let drawing = false;
  let currentColor = "#000000";
  let erasing = false;

  ctx.strokeStyle = currentColor;
  ctx.lineWidth = 2;

  if (colorPicker) {
    colorPicker.addEventListener("input", (e) => {
      currentColor = e.target.value;
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 2;
      erasing = false;
      if (eraserBtn) eraserBtn.textContent = "Eraser";
    });
  }

  if (eraserBtn) {
    eraserBtn.addEventListener("click", () => {
      erasing = !erasing;
      ctx.strokeStyle = erasing ? "#fff" : currentColor;
      ctx.lineWidth = erasing ? 15 : 2;
      eraserBtn.textContent = erasing ? "Drawing Mode" : "Eraser";
    });
  }

  drawCanvas.addEventListener("mousedown", e => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });

  drawCanvas.addEventListener("mousemove", e => {
    if (drawing) {
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    }
  });

  drawCanvas.addEventListener("mouseup", () => {
    drawing = false;
  });

  drawCanvas.addEventListener("mouseleave", () => {
    drawing = false;
  });

  if (drawCanvas && clearCanvasBtn) {
    clearCanvasBtn.addEventListener("click", () => {
      ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    });
  }
}

// Initial Load
fetchArtworks();