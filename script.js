// Supabase Configuration
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = "https://qrugulhyzttsjcmfcdve.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFydWd1bGh5enR0c2pjbWZjZHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTEyOTMsImV4cCI6MjA2NzIyNzI5M30.lIcm3kji8MZ2ho8Xwutf5xw4eubG6zZCQjQbek6IDDw"

const supabase = createClient(supabaseUrl, supabaseKey)

// Google Login Configuration
let googleUser = null
let googleApiLoaded = false
let initializationAttempts = 0
const MAX_ATTEMPTS = 3

// Your specific domain configuration
const DOMAIN_CONFIG = {
  production: "https://gioprogramr.github.io",
  current: window.location.origin,
  path: window.location.pathname,
  fullUrl: window.location.href,
}

// Load Google API with multiple fallback methods
function loadGoogleAPI() {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Intento ${initializationAttempts + 1} de cargar Google API...`)

    // Check if already loaded
    if (window.google && window.google.accounts && window.google.accounts.id) {
      console.log("✅ Google API ya estaba cargada")
      googleApiLoaded = true
      resolve(true)
      return
    }

    // Remove existing script if any
    const existingScript = document.querySelector('script[src*="accounts.google.com"]')
    if (existingScript) {
      existingScript.remove()
    }

    // Create new script element
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true

    let scriptLoaded = false

    script.onload = () => {
      if (scriptLoaded) return
      scriptLoaded = true

      console.log("📦 Google API script cargado")

      // Wait for API to be fully available
      const checkAPI = () => {
        if (window.google && window.google.accounts && window.google.accounts.id) {
          console.log("✅ Google API completamente disponible")
          googleApiLoaded = true
          resolve(true)
        } else {
          console.log("⏳ Esperando que Google API se inicialice...")
          setTimeout(checkAPI, 500)
        }
      }

      setTimeout(checkAPI, 100)
    }

    script.onerror = () => {
      if (scriptLoaded) return
      scriptLoaded = true

      console.error("❌ Error cargando Google API script")
      reject(new Error("Failed to load Google API script"))
    }

    // Timeout fallback
    setTimeout(() => {
      if (!scriptLoaded) {
        scriptLoaded = true
        console.error("⏰ Timeout cargando Google API")
        reject(new Error("Timeout loading Google API"))
      }
    }, 10000)

    document.head.appendChild(script)
  })
}

// Initialize Google Sign-In with enhanced error handling
async function initializeGoogleSignIn() {
  initializationAttempts++
  console.log(`🚀 Inicializando Google Sign-In (intento ${initializationAttempts})`)
  console.log(`🌐 Dominio actual: ${DOMAIN_CONFIG.current}`)

  const buttonContainer = document.getElementById("google-signin-button")
  if (!buttonContainer) {
    console.error("❌ No se encontró el contenedor del botón")
    return
  }

  // Show loading state
  buttonContainer.innerHTML = `
    <div style="color: #00ffff; padding: 1rem; text-align: center;">
      <div class="spinner" style="margin: 0 auto 0.5rem; width: 20px; height: 20px;"></div>
      <p>Cargando autenticación de Google...</p>
      <small>Intento ${initializationAttempts} de ${MAX_ATTEMPTS}</small>
    </div>
  `

  try {
    // Load Google API
    await loadGoogleAPI()

    console.log("🔧 Configurando Google OAuth...")

    // Initialize Google Sign-In
    window.google.accounts.id.initialize({
      client_id: "567962167229-m10cma3n806pkq3r6774ajttpp4hg871.apps.googleusercontent.com",
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: false,
      use_fedcm_for_prompt: false,
    })

    console.log("🎨 Renderizando botón de Google...")

    // Clear container and render button
    buttonContainer.innerHTML = ""

    window.google.accounts.id.renderButton(buttonContainer, {
      theme: "outline",
      size: "large",
      width: "100%",
      text: "continue_with",
      shape: "pill",
      logo_alignment: "left",
    })

    console.log("✅ Google Sign-In inicializado correctamente")

    // Verify button rendered successfully
    setTimeout(() => {
      const hasButton =
        buttonContainer.querySelector('div[role="button"]') ||
        buttonContainer.querySelector("iframe") ||
        buttonContainer.children.length > 0

      if (!hasButton) {
        console.warn("⚠️ El botón no se renderizó correctamente")
        showDomainError()
      } else {
        console.log("✅ Botón de Google renderizado exitosamente")
      }
    }, 2000)
  } catch (error) {
    console.error("❌ Error inicializando Google Sign-In:", error)

    if (initializationAttempts < MAX_ATTEMPTS) {
      console.log(`🔄 Reintentando en 3 segundos... (${initializationAttempts}/${MAX_ATTEMPTS})`)
      setTimeout(() => {
        initializeGoogleSignIn()
      }, 3000)
    } else {
      showFinalError()
    }
  }
}

// Show domain configuration error
function showDomainError() {
  const buttonContainer = document.getElementById("google-signin-button")
  if (buttonContainer) {
    buttonContainer.innerHTML = `
      <div style="color: #ff6b6b; padding: 1.5rem; text-align: center; border: 1px solid #ff6b6b; border-radius: 10px;">
        <h4 style="margin-bottom: 1rem;">🔧 Configuración Requerida</h4>
        <p style="margin-bottom: 1rem; font-size: 0.9rem;">
          <strong>Error 400: origin_mismatch</strong><br>
          Necesitas añadir este origen en Google Cloud Console:
        </p>
        <div style="background: rgba(0,0,0,0.5); padding: 1rem; border-radius: 8px; margin: 1rem 0; border-left: 3px solid #00ffff;">
          <div style="font-family: monospace; font-size: 0.9rem; color: #00ffff; margin-bottom: 0.5rem;">
            <strong>Origen JavaScript autorizado:</strong>
          </div>
          <div style="font-family: monospace; font-size: 0.8rem; background: rgba(0,255,255,0.1); padding: 0.5rem; border-radius: 4px;">
            https://gioprogramr.github.io
          </div>
        </div>
        <button onclick="retryGoogleLogin()" style="
          background: #00ffff; 
          color: #000; 
          border: none; 
          padding: 0.5rem 1rem; 
          border-radius: 20px; 
          cursor: pointer;
          font-weight: 500;
        ">
          Reintentar
        </button>
      </div>
    `
  }
}

// Show final error after all attempts
function showFinalError() {
  const buttonContainer = document.getElementById("google-signin-button")
  if (buttonContainer) {
    buttonContainer.innerHTML = `
      <div style="color: #ff6b6b; padding: 1.5rem; text-align: center; border: 1px solid #ff6b6b; border-radius: 10px;">
        <h4 style="margin-bottom: 1rem;">❌ Error de Autenticación</h4>
        <p style="margin-bottom: 1rem; font-size: 0.9rem;">
          No se pudo cargar el sistema de login después de ${MAX_ATTEMPTS} intentos.
        </p>
        <div style="text-align: left; font-size: 0.8rem; margin: 1rem 0;">
          <strong>Posibles causas:</strong><br>
          • Bloqueador de anuncios activo<br>
          • Dominio no autorizado en Google Console<br>
          • Problemas de conectividad<br>
          • Configuración de firewall/proxy
        </div>
        <div style="margin-top: 1rem;">
          <button onclick="retryGoogleLogin()" style="
            background: #00ffff; 
            color: #000; 
            border: none; 
            padding: 0.5rem 1rem; 
            border-radius: 20px; 
            cursor: pointer;
            margin-right: 0.5rem;
          ">
            Reintentar
          </button>
          <button onclick="skipLogin()" style="
            background: transparent; 
            color: #00ffff; 
            border: 1px solid #00ffff; 
            padding: 0.5rem 1rem; 
            border-radius: 20px; 
            cursor: pointer;
          ">
            Continuar sin login
          </button>
        </div>
      </div>
    `
  }
}

// Retry function
function retryGoogleLogin() {
  console.log("🔄 Reintentando inicialización...")
  initializationAttempts = 0
  initializeGoogleSignIn()
}

// Skip login function (temporary access)
function skipLogin() {
  console.log("⏭️ Saltando login - acceso temporal")

  // Create temporary user
  googleUser = {
    id: "temp_user",
    name: "Usuario Temporal",
    email: "temp@apexsound.com",
    picture:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMwMGZmZmYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4KPC9zdmc+",
    given_name: "Usuario",
    family_name: "Temporal",
    email_verified: false,
    temporary: true,
  }

  hideLoginScreen()
  displayUserInfo()
}

// Handle Google Sign-In Response
async function handleCredentialResponse(response) {
  console.log("🎉 Respuesta de Google recibida")

  const loginLoading = document.getElementById("login-loading")
  if (loginLoading) loginLoading.style.display = "flex"

  try {
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
        temporary: false,
      }

      console.log("✅ Usuario autenticado:", googleUser.name)

      // Authenticate with Supabase using Google token
      const { data: supabaseUser, error: authError } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      })

      if (authError) {
        console.error("❌ Error autenticando con Supabase:", authError)
        throw authError
      }

      console.log("✅ Usuario autenticado en Supabase:", supabaseUser)

      // Load user profile from Supabase
      await loadUserProfile()

      // Store user data in localStorage as backup
      localStorage.setItem("apexsound_user", JSON.stringify(googleUser))

      // Success animation
      setTimeout(() => {
        hideLoginScreen()
        displayUserInfo()
      }, 1500)
    } else {
      throw new Error("No se pudo decodificar el token")
    }
  } catch (error) {
    console.error("❌ Error en el login:", error)

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
    console.error("❌ Error parsing JWT:", error)
    return null
  }
}

// SUPABASE FUNCTIONS

// Load user profile from Supabase
async function loadUserProfile() {
  try {
    console.log("📖 Cargando perfil desde Supabase...")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("❌ No hay usuario autenticado en Supabase")
      return
    }

    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("❌ Error cargando perfil:", error)
      return
    }

    if (profile) {
      console.log("✅ Perfil cargado desde Supabase:", profile)

      // Merge Supabase profile data with Google user data
      googleUser = {
        ...googleUser,
        supabaseId: user.id,
        username: profile.username || googleUser.name,
        bio: profile.bio || "",
        favoriteInstrument: profile.favorite_instrument || "",
        avatarUrl: profile.avatar_url || googleUser.picture,
        picture: profile.avatar_url || googleUser.picture,
      }
    } else {
      console.log("ℹ️ No se encontró perfil, se creará uno nuevo")
      googleUser.supabaseId = user.id
    }
  } catch (error) {
    console.error("❌ Error en loadUserProfile:", error)
  }
}

// Save user profile to Supabase
async function saveUserProfile(profileData) {
  try {
    console.log("💾 Guardando perfil en Supabase...")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("No hay usuario autenticado")
    }

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        username: profileData.username,
        bio: profileData.bio,
        favorite_instrument: profileData.favoriteInstrument,
        avatar_url: profileData.avatarUrl,
      })
      .select()

    if (error) {
      console.error("❌ Error guardando perfil:", error)
      throw error
    }

    console.log("✅ Perfil guardado exitosamente:", data)
    return data
  } catch (error) {
    console.error("❌ Error en saveUserProfile:", error)
    throw error
  }
}

// Upload avatar to Supabase Storage
async function uploadAvatar(file) {
  try {
    console.log("📤 Subiendo avatar a Supabase Storage...")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("No hay usuario autenticado")
    }

    // Create unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/avatar.${fileExt}`

    // Delete existing avatar if exists
    await supabase.storage.from("avatars").remove([fileName])

    // Upload new avatar
    const { data, error } = await supabase.storage.from("avatars").upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("❌ Error subiendo avatar:", error)
      throw error
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName)

    console.log("✅ Avatar subido exitosamente:", publicUrl)
    return publicUrl
  } catch (error) {
    console.error("❌ Error en uploadAvatar:", error)
    throw error
  }
}

