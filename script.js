// Import Google API
const google = window.google

// Google Login Configuration
let googleUser = null
let googleApiLoaded = false

// Load Google API dynamically
function loadGoogleAPI() {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.accounts) {
      googleApiLoaded = true
      resolve(true)
      return
    }

    // Create script element
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true

    script.onload = () => {
      console.log("Google API script loaded successfully")
      // Wait a bit for the API to initialize
      setTimeout(() => {
        if (window.google && window.google.accounts) {
          googleApiLoaded = true
          resolve(true)
        } else {
          reject(new Error("Google API not available after loading"))
        }
      }, 1000)
    }

    script.onerror = () => {
      console.error("Failed to load Google API script")
      reject(new Error("Failed to load Google API script"))
    }

    document.head.appendChild(script)
  })
}

// Initialize Google Sign-In with real Client ID
async function initializeGoogleSignIn() {
  console.log("Intentando inicializar Google Sign-In...")

  const buttonContainer = document.getElementById("google-signin-button")
  if (buttonContainer) {
    buttonContainer.innerHTML = '<p style="color: #00ffff; padding: 1rem;">Cargando autenticación de Google...</p>'
  }

  try {
    // Try to load Google API
    await loadGoogleAPI()

    console.log("Google API cargada, inicializando...")

    window.google.accounts.id.initialize({
      client_id: "567962167229-m10cma3n806pkq3r6774ajttpp4hg871.apps.googleusercontent.com",
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: false,
    })

    // Render the official Google button
    window.google.accounts.id.renderButton(document.getElementById("google-signin-button"), {
      theme: "outline",
      size: "large",
      width: "100%",
      text: "continue_with",
      shape: "pill",
    })

    console.log("Google Sign-In inicializado correctamente")

    // Verify button was rendered
    setTimeout(() => {
      const buttonContainer = document.getElementById("google-signin-button")
      if (buttonContainer && buttonContainer.children.length === 0) {
        buttonContainer.innerHTML = `
          <p style="color: #ff6b6b; padding: 1rem;">
            El botón de Google no se pudo renderizar.<br>
            Esto puede ser por configuración de dominio.<br>
            <small>Dominio actual: ${window.location.hostname}</small>
          </p>
        `
      }
    }, 2000)
  } catch (error) {
    console.error("Error cargando Google API:", error)
    const buttonContainer = document.getElementById("google-signin-button")
    if (buttonContainer) {
      buttonContainer.innerHTML = `
        <div style="color: #ff6b6b; padding: 1rem; text-align: center;">
          <p><strong>No se pudo cargar Google Sign-In</strong></p>
          <p style="font-size: 0.9rem; margin-top: 0.5rem;">
            Posibles causas:<br>
            • Bloqueador de anuncios activo<br>
            • Problemas de conexión<br>
            • Configuración de dominio<br>
          </p>
          <button onclick="retryGoogleLogin()" style="
            background: #00ffff; 
            color: #000; 
            border: none; 
            padding: 0.5rem 1rem; 
            border-radius: 20px; 
            margin-top: 1rem;
            cursor: pointer;
          ">
            Reintentar
          </button>
        </div>
      `
    }
  }
}

// Retry function
function retryGoogleLogin() {
  console.log("Reintentando cargar Google API...")
  initializeGoogleSignIn()
}

// Handle Google Sign-In Response
function handleCredentialResponse(response) {
  const loginLoading = document.getElementById("login-loading")

  // Show loading state
  if (loginLoading) loginLoading.style.display = "flex"

  try {
    // Decode the JWT token to get user information
    const payload = parseJwt(response.credential)

    if (payload) {
      googleUser = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
        email_verified: payload.email_verified,
      }

      console.log("Usuario autenticado:", googleUser)

      // Store user data in localStorage for persistence
      localStorage.setItem("apexsound_user", JSON.stringify(googleUser))

      // Hide login overlay and show main content
      setTimeout(() => {
        hideLoginScreen()
        displayUserInfo()
      }, 1500)
    } else {
      throw new Error("No se pudo decodificar el token")
    }
  } catch (error) {
    console.error("Error en el login:", error)

    // Reset login state
    if (loginLoading) loginLoading.style.display = "none"

    alert("Error al iniciar sesión con Google. Por favor, intenta de nuevo.")
  }
}

// Parse JWT token
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error parsing JWT:", error)
    return null
  }
}

// Display user information in the header
function displayUserInfo() {
  if (googleUser) {
    const userInfo = document.createElement("div")
    userInfo.className = "user-info"
    userInfo.innerHTML = `
      <img src="${googleUser.picture}" alt="${googleUser.name}" class="user-avatar">
      <span class="user-name">Hola, ${googleUser.given_name || googleUser.name}</span>
      <button class="logout-btn" onclick="handleLogout()">Cerrar Sesión</button>
    `

    // Add user info to navigation
    const nav = document.querySelector(".nav")
    if (nav) {
      nav.appendChild(userInfo)
    }
  }
}

