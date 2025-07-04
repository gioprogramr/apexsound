// DOM Elements
const navToggle = document.getElementById("nav-toggle")
const navMenu = document.getElementById("nav-menu")
const navLinks = document.querySelectorAll(".nav-link")
const catalogBtn = document.getElementById("catalog-btn")
const header = document.getElementById("header")

// Mobile Navigation Toggle
navToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active")
  navToggle.classList.toggle("active")
})

// Close mobile menu when clicking on a link
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active")
    navToggle.classList.remove("active")
  })
})

// Smooth scrolling for navigation links
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault()
    const targetId = link.getAttribute("href")
    const targetSection = document.querySelector(targetId)

    if (targetSection) {
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
catalogBtn.addEventListener("click", () => {
  // Add a subtle animation effect
  catalogBtn.style.transform = "scale(0.95)"
  setTimeout(() => {
    catalogBtn.style.transform = "scale(1)"
  }, 150)

  // Scroll to partituras section
  const partiturasSection = document.getElementById("partituras")
  if (partiturasSection) {
    const headerHeight = header.offsetHeight
    const targetPosition = partiturasSection.offsetTop - headerHeight

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    })
  }
})

// Header background opacity on scroll
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset
  const rate = scrolled * -0.5

  if (scrolled > 100) {
    header.style.background = "rgba(10, 10, 10, 0.98)"
  } else {
    header.style.background = "rgba(10, 10, 10, 0.95)"
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

// Add loading animation
window.addEventListener("load", () => {
  document.body.style.opacity = "1"
  document.body.style.transition = "opacity 0.5s ease"
})

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  // Add initial loading state
  document.body.style.opacity = "0"

  // Preload critical elements
  const logo = document.querySelector(".logo")
  if (logo) {
    logo.addEventListener("error", () => {
      // Fallback if logo doesn't load
      logo.style.display = "none"
    })
  }
})

// Add keyboard navigation support
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navMenu.classList.contains("active")) {
    navMenu.classList.remove("active")
    navToggle.classList.remove("active")
  }
})

// Performance optimization: Throttle scroll events
let ticking = false

function updateHeader() {
  const scrolled = window.pageYOffset

  if (scrolled > 100) {
    header.style.background = "rgba(10, 10, 10, 0.98)"
    header.style.boxShadow = "0 2px 20px rgba(0, 255, 255, 0.1)"
  } else {
    header.style.background = "rgba(10, 10, 10, 0.95)"
    header.style.boxShadow = "none"
  }

  ticking = false
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateHeader)
    ticking = true
  }
})
