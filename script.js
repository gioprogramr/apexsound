// Variables globales
let googleUser = null
let supabase = null

// Configuración de Supabase (se inicializa después)
const supabaseUrl = "https://qrugulhyzttsjcmfcdve.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFydWd1bGh5enR0c2pjbWZjZHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTEyOTMsImV4cCI6MjA2NzIyNzI5M30.lIcm3kji8MZ2ho8Xwutf5xw4eubG6zZCQjQbek6IDDw"

// Inicializar Supabase
async function initSupabase() {
  try {
    // Cargar Supabase desde CDN
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"
    document.head.appendChild(script)

    script.onload = () => {
      supabase = window.supabase.createClient(supabaseUrl, supabaseKey)
      console.log("✅ Supabase inicializado")
    }
  } catch (error) {
    console.warn("⚠️ Error inicializando Supabase:", error)
  }
}

// Inicializar Google Sign-In
function initializeGoogleSignIn() {
  console.log("🚀 Inicializando Google Sign-In...")

  const buttonContainer = document.getElementById("google-signin-button")
  if (!buttonContainer) {
    console.error("❌ No se encontró el contenedor del botón")
    return
  }

  // Mostrar estado de carga
  buttonContainer.innerHTML = `
    <div style="color: #00ffff; padding: 1rem; text-align: center;">
      <div class="spinner" style="margin: 0 auto 0.5rem; width: 20px; height: 20px;"></div>
      <p>Cargando Google Sign-In...</p>
    </div>
  `

  // Cargar Google API
  if (!window.google) {
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true

    script.onload = () => {
      console.log("✅ Google API cargada")
      setTimeout(setupGoogleButton, 500) // Pequeño delay para asegurar que se cargue
    }

    script.onerror = () => {
      console.error("❌ Error cargando Google API")
      showErrorButton()
    }

    document.head.appendChild(script)
  } else {
    setupGoogleButton()
  }
}

function setupGoogleButton() {
  console.log("🎨 Configurando botón de Google...")

  const buttonContainer = document.getElementById("google-signin-button")
  if (!buttonContainer) return

  try {
    // Verificar que Google API esté disponible
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      console.error("❌ Google API no está completamente cargada")
      showErrorButton()
      return
    }

    // Inicializar Google Sign-In
    window.google.accounts.id.initialize({
      client_id: "567962167229-m10cma3n806pkq3r6774ajttpp4hg871.apps.googleusercontent.com",
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: false,
    })

    // Limpiar contenedor
    buttonContainer.innerHTML = ""

    // Renderizar botón
    window.google.accounts.id.renderButton(buttonContainer, {
      theme: "outline",
      size: "large",
      width: "100%",
      text: "continue_with",
      shape: "pill",
      logo_alignment: "left",
    })

    console.log("✅ Botón de Google renderizado exitosamente")

    // Verificar que el botón se renderizó
    setTimeout(() => {
      const hasButton = buttonContainer.children.length > 0
      if (!hasButton) {
        console.warn("⚠️ El botón no se renderizó, mostrando alternativa")
        showManualButton()
      }
    }, 2000)
  } catch (error) {
    console.error("❌ Error configurando botón:", error)
    showErrorButton()
  }
}

function showManualButton() {
  const buttonContainer = document.getElementById("google-signin-button")
  buttonContainer.innerHTML = `
    <button onclick="manualGoogleLogin()" style="
      width: 100%;
      padding: 12px 16px;
      background: white;
      border: 1px solid #dadce0;
      border-radius: 24px;
      color: #3c4043;
      font-family: 'Google Sans', Roboto, Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s;
    " onmouseover="this.style.boxShadow='0 1px 2px 0 rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15)'" onmouseout="this.style.boxShadow='none'">
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continuar con Google
    </button>
    <div style="text-align: center; margin-top: 1rem;">
      <button onclick="skipLogin()" style="
        background: transparent; 
        color: #00ffff; 
        border: 1px solid #00ffff; 
        padding: 0.5rem 1rem; 
        border-radius: 20px; 
        cursor: pointer;
        font-size: 0.9rem;
      ">
        Continuar sin login
      </button>
    </div>
  `
}