// Display user information in header
function displayUserInfo() {
  if (googleUser) {
    const userInfo = document.createElement("div")
    userInfo.className = "user-info"

    const tempBadge = googleUser.temporary
      ? '<span style="background: #ff6b6b; color: white; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 10px; margin-left: 0.5rem;">TEMP</span>'
      : ""

    userInfo.innerHTML = `
      <img src="${googleUser.picture}" alt="${googleUser.name}" class="user-avatar">
      <span class="user-name">Hola, ${googleUser.username || googleUser.given_name || googleUser.name}${tempBadge}</span>
      <button class="edit-profile-btn" onclick="openProfileModal()">Editar Perfil</button>
      <button class="logout-btn" onclick="handleLogout()">Cerrar Sesión</button>
    `

    const nav = document.querySelector(".nav")
    if (nav) {
      nav.appendChild(userInfo)
    }
  }
}

// Handle logout
async function handleLogout() {
  console.log("👋 Cerrando sesión...")

  // Sign out from Supabase
  await supabase.auth.signOut()

  // Clear user data
  googleUser = null
  localStorage.removeItem("apexsound_user")

  if (googleApiLoaded && window.google && window.google.accounts) {
    window.google.accounts.id.disableAutoSelect()
  }

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
async function checkExistingSession() {
  try {
    // Check Supabase session first
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session && session.user) {
      console.log("🔄 Sesión de Supabase encontrada:", session.user.email)

      // Reconstruct googleUser from session
      googleUser = {
        id: session.user.user_metadata.sub,
        supabaseId: session.user.id,
        name: session.user.user_metadata.name,
        email: session.user.email,
        picture: session.user.user_metadata.picture,
        given_name: session.user.user_metadata.given_name,
        family_name: session.user.user_metadata.family_name,
        email_verified: session.user.email_verified,
        temporary: false,
      }

      // Load profile data
      await loadUserProfile()

      hideLoginScreen()
      displayUserInfo()
      return true
    }

    // Fallback to localStorage
    const storedUser = localStorage.getItem("apexsound_user")
    if (storedUser) {
      try {
        googleUser = JSON.parse(storedUser)
        console.log("🔄 Sesión local encontrada:", googleUser.name)
        hideLoginScreen()
        displayUserInfo()
        return true
      } catch (error) {
        console.error("❌ Error loading stored user:", error)
        localStorage.removeItem("apexsound_user")
      }
    }

    return false
  } catch (error) {
    console.error("❌ Error checking session:", error)
    return false
  }
}

