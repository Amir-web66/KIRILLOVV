const projects = [
  {
    title: "AI-Enhanced IDS Integration (PFA)",
    description:
      "Integrated AI-based intrusion detection with firewall systems to monitor network and application-layer threats, with log analysis for performance evaluation.",
    stack: ["Cybersecurity", "AI", "Network Defense"],
    link: "",
    linkText: "Not completed yet "
  },
  {
    title: "Hotel Reservation Management System",
    description:
      "Built in C with CRUD operations, persistent file storage, and organized menu flows in static and dynamic versions.",
    stack: ["C", "Data Management", "CLI Architecture"]
  },
  {
    title: "Brain Rot Detox Dashboard & Web App",
    description:
      "Created a Streamlit app for daily habit tracking with charts and productivity analysis visualizations.",
    stack: ["Python", "Streamlit", "Data Visualization"]
  },
  {
    title: "CTF Challenges & Security Labs",
    description:
      "Active in scenario-based security labs with personal challenge creation and security writeup practice.",
    stack: ["CTF", "Reverse Engineering", "Web Security"]
  }
];

const certificationsFallback = [
  {
    title: "Deep Learning Fundamentals - NVIDIA",
    image: "assets/certs/nvidia-dl-cert.png"
  },
  {
    title: "CTF Participation - Securinets",
    image: "assets/certs/ctf-securinets.png"
  },
  {
    title: "Taekwondo Black Belt - 1st Dan"
  }
];

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCBNUffLGqEShvKgypuSSZj6eQqzRU1wdI",
  authDomain: "kirillov-wrld-portfolio.firebaseapp.com",
  projectId: "kirillov-wrld-portfolio",
  appId: "1:77119971642:web:8870ba46b0ddb493897003"
};

const ADMIN_UID = "PkcNX4CpnVQqnXs9c3XwmmiW1nG3";

const LOCAL_ENTRIES_KEY = "kirillov_custom_entries";
let firestoreDb = null;
let customEntries = [];
let authInstance = null;
let currentUser = null;
let isAdminUser = false;

function hasFirebaseConfig(config) {
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}

function initFirebase() {
  if (!window.firebase || !hasFirebaseConfig(FIREBASE_CONFIG)) {
    return;
  }

  try {
    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(FIREBASE_CONFIG);
    }
    firestoreDb = window.firebase.firestore();
    authInstance = window.firebase.auth();
  } catch (_) {
    firestoreDb = null;
    authInstance = null;
  }
}