// Handle logout
function handleLogout() {
  // Clear user data
  googleUser = null
  localStorage.removeItem("apexsound_user")

  // Sign out from Google
  if (googleApiLoaded && window.google && window.google.accounts) {
    window.google.accounts.id.disableAutoSelect()
  }

  // Reload page to show login screen
  window.location.reload()
}

// Hide login screen and show main content
function hideLoginScreen() {
  const loginOverlay = document.getElementById("login-overlay")
  const mainContent = document.getElementById("main-content")

  if (loginOverlay) {
    loginOverlay.style.opacity = "0"
    setTimeout(() => {
      loginOverlay.style.display = "none"
      if (mainContent) {
        mainContent.style.display = "block"
        setTimeout(() => {
          mainContent.classList.add("show")
          initializeMainApp()
        }, 100)
      }
    }, 500)
  }
}

// Check for existing user session
function checkExistingSession() {
  const storedUser = localStorage.getItem("apexsound_user")
  if (storedUser) {
    try {
      googleUser = JSON.parse(storedUser)
      console.log("Sesión existente encontrada:", googleUser)
      hideLoginScreen()
      displayUserInfo()
      return true
    } catch (error) {
      console.error("Error loading stored user:", error)
      localStorage.removeItem("apexsound_user")
    }
  }
  return false
}

// Initialize main application after login
function initializeMainApp() {
  // DOM Elements
  const navToggle = document.getElementById("nav-toggle")
  const navMenu = document.getElementById("nav-menu")
  const navLinks = document.querySelectorAll(".nav-link")
  const catalogBtn = document.getElementById("catalog-btn")
  const header = document.getElementById("header")

  // Mobile Navigation Toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active")
      navToggle.classList.toggle("active")
    })
  }

  // Close mobile menu when clicking on a link
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navMenu) navMenu.classList.remove("active")
      if (navToggle) navToggle.classList.remove("active")
    })
  })

  // Smooth scrolling for navigation links
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const targetId = link.getAttribute("href")
      const targetSection = document.querySelector(targetId)

      if (targetSection && header) {
        const headerHeight = header.offsetHeight
        const targetPosition = targetSection.offsetTop - headerHeight

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        })
      }
    })
  })

  // Catalog button interaction
  if (catalogBtn) {
    catalogBtn.addEventListener("click", () => {
      catalogBtn.style.transform = "scale(0.95)"
      setTimeout(() => {
        catalogBtn.style.transform = "scale(1)"
      }, 150)

      const partiturasSection = document.getElementById("partituras")
      if (partiturasSection && header) {
        const headerHeight = header.offsetHeight
        const targetPosition = partiturasSection.offsetTop - headerHeight

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        })
      }
    })
  }

  // Header background opacity on scroll
  let ticking = false

  function updateHeader() {
    const scrolled = window.pageYOffset

    if (header) {
      if (scrolled > 100) {
        header.style.background = "rgba(10, 10, 10, 0.98)"
        header.style.boxShadow = "0 2px 20px rgba(0, 255, 255, 0.1)"
      } else {
        header.style.background = "rgba(10, 10, 10, 0.95)"
        header.style.boxShadow = "none"
      }
    }

    ticking = false
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader)
      ticking = true
    }
  })

  // Add hover effects to navigation links
  navLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      link.style.transform = "translateY(-2px)"
    })

    link.addEventListener("mouseleave", () => {
      link.style.transform = "translateY(0)"
    })
  })

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // Observe sections for scroll animations
  document.querySelectorAll(".section").forEach((section) => {
    section.style.opacity = "0"
    section.style.transform = "translateY(30px)"
    section.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    observer.observe(section)
  })

  // Add keyboard navigation support
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu && navMenu.classList.contains("active")) {
      navMenu.classList.remove("active")
      if (navToggle) navToggle.classList.remove("active")
    }
  })
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado, inicializando...")
  console.log("URL actual:", window.location.href)
  console.log("Dominio:", window.location.hostname)

  // Check for existing session first
  if (!checkExistingSession()) {
    // Initialize Google Sign-In
    setTimeout(() => {
      initializeGoogleSignIn()
    }, 1000)
  }

  // Handle logo error
  const loginLogo = document.querySelector(".login-logo")
  if (loginLogo) {
    loginLogo.addEventListener("error", () => {
      loginLogo.style.display = "none"
    })
  }
})

// Handle page load
window.addEventListener("load", () => {
  console.log("Apexsound - Sistema de autenticación cargado")
})
