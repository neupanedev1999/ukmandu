"use strict";

document.addEventListener("DOMContentLoaded", () => {
  setupMobileNavigation();
  setupCurrentYear();
  setupWorldClocks();
  loadExchangeRate();
  setupNewsletterForm();
});

/* ==============================
   MOBILE NAVIGATION
================================ */

function setupMobileNavigation() {
  const menuButton = document.getElementById("mobileMenuButton");
  const navigation = document.getElementById("mainNavigation");

  if (!menuButton || !navigation) {
    return;
  }

  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("show-menu");

    menuButton.classList.toggle("menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu(menuButton, navigation);
    });
  });

  document.addEventListener("click", (event) => {
    const clickedInsideNavigation = navigation.contains(event.target);
    const clickedMenuButton = menuButton.contains(event.target);

    if (!clickedInsideNavigation && !clickedMenuButton) {
      closeMobileMenu(menuButton, navigation);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu(menuButton, navigation);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      closeMobileMenu(menuButton, navigation);
    }
  });
}

function closeMobileMenu(menuButton, navigation) {
  navigation.classList.remove("show-menu");
  menuButton.classList.remove("menu-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation menu");
}

/* ==============================
   CURRENT YEAR
================================ */

function setupCurrentYear() {
  const yearElement = document.getElementById("currentYear");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

/* ==============================
   LONDON AND KATHMANDU CLOCKS
================================ */

function setupWorldClocks() {
  const londonTimeElement = document.getElementById("londonTime");
  const kathmanduTimeElement = document.getElementById("kathmanduTime");

  function updateClocks() {
    const now = new Date();

    if (londonTimeElement) {
      londonTimeElement.textContent = formatTime(
        now,
        "Europe/London"
      );
    }

    if (kathmanduTimeElement) {
      kathmanduTimeElement.textContent = formatTime(
        now,
        "Asia/Kathmandu"
      );
    }
  }

  updateClocks();
  window.setInterval(updateClocks, 1000);
}

function formatTime(date, timeZone) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
}

/* ==============================
   GBP TO NPR EXCHANGE RATE
================================ */

async function loadExchangeRate() {
  const exchangeRateElement = document.getElementById("exchangeRate");

  if (!exchangeRateElement) {
    return;
  }

  const storedRate = getStoredExchangeRate();

  if (storedRate) {
    exchangeRateElement.textContent =
      `£1 = Rs. ${storedRate.rate.toFixed(2)}`;
  }

  try {
    const response = await fetch(
      "https://open.er-api.com/v6/latest/GBP",
      {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Exchange API returned ${response.status}`);
    }

    const data = await response.json();
    const nprRate = Number(data?.rates?.NPR);

    if (!Number.isFinite(nprRate)) {
      throw new Error("NPR rate was not available.");
    }

    exchangeRateElement.textContent =
      `£1 = Rs. ${nprRate.toFixed(2)}`;

    localStorage.setItem(
      "ukmanduExchangeRate",
      JSON.stringify({
        rate: nprRate,
        savedAt: Date.now()
      })
    );
  } catch (error) {
    console.error("Exchange rate error:", error);

    if (!storedRate) {
      exchangeRateElement.textContent = "Rate unavailable";
    }
  }
}

function getStoredExchangeRate() {
  try {
    const savedData = localStorage.getItem("ukmanduExchangeRate");

    if (!savedData) {
      return null;
    }

    const parsedData = JSON.parse(savedData);
    const maximumAge = 12 * 60 * 60 * 1000;
    const isExpired =
      Date.now() - Number(parsedData.savedAt) > maximumAge;

    if (
      isExpired ||
      !Number.isFinite(Number(parsedData.rate))
    ) {
      localStorage.removeItem("ukmanduExchangeRate");
      return null;
    }

    return {
      rate: Number(parsedData.rate),
      savedAt: Number(parsedData.savedAt)
    };
  } catch (error) {
    localStorage.removeItem("ukmanduExchangeRate");
    return null;
  }
}

/* ==============================
   NEWSLETTER FORM
================================ */

function setupNewsletterForm() {
  const newsletterForm =
    document.querySelector(".newsletter-form");

  if (!newsletterForm) {
    return;
  }

  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const emailInput =
      newsletterForm.querySelector('input[type="email"]');

    if (!emailInput || !emailInput.value.trim()) {
      return;
    }

    const existingMessage =
      newsletterForm.querySelector(".form-message");

    if (existingMessage) {
      existingMessage.remove();
    }

    const message = document.createElement("p");
    message.className = "form-message";
    message.textContent =
      "Thank you for subscribing to UKMandu.";

    newsletterForm.appendChild(message);
    newsletterForm.reset();
  });
}