// Initialize main application
function initializeMainApp() {
  console.log("🎵 Inicializando aplicación principal...")

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

  // Header scroll effects
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

  document.querySelectorAll(".section").forEach((section) => {
    section.style.opacity = "0"
    section.style.transform = "translateY(30px)"
    section.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    observer.observe(section)
  })

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu && navMenu.classList.contains("active")) {
      navMenu.classList.remove("active")
      if (navToggle) navToggle.classList.remove("active")
    }
  })

  console.log("✅ Aplicación principal inicializada")
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Apexsound - Iniciando aplicación...")
  console.log(`🌐 Dominio: ${DOMAIN_CONFIG.current}`)

  // Check for existing session first
  const hasSession = await checkExistingSession()

  if (!hasSession) {
    // Initialize Google Sign-In after a short delay
    setTimeout(() => {
      initializeGoogleSignIn()
    }, 1000)
  }

  // Handle logo error
  const loginLogo = document.querySelector(".login-logo")
  if (loginLogo) {
    loginLogo.addEventListener("error", () => {
      console.warn("⚠️ Logo no se pudo cargar")
      loginLogo.style.display = "none"
    })
  }
})

// Handle page load
window.addEventListener("load", () => {
  console.log("✅ Apexsound - Página completamente cargada")
})

