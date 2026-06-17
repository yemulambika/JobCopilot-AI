/**
 * Options page logic — loads and saves settings + resume text to chrome.storage.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Load stored settings
  chrome.storage.local.get(["apiUrl", "authToken", "profile", "resumeText"], (data) => {
    if (data.apiUrl) document.getElementById("apiUrl").value = data.apiUrl;
    if (data.authToken) document.getElementById("authToken").value = data.authToken;
    if (data.resumeText) document.getElementById("resumeText").value = data.resumeText;
    if (data.profile) {
      const p = data.profile;
      if (p.name) document.getElementById("pf-name").value = p.name;
      if (p.email) document.getElementById("pf-email").value = p.email;
      if (p.phone) document.getElementById("pf-phone").value = p.phone;
      if (p.location) document.getElementById("pf-location").value = p.location;
      if (p.linkedin) document.getElementById("pf-linkedin").value = p.linkedin;
      if (p.portfolio) document.getElementById("pf-portfolio").value = p.portfolio;
      if (p.notes) document.getElementById("pf-notes").value = p.notes;
    }
  });

  // Save button
  document.getElementById("btn-save").addEventListener("click", () => {
    const apiUrl = document.getElementById("apiUrl").value.trim();
    const authToken = document.getElementById("authToken").value.trim();
    const resumeText = document.getElementById("resumeText").value;
    const profile = {
      name: document.getElementById("pf-name").value.trim(),
      firstName: (document.getElementById("pf-name").value.trim() || "").split(" ")[0] || "",
      lastName: (document.getElementById("pf-name").value.trim() || "").split(" ").slice(1).join(" ") || "",
      email: document.getElementById("pf-email").value.trim(),
      phone: document.getElementById("pf-phone").value.trim(),
      location: document.getElementById("pf-location").value.trim(),
      linkedin: document.getElementById("pf-linkedin").value.trim(),
      portfolio: document.getElementById("pf-portfolio").value.trim(),
      notes: document.getElementById("pf-notes").value.trim(),
    };

    chrome.storage.local.set({ apiUrl, authToken, profile, resumeText }, () => {
      const status = document.getElementById("status-msg");
      status.textContent = "Settings saved!";
      status.style.display = "block";
      setTimeout(() => { status.style.display = "none"; }, 2000);
    });
  });

  // Clear profile button
  document.getElementById("btn-clear").addEventListener("click", () => {
    chrome.storage.local.remove(["profile", "resumeText"], () => {
      ["pf-name", "pf-email", "pf-phone", "pf-location", "pf-linkedin", "pf-portfolio", "pf-notes", "resumeText"].forEach((id) => {
        document.getElementById(id).value = "";
      });
      const status = document.getElementById("status-msg");
      status.textContent = "Profile cleared!";
      status.style.display = "block";
      setTimeout(() => { status.style.display = "none"; }, 2000);
    });
  });
});