function manualGoogleLogin() {
  if (window.google && window.google.accounts && window.google.accounts.id) {
    window.google.accounts.id.prompt()
  } else {
    alert('Google Sign-In no está disponible. Usa "Continuar sin login".')
  }
}

function showErrorButton() {
  const buttonContainer = document.getElementById("google-signin-button")
  buttonContainer.innerHTML = `
    <div style="text-align: center; padding: 1rem;">
      <p style="color: #ff6b6b; margin-bottom: 1rem;">Error cargando Google Sign-In</p>
      <button onclick="retryGoogleLogin()" style="
        background: #00ffff; 
        color: #000; 
        border: none; 
        padding: 0.75rem 1.5rem; 
        border-radius: 25px; 
        cursor: pointer;
        font-weight: 500;
        margin-right: 0.5rem;
      ">
        Reintentar
      </button>
      <button onclick="skipLogin()" style="
        background: transparent; 
        color: #00ffff; 
        border: 1px solid #00ffff; 
        padding: 0.75rem 1.5rem; 
        border-radius: 25px; 
        cursor: pointer;
        font-weight: 500;
      ">
        Continuar sin login
      </button>
    </div>
  `
}

// Funciones globales
function retryGoogleLogin() {
  console.log("🔄 Reintentando...")
  initializeGoogleSignIn()
}

function skipLogin() {
  console.log("⏭️ Saltando login")

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

// Manejar respuesta de Google
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

      // Intentar autenticar con Supabase si está disponible
      if (supabase) {
        try {
          const { data: supabaseUser, error: authError } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
          })

          if (!authError) {
            console.log("✅ Usuario autenticado en Supabase")
            await loadUserProfile()
          }
        } catch (supabaseError) {
          console.warn("⚠️ Error con Supabase:", supabaseError)
        }
      }

      // Guardar en localStorage
      localStorage.setItem("apexsound_user", JSON.stringify(googleUser))

      // Éxito
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
    alert("Error al iniciar sesión. Por favor, intenta de nuevo.")
  }
}

// Parsear JWT token
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

// Funciones de Supabase (simplificadas)
async function loadUserProfile() {
  if (!supabase) return

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (profile) {
      googleUser = {
        ...googleUser,
        supabaseId: user.id,
        username: profile.username || googleUser.name,
        bio: profile.bio || "",
        favoriteInstrument: profile.favorite_instrument || "",
        avatarUrl: profile.avatar_url || googleUser.picture,
        picture: profile.avatar_url || googleUser.picture,
      }
    }
  } catch (error) {
    console.warn("⚠️ Error cargando perfil:", error)
  }
}

// Mostrar información del usuario
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

// Cerrar sesión
async function handleLogout() {
  console.log("👋 Cerrando sesión...")

  if (supabase) {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.warn("⚠️ Error cerrando sesión Supabase:", error)
    }
  }

  googleUser = null
  localStorage.removeItem("apexsound_user")

  if (window.google && window.google.accounts) {
    window.google.accounts.id.disableAutoSelect()
  }

  window.location.reload()
}

// Ocultar pantalla de login
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

// Verificar sesión existente
async function checkExistingSession() {
  try {
    // Verificar localStorage
    const storedUser = localStorage.getItem("apexsound_user")
    if (storedUser) {
      try {
        googleUser = JSON.parse(storedUser)
        console.log("🔄 Sesión local encontrada")
        hideLoginScreen()
        displayUserInfo()
        return true
      } catch (error) {
        localStorage.removeItem("apexsound_user")
      }
    }

    // Verificar Supabase si está disponible
    if (supabase) {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session && session.user) {
        console.log("🔄 Sesión de Supabase encontrada")

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

        await loadUserProfile()
        hideLoginScreen()
        displayUserInfo()
        return true
      }
    }

    return false
  } catch (error) {
    console.error("❌ Error checking session:", error)
    return false
  }
}

