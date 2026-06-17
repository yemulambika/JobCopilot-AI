/**
 * Popup UI logic — extraction, Q&A generation, autofill, and save.
 */

const $ = (sel) => document.querySelector(sel);

let currentJob = null;
let lastGeneratedAnswer = "";

// ─── Initialize ────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  // Load profile
  chrome.runtime.sendMessage({ action: "get_profile" }, (profile) => {
    if (profile) {
      $("#pf-name").value = profile.name || "";
      $("#pf-email").value = profile.email || "";
      $("#pf-phone").value = profile.phone || "";
      $("#pf-cover").value = profile.coverLetter || "";
    }
  });

  chrome.runtime.sendMessage({ action: "get_settings" }, () => {});

  // Load cached job
  chrome.storage.local.get("lastDetectedJob", (result) => {
    if (result.lastDetectedJob) {
      displayJob(result.lastDetectedJob);
    }
  });

  // Enable ask button when question is typed
  $("#qa-question").addEventListener("input", () => {
    $("#btn-ask").disabled = !$("#qa-question").value.trim();
  });

  // Preset question chips
  document.querySelectorAll(".qa-preset").forEach((chip) => {
    chip.addEventListener("click", () => {
      $("#qa-question").value = chip.dataset.q;
      $("#btn-ask").disabled = false;
      $("#qa-question").focus();
    });
  });
});

// ─── Collapsible sections ──────────────────────────────────
document.addEventListener("click", (e) => {
  const header = e.target.closest(".collapsible-header");
  if (!header) return;
  header.classList.toggle("open");
  const sectionId = header.id.replace("-header", "-body");
  const body = $(`#${sectionId}`);
  if (body) {
    body.style.display = body.style.display === "none" ? "block" : "none";
  }
});

// ─── Extract JD ────────────────────────────────────────────
$("#btn-extract").addEventListener("click", async () => {
  const btn = $("#btn-extract");
  btn.disabled = true;
  btn.textContent = "⏳ Extracting...";
  hideMessages();

  try {
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: "extract_from_tab" }, resolve);
    });

    if (response?.success && response.data) {
      displayJob(response.data);
      $("#btn-save").style.display = "block";
      $("#btn-save").disabled = false;
      $("#btn-ask").disabled = false;
      showSuccess("Job extracted! You can now generate answers.");
    } else {
      showError(response?.error || "No job found. Navigate to a job page first.");
    }
  } catch (err) {
    showError("Error: " + err.message);
  }

  btn.disabled = false;
  btn.textContent = "🔍 Extract JD";
});

// ─── Save to job tracker ───────────────────────────────────
$("#btn-save").addEventListener("click", async () => {
  if (!currentJob) return;
  const btn = $("#btn-save");
  btn.disabled = true;
  btn.textContent = "💾 Saving...";
  hideMessages();

  try {
    const result = await chrome.runtime.sendMessage({
      action: "submit_to_backend",
      data: currentJob,
    });
    if (result?.success) {
      showSuccess("Job saved to your tracker!");
      btn.textContent = "✅ Saved";
    } else {
      showError(result?.error || "Failed to save");
    }
  } catch (err) {
    showError("Error: " + err.message);
  }
});

// ─── Generate Answer ───────────────────────────────────────
async function generateAnswer() {
  const question = $("#qa-question").value.trim();
  if (!question) return;

  const btn = $("#btn-ask");
  btn.disabled = true;
  btn.textContent = "⏳ Generating...";
  const answerEl = $("#qa-answer");
  const actionsEl = $("#qa-actions");
  answerEl.style.display = "none";
  actionsEl.style.display = "none";
  hideMessages();

  // Gather context from current job
  const data = {
    question,
    jobDescription: currentJob?.description || "",
    companyName: currentJob?.company || "",
    roleName: currentJob?.role || "",
    resumeText: "",
  };

  try {
    // Try to get resume text from profile
    chrome.storage.local.get("resumeText", (res) => {
      if (res.resumeText) data.resumeText = res.resumeText;
    });
  } catch { /* proceed without resume */ }

  try {
    const result = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: "answer_question", data }, resolve);
    });

    if (result?.success && result.data?.answer) {
      lastGeneratedAnswer = result.data.answer;
      answerEl.textContent = result.data.answer;
      answerEl.style.display = "block";
      actionsEl.style.display = "flex";
      showSuccess("Answer generated! Review below before inserting.");
    } else {
      showError(result?.error || "Failed to generate answer. Check your backend connection.");
    }
  } catch (err) {
    showError("Error: " + err.message);
  }

  btn.disabled = false;
  btn.textContent = "✨ Generate Answer";
}