function readLocalEntries() {
  try {
    const value = localStorage.getItem(LOCAL_ENTRIES_KEY);
    if (!value) {
      return [];
    }
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function saveLocalEntries(entries) {
  localStorage.setItem(LOCAL_ENTRIES_KEY, JSON.stringify(entries));
}

async function readRemoteEntries() {
  if (!firestoreDb) {
    return [];
  }

  try {
    const snapshot = await firestoreDb.collection("portfolioEntries").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (_) {
    return [];
  }
}

async function persistEntry(entry) {
  if (!isAdminUser) {
    return "forbidden";
  }

  if (!firestoreDb) {
    return "error";
  }

  try {
    await firestoreDb.collection("portfolioEntries").add(entry);
    return "firebase";
  } catch (_) {
    return "error";
  }
}

function mergeCustomEntries(baseItems, type) {
  const customItems = customEntries
    .filter((entry) => entry.type === type)
    .map((entry) => {
      if (type === "project") {
        return {
          title: entry.title,
          description: entry.description,
          stack: entry.stack || [],
          image: entry.image || "",
          link: entry.link || "",
          linkText: entry.linkText || "Open"
        };
      }

      return {
        title: entry.title,
        description: entry.description,
        image: entry.image || "",
        link: entry.link || "",
        linkText: entry.linkText || "Open"
      };
    });

  return [...baseItems, ...customItems];
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

function createCard({ title, description, stack, image, link, linkText }) {
  const card = document.createElement("article");
  card.className = "card";

  if (image) {
    const img = document.createElement("img");
    img.className = "thumb";
    img.src = image;
    img.alt = `${title} preview`;
    card.appendChild(img);
  }

  const h3 = document.createElement("h3");
  h3.textContent = title;
  card.appendChild(h3);

  if (description) {
    const p = document.createElement("p");
    p.textContent = description;
    card.appendChild(p);
  }

  if (stack?.length) {
    const stackRow = document.createElement("p");
    stackRow.textContent = `Stack: ${stack.join(" | ")}`;
    card.appendChild(stackRow);
  }

  if (link) {
    const a = document.createElement("a");
    a.href = link;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.textContent = linkText || "Open";
    card.appendChild(a);
  }

  return card;
}

function renderProjects() {
  const grid = document.getElementById("projects-grid");
  grid.innerHTML = "";
  const items = mergeCustomEntries(projects, "project");
  items.forEach((project) => grid.appendChild(createCard(project)));
}

async function getCertifications() {
  try {
    const response = await fetch("assets/certs/certificates.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("certificates.json not found");
    }

    const certs = await response.json();
    if (!Array.isArray(certs)) {
      throw new Error("Invalid certificates.json format");
    }

    return mergeCustomEntries(certs, "certification");
  } catch (_) {
    return mergeCustomEntries(certificationsFallback, "certification");
  }
}

async function renderCertifications() {
  const grid = document.getElementById("certs-grid");
  grid.innerHTML = "";
  const certifications = await getCertifications();
  certifications.forEach((cert) => grid.appendChild(createCard(cert)));
}

function setupRevealAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

function setupMobileMenu() {
  const button = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");

  button.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
  });
}

function setupAboutTyping() {
  const target = document.getElementById("about-typing-text");
  if (!target) {
    return;
  }

  const lines = [
    "Amir | ICT Engineering Student",
    "Cybersecurity | Cloud | AI",
    "Consistency > Hype"
  ];

  let lineIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const currentLine = lines[lineIndex];

    if (!deleting) {
      charIndex += 1;
      target.textContent = currentLine.slice(0, charIndex);

      if (charIndex >= currentLine.length) {
        deleting = true;
        setTimeout(tick, 1150);
        return;
      }

      setTimeout(tick, 56);
      return;
    }

    charIndex -= 1;
    target.textContent = currentLine.slice(0, charIndex);

    if (charIndex <= 0) {
      deleting = false;
      lineIndex = (lineIndex + 1) % lines.length;
      setTimeout(tick, 360);
      return;
    }

    setTimeout(tick, 30);
  };

  tick();
}

function setupResearchPanel() {
  const panel = document.getElementById("research-content");
  const toggle = document.getElementById("research-toggle");
  const close = document.getElementById("research-close");
  const entriesRoot = document.getElementById("research-entries");

  if (!panel || !toggle || !close || !entriesRoot) {
    return;
  }

  const entries = [
    {
      date: "2026-03-24",
      title: "IDS + Firewall Lab",
      content: "Refined Suricata alert tuning and reviewed log quality for lower false positives."
    },
    {
      date: "2026-03-22",
      title: "Portfolio Iteration",
      content: "Shipped dynamic cert loading and local/Firebase entry persistence flow."
    },
    {
      date: "2026-03-20",
      title: "Cloud Practice",
      content: "Validated hosting configurations and deployment checks for static delivery."
    }
  ];

  entriesRoot.innerHTML = entries
    .map(
      (entry) =>
        `<article class="research-entry"><p class="research-date">${entry.date}</p><p class="research-title">${entry.title}</p><p class="research-text">${entry.content}</p></article>`
    )
    .join("");

  const openPanel = () => {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
  };

  const closePanel = () => {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  };

  toggle.addEventListener("click", openPanel);
  close.addEventListener("click", closePanel);
}

function setupAddModal() {
  const openBtn = document.getElementById("open-add-modal");
  const closeBtn = document.getElementById("close-add-modal");
  const modal = document.getElementById("add-entry-modal");
  const form = document.getElementById("add-entry-form");

  const openModal = () => {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  };

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isAdminUser) {
      window.alert("Admin login required to add entries.");
      return;
    }

    const type = document.getElementById("entry-type").value;
    const title = document.getElementById("entry-title").value.trim();
    const description = document.getElementById("entry-description").value.trim();
    const stackRaw = document.getElementById("entry-stack").value.trim();
    const link = document.getElementById("entry-link").value.trim();
    const linkText = document.getElementById("entry-link-text").value.trim();
    const imageInput = document.getElementById("entry-image").value.trim();
    const fileInput = document.getElementById("entry-file");

    if (!title) {
      return;
    }

    let image = imageInput;
    if (!image && fileInput.files && fileInput.files[0]) {
      try {
        image = await fileToDataUrl(fileInput.files[0]);
      } catch (_) {
        image = "";
      }
    }

    const entry = {
      type,
      title,
      description,
      stack: stackRaw
        ? stackRaw.split(",").map((value) => value.trim()).filter(Boolean)
        : [],
      link,
      linkText,
      image,
      createdAt: Date.now()
    };

    const mode = await persistEntry(entry);
    customEntries.push(entry);

    if (type === "project") {
      renderProjects();
    } else {
      await renderCertifications();
    }

    form.reset();
    closeModal();

    const message = mode === "firebase"
      ? "Entry saved to Firebase."
      : mode === "forbidden"
        ? "Only admin can add entries."
        : "Could not save entry. Check Firebase Auth and Firestore rules.";
    window.alert(message);
  });
}

function setupAdminAuth() {
  const authBtn = document.getElementById("admin-auth-btn");
  const addBtn = document.getElementById("open-add-modal");

  if (!authBtn || !addBtn) {
    return;
  }

  const updateAdminUi = () => {
    if (isAdminUser) {
      authBtn.textContent = "Admin Logout";
      addBtn.style.display = "grid";
      return;
    }

    authBtn.textContent = currentUser ? "Logout (Not Admin)" : "Admin Login";
    addBtn.style.display = "none";
  };

  if (!authInstance) {
    authBtn.style.display = "none";
    addBtn.style.display = "none";
    return;
  }

  authInstance.onAuthStateChanged((user) => {
    currentUser = user;
    isAdminUser = Boolean(user && user.uid && user.uid === ADMIN_UID);
    updateAdminUi();
  });

  authBtn.addEventListener("click", async () => {
    if (currentUser) {
      try {
        await authInstance.signOut();
      } catch (_) {
        window.alert("Logout failed. Please try again.");
      }
      return;
    }

    const email = window.prompt("Admin email:");
    if (!email) {
      return;
    }

    const password = window.prompt("Admin password:");
    if (!password) {
      return;
    }

    try {
      const session = await authInstance.signInWithEmailAndPassword(email, password);
      if (!session.user || session.user.uid !== ADMIN_UID) {
        window.alert("Logged in, but this account is not the configured admin UID.");
      }
    } catch (_) {
      window.alert("Login failed. Check email/password and authorized domain.");
    }
  });
}

async function loadCustomEntries() {
  initFirebase();

  if (!firestoreDb) {
    customEntries = [];
    return;
  }

  customEntries = await readRemoteEntries();
}

async function boot() {
  await loadCustomEntries();
  renderProjects();
  await renderCertifications();
  setupRevealAnimations();
  setupMobileMenu();
  setupAboutTyping();
  setupResearchPanel();
  setupAdminAuth();
  setupAddModal();
}

boot();