// Inicializar aplicación principal
function initializeMainApp() {
  console.log("🎵 Inicializando aplicación principal...")

  const navToggle = document.getElementById("nav-toggle")
  const navMenu = document.getElementById("nav-menu")
  const navLinks = document.querySelectorAll(".nav-link")
  const catalogBtn = document.getElementById("catalog-btn")
  const header = document.getElementById("header")

  // Navegación móvil
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active")
      navToggle.classList.toggle("active")
    })
  }

  // Cerrar menú móvil al hacer clic en un enlace
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navMenu) navMenu.classList.remove("active")
      if (navToggle) navToggle.classList.remove("active")
    })
  })

  // Scroll suave para enlaces de navegación
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

  // Botón de catálogo
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

  console.log("✅ Aplicación principal inicializada")
}

// Funciones del modal de perfil
function openProfileModal() {
  const modal = document.getElementById("profile-modal-overlay")
  if (!modal) return

  loadProfileData()
  modal.style.display = "flex"
  setTimeout(() => {
    modal.classList.add("show")
  }, 10)
  document.body.style.overflow = "hidden"
}

function closeProfileModal() {
  const modal = document.getElementById("profile-modal-overlay")
  if (!modal) return

  modal.classList.remove("show")
  setTimeout(() => {
    modal.style.display = "none"
    document.body.style.overflow = "auto"
  }, 300)
}

function loadProfileData() {
  if (!googleUser) return

  const profilePreview = document.getElementById("profile-preview")
  const displayNameInput = document.getElementById("display-name")
  const emailInput = document.getElementById("user-email")
  const bioInput = document.getElementById("user-bio")
  const instrumentSelect = document.getElementById("favorite-instrument")

  if (profilePreview) {
    profilePreview.src = googleUser.avatarUrl || googleUser.picture || "/placeholder.svg?height=100&width=100"
  }
  if (displayNameInput) displayNameInput.value = googleUser.username || googleUser.name || ""
  if (emailInput) emailInput.value = googleUser.email || ""
  if (bioInput) bioInput.value = googleUser.bio || ""
  if (instrumentSelect) instrumentSelect.value = googleUser.favoriteInstrument || ""
}

function removeProfilePhoto() {
  const profilePreview = document.getElementById("profile-preview")
  if (profilePreview) {
    profilePreview.src =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjMDBmZmZmIi8+CjxzdmcgeD0iMjAiIHk9IjIwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4KPC9zdmc+"
  }
  if (googleUser) googleUser.photoRemoved = true
}

// Inicialización cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Apexsound - Iniciando aplicación...")

  // Inicializar Supabase
  initSupabase()

  // Verificar sesión existente
  const hasSession = await checkExistingSession()

  if (!hasSession) {
    // Inicializar Google Sign-In después de un pequeño delay
    setTimeout(() => {
      initializeGoogleSignIn()
    }, 1000)
  }

  // Configurar listeners del formulario de perfil
  const profileForm = document.getElementById("profile-form")
  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault()
      // Funcionalidad básica de guardado sin Supabase
      const formData = new FormData(e.target)

      if (googleUser) {
        googleUser.username = formData.get("displayName") || googleUser.name
        googleUser.bio = formData.get("bio") || ""
        googleUser.favoriteInstrument = formData.get("favoriteInstrument") || ""

        localStorage.setItem("apexsound_user", JSON.stringify(googleUser))

        // Actualizar UI
        const userName = document.querySelector(".user-name")
        if (userName) {
          const tempBadge = googleUser.temporary
            ? '<span style="background: #ff6b6b; color: white; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 10px; margin-left: 0.5rem;">TEMP</span>'
            : ""
          userName.innerHTML = `Hola, ${googleUser.username || googleUser.given_name || googleUser.name}${tempBadge}`
        }

        alert("Perfil actualizado correctamente")
        closeProfileModal()
      }
    })
  }
})

// Cerrar modal con Escape o clic fuera
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    const modal = document.getElementById("profile-modal-overlay")
    if (modal && modal.classList.contains("show")) {
      closeProfileModal()
    }
  }
})

document.addEventListener("click", (event) => {
  const modal = document.getElementById("profile-modal-overlay")
  if (modal && event.target === modal) {
    closeProfileModal()
  }
})