// Global error handler
window.addEventListener("error", (e) => {
  console.error("❌ Error global:", e.error)
})

// Unhandled promise rejection handler
window.addEventListener("unhandledrejection", (e) => {
  console.error("❌ Promise rechazada:", e.reason)
})

// Profile Management Functions
function openProfileModal() {
  console.log("🔧 Abriendo modal de perfil...")

  const modal = document.getElementById("profile-modal-overlay")
  if (!modal) return

  // Load current user data into form
  loadProfileData()

  // Show modal with animation
  modal.style.display = "flex"
  setTimeout(() => {
    modal.classList.add("show")
  }, 10)

  // Prevent body scroll
  document.body.style.overflow = "hidden"
}

function closeProfileModal() {
  console.log("❌ Cerrando modal de perfil...")

  const modal = document.getElementById("profile-modal-overlay")
  if (!modal) return

  // Hide modal with animation
  modal.classList.remove("show")
  setTimeout(() => {
    modal.style.display = "none"
    document.body.style.overflow = "auto"
  }, 300)
}

function loadProfileData() {
  if (!googleUser) return

  console.log("📝 Cargando datos del perfil...")

  // Load profile photo
  const profilePreview = document.getElementById("profile-preview")
  if (profilePreview) {
    profilePreview.src = googleUser.avatarUrl || googleUser.picture || "/placeholder.svg?height=100&width=100"
  }

  // Load form data
  const displayNameInput = document.getElementById("display-name")
  const emailInput = document.getElementById("user-email")
  const bioInput = document.getElementById("user-bio")
  const instrumentSelect = document.getElementById("favorite-instrument")

  if (displayNameInput) displayNameInput.value = googleUser.username || googleUser.name || ""
  if (emailInput) emailInput.value = googleUser.email || ""
  if (bioInput) bioInput.value = googleUser.bio || ""
  if (instrumentSelect) instrumentSelect.value = googleUser.favoriteInstrument || ""
}

function removeProfilePhoto() {
  console.log("🗑️ Removiendo foto de perfil...")

  const profilePreview = document.getElementById("profile-preview")
  if (profilePreview) {
    profilePreview.src =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjMDBmZmZmIi8+CjxzdmcgeD0iMjAiIHk9IjIwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4KPC9zdmc+"
  }

  // Mark photo as removed
  googleUser.photoRemoved = true
}