$("#btn-ask").addEventListener("click", generateAnswer);

// ─── Copy answer to clipboard ─────────────────────────────
$("#btn-copy-answer").addEventListener("click", () => {
  navigator.clipboard.writeText(lastGeneratedAnswer).then(() => {
    showSuccess("Answer copied to clipboard!");
  }).catch(() => {
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = lastGeneratedAnswer;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showSuccess("Answer copied!");
  });
});

// ─── Insert answer into form on page ──────────────────────
$("#btn-insert-answer").addEventListener("click", async () => {
  if (!lastGeneratedAnswer) return;

  const profile = {
    coverLetter: lastGeneratedAnswer,
    name: getCurrentProfile().name,
    firstName: getCurrentProfile().firstName,
    lastName: getCurrentProfile().lastName,
    email: getCurrentProfile().email,
    phone: getCurrentProfile().phone,
  };

  try {
    const result = await chrome.runtime.sendMessage({
      action: "autofill",
      profile,
    });
    if (result?.success) {
      showSuccess("Answer inserted into the form field on this page! Review before submitting.");
    } else {
      showError(result?.error || "Failed to insert. Copy manually instead.");
    }
  } catch (err) {
    showError("Error: " + err.message);
  }
});

// ─── Retry / regenerate answer ────────────────────────────
$("#btn-retry").addEventListener("click", generateAnswer);

// ─── Autofill form ─────────────────────────────────────────
$("#btn-autofill").addEventListener("click", async () => {
  const btn = $("#btn-autofill");
  btn.disabled = true;
  btn.textContent = "⏳ Filling...";
  hideMessages();

  const profile = getCurrentProfile();
  if (!profile.name && !profile.email) {
    showError("Enter at least a name or email to autofill.");
    btn.disabled = false;
    btn.textContent = "✨ Autofill Form";
    return;
  }

  try {
    const result = await chrome.runtime.sendMessage({ action: "autofill", profile });
    if (result?.success) {
      showSuccess("Form autofilled! Review before submitting.");
    } else {
      showError(result?.error || "Failed to autofill");
    }
  } catch (err) {
    showError("Error: " + err.message);
  }

  btn.disabled = false;
  btn.textContent = "✨ Autofill Form";
});

// ─── Save profile ─────────────────────────────────────────
$("#btn-save-profile").addEventListener("click", () => {
  chrome.runtime.sendMessage(
    { action: "save_profile", profile: getCurrentProfile() },
    (result) => { if (result?.success) showSuccess("Profile saved!"); }
  );
});

// ─── Open settings ────────────────────────────────────────
$("#btn-open-options").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

// ─── Display detected job ─────────────────────────────────
function displayJob(data) {
  currentJob = data;
  $("#detected-job").style.display = "block";
  $("#platform").textContent = data.platform
    ? data.platform.charAt(0).toUpperCase() + data.platform.slice(1)
    : "Unknown";
  $("#company").textContent = data.company || "Not detected";
  $("#role").textContent = data.role || "Not detected";

  // Skills tags
  const skillsList = $("#skills-list");
  const skillsCount = $("#skills-count");
  skillsList.innerHTML = "";
  const skills = data.skills || [];
  skillsCount.textContent = skills.length;

  if (skills.length > 0) {
    skills.forEach((skill) => {
      const tag = document.createElement("span");
      tag.className = "skill-tag";
      tag.textContent = skill;
      skillsList.appendChild(tag);
    });
  } else {
    skillsList.innerHTML = '<span style="font-size:10px;color:#64748b;">No skills detected</span>';
  }

  $("#description-preview").textContent = data.description
    ? data.description.substring(0, 150) + (data.description.length > 150 ? "..." : "")
    : "Not detected";
}

// ─── Utility helpers ──────────────────────────────────────
function showError(msg) {
  const el = $("#error-box");
  el.textContent = msg;
  el.style.display = "block";
  $("#success-box").style.display = "none";
}

function showSuccess(msg) {
  const el = $("#success-box");
  el.textContent = msg;
  el.style.display = "block";
  $("#error-box").style.display = "none";
}

function hideMessages() {
  $("#error-box").style.display = "none";
  $("#success-box").style.display = "none";
}

function getCurrentProfile() {
  return {
    name: $("#pf-name").value.trim(),
    firstName: ($("#pf-name").value.trim() || "").split(" ")[0] || "",
    lastName: ($("#pf-name").value.trim() || "").split(" ").slice(1).join(" ") || "",
    email: $("#pf-email").value.trim(),
    phone: $("#pf-phone").value.trim(),
    coverLetter: $("#pf-cover").value.trim(),
  };
}