// Handle photo upload
document.addEventListener("DOMContentLoaded", () => {
  const photoUpload = document.getElementById("photo-upload")
  if (photoUpload) {
    photoUpload.addEventListener("change", handlePhotoUpload)
  }

  const profileForm = document.getElementById("profile-form")
  if (profileForm) {
    profileForm.addEventListener("submit", handleProfileSave)
  }
})

async function handlePhotoUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  console.log("📸 Subiendo nueva foto de perfil...")

  // Validate file type
  if (!file.type.startsWith("image/")) {
    alert("Por favor selecciona un archivo de imagen válido.")
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("La imagen es muy grande. Por favor selecciona una imagen menor a 5MB.")
    return
  }

  try {
    // Show loading state
    const profilePreview = document.getElementById("profile-preview")
    const uploadBtn = document.querySelector(".upload-btn")

    if (uploadBtn) {
      uploadBtn.textContent = "Subiendo..."
      uploadBtn.disabled = true
    }

    // Upload to Supabase Storage
    const avatarUrl = await uploadAvatar(file)

    // Update preview
    if (profilePreview) {
      profilePreview.src = avatarUrl
    }

    // Store the new image URL
    googleUser.newAvatarUrl = avatarUrl
    googleUser.photoRemoved = false

    console.log("✅ Nueva foto cargada exitosamente")

    if (uploadBtn) {
      uploadBtn.textContent = "✅ Subida"
      setTimeout(() => {
        uploadBtn.textContent = "Cambiar Foto"
        uploadBtn.disabled = false
      }, 2000)
    }
  } catch (error) {
    console.error("❌ Error subiendo foto:", error)
    alert("Error al subir la imagen. Por favor intenta de nuevo.")

    const uploadBtn = document.querySelector(".upload-btn")
    if (uploadBtn) {
      uploadBtn.textContent = "Cambiar Foto"
      uploadBtn.disabled = false
    }
  }
}

async function handleProfileSave(event) {
  event.preventDefault()

  console.log("💾 Guardando cambios del perfil...")

  const formData = new FormData(event.target)
  const saveBtn = event.target.querySelector(".save-btn")

  // Disable save button
  saveBtn.disabled = true
  saveBtn.textContent = "Guardando..."

  try {
    // Prepare profile data
    const profileData = {
      username: formData.get("displayName") || googleUser.name,
      bio: formData.get("bio") || "",
      favoriteInstrument: formData.get("favoriteInstrument") || "",
      avatarUrl: googleUser.photoRemoved
        ? "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjMDBmZmZmIi8+CjxzdmcgeD0iMjAiIHk9IjIwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4KPC9zdmc+"
        : googleUser.newAvatarUrl || googleUser.avatarUrl || googleUser.picture,
    }

    // Save to Supabase
    await saveUserProfile(profileData)

    // Update local user object
    googleUser.username = profileData.username
    googleUser.bio = profileData.bio
    googleUser.favoriteInstrument = profileData.favoriteInstrument
    googleUser.avatarUrl = profileData.avatarUrl
    googleUser.picture = profileData.avatarUrl

    // Update localStorage as backup
    localStorage.setItem("apexsound_user", JSON.stringify(googleUser))

    // Update UI
    updateUserInfoDisplay()

    // Show success message
    setTimeout(() => {
      saveBtn.disabled = false
      saveBtn.textContent = "✅ Guardado"

      setTimeout(() => {
        saveBtn.textContent = "Guardar Cambios"
        closeProfileModal()
      }, 1000)
    }, 500)

    console.log("✅ Perfil actualizado exitosamente")
  } catch (error) {
    console.error("❌ Error guardando perfil:", error)
    alert("Error al guardar los cambios. Por favor intenta de nuevo.")

    saveBtn.disabled = false
    saveBtn.textContent = "Guardar Cambios"
  }
}

function updateUserInfoDisplay() {
  // Update header user info
  const userAvatar = document.querySelector(".user-avatar")
  const userName = document.querySelector(".user-name")

  if (userAvatar) {
    userAvatar.src = googleUser.picture
  }

  if (userName) {
    const tempBadge = googleUser.temporary
      ? '<span style="background: #ff6b6b; color: white; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 10px; margin-left: 0.5rem;">TEMP</span>'
      : ""
    userName.innerHTML = `Hola, ${googleUser.username || googleUser.given_name || googleUser.name}${tempBadge}`
  }
}

// Close modal when clicking outside
document.addEventListener("click", (event) => {
  const modal = document.getElementById("profile-modal-overlay")
  if (modal && event.target === modal) {
    closeProfileModal()
  }
})

// Close modal with Escape key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    const modal = document.getElementById("profile-modal-overlay")
    if (modal && modal.classList.contains("show")) {
      closeProfileModal()
    }
  }
})
