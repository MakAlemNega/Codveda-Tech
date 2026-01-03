// ===== DOM ELEMENTS =====
const form = document.getElementById("registrationForm");
const formSteps = document.querySelectorAll(".form-step");
const progressBar = document.getElementById("progressBar");
const steps = document.querySelectorAll(".step");
const nextButtons = document.querySelectorAll(".btn-next");
const prevButtons = document.querySelectorAll(".btn-prev");
const submitBtn = document.getElementById("submitBtn");
const togglePreview = document.getElementById("togglePreview");
const formDataPreview = document.getElementById("formDataPreview");
const successModal = document.getElementById("successModal");
const closeModal = document.getElementById("closeModal");
const downloadDataBtn = document.getElementById("downloadData");
const modalData = document.getElementById("modalData");

// ===== FORM STATE =====
let currentStep = 0;
const formData = {
  personal: {},
  account: {},
  preferences: {},
  terms: false,
};

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  initForm();
  initEventListeners();
  initCharacterCounters();
  initPasswordStrength();
  initFileUpload();
  initValidation();
});

// ===== FORM INITIALIZATION =====
function initForm() {
  // Show first step
  showStep(0);
  updateProgressBar();

  // Set up real-time validation
  setupRealTimeValidation();
}

function initEventListeners() {
  // Navigation buttons
  nextButtons.forEach((button) => {
    button.addEventListener("click", handleNextStep);
  });

  prevButtons.forEach((button) => {
    button.addEventListener("click", handlePrevStep);
  });

  // Step indicators
  steps.forEach((step, index) => {
    step.addEventListener("click", () => {
      if (index < currentStep) {
        showStep(index);
      }
    });
  });

  // Form submission
  form.addEventListener("submit", handleSubmit);

  // Toggle password visibility
  document
    .getElementById("togglePassword")
    .addEventListener("click", togglePasswordVisibility);
  document
    .getElementById("toggleConfirmPassword")
    .addEventListener("click", toggleConfirmPasswordVisibility);

  // Data preview toggle
  togglePreview.addEventListener("click", toggleDataPreview);

  // Modal controls
  closeModal.addEventListener("click", () => {
    successModal.classList.add("hidden");
    resetForm();
  });

  downloadDataBtn.addEventListener("click", downloadFormData);

  // Real-time input updates
  setupRealTimeUpdates();
}

// ===== STEP MANAGEMENT =====
function showStep(stepIndex) {
  // Hide all steps
  formSteps.forEach((step) => {
    step.classList.remove("active");
  });

  // Show current step
  formSteps[stepIndex].classList.add("active");
  currentStep = stepIndex;

  // Update progress indicators
  updateProgressBar();
  updateStepIndicators();

  // Scroll to top of form
  formSteps[stepIndex].scrollIntoView({ behavior: "smooth", block: "start" });

  // Update review section if on last step
  if (stepIndex === 3) {
    updateReviewSection();
  }
}

function handleNextStep(e) {
  e.preventDefault();
  const nextStep = parseInt(e.target.dataset.next.replace("step", "")) - 1;

  if (validateCurrentStep()) {
    saveStepData();
    showStep(nextStep);
  }
}

function handlePrevStep(e) {
  e.preventDefault();
  const prevStep = parseInt(e.target.dataset.prev.replace("step", "")) - 1;
  showStep(prevStep);
}

function updateProgressBar() {
  const progress = (currentStep / (formSteps.length - 1)) * 100;
  progressBar.style.width = `${progress}%`;
}

function updateStepIndicators() {
  steps.forEach((step, index) => {
    if (index < currentStep) {
      step.classList.add("completed");
      step.classList.remove("active");
    } else if (index === currentStep) {
      step.classList.add("active");
      step.classList.remove("completed");
    } else {
      step.classList.remove("active", "completed");
    }
  });
}

// ===== VALIDATION =====
function validateCurrentStep() {
  const currentStepElement = formSteps[currentStep];
  const inputs = currentStepElement.querySelectorAll(
    "input[required], select[required], textarea[required]"
  );
  let isValid = true;

  inputs.forEach((input) => {
    if (!validateInput(input)) {
      isValid = false;
      showError(input, getErrorMessage(input));
    } else {
      clearError(input);
    }
  });

  // Special validation for step 2 (password match)
  if (currentStep === 1) {
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");

    if (
      password.value &&
      confirmPassword.value &&
      password.value !== confirmPassword.value
    ) {
      isValid = false;
      showError(confirmPassword, "Passwords do not match");
    }
  }

  return isValid;
}

function validateInput(input) {
  const value = input.value.trim();
  const type = input.type;
  const required = input.required;

  if (required && !value) {
    return false;
  }

  switch (type) {
    case "email":
      return validateEmail(value);
    case "tel":
      return validatePhone(value);
    case "password":
      return validatePassword(value);
    case "text":
      if (input.name === "firstName" || input.name === "lastName") {
        return value.length >= 2;
      }
      if (input.name === "username") {
        return value.length >= 4;
      }
      return true;
    default:
      return true;
  }
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  return phoneRegex.test(phone);
}

function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecial
  );
}

function getErrorMessage(input) {
  const value = input.value.trim();

  if (!value && input.required) {
    return "This field is required";
  }

  switch (input.type) {
    case "email":
      return "Please enter a valid email address";
    case "tel":
      return "Please enter a valid phone number (123-456-7890)";
    case "password":
      if (value.length < 8) return "Password must be at least 8 characters";
      if (!/[A-Z]/.test(value))
        return "Password must contain at least one uppercase letter";
      if (!/[a-z]/.test(value))
        return "Password must contain at least one lowercase letter";
      if (!/\d/.test(value)) return "Password must contain at least one number";
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
        return "Password must contain at least one special character";
      break;
    case "text":
      if (input.name === "firstName" || input.name === "lastName") {
        if (value.length < 2) return "Must be at least 2 characters";
      }
      if (input.name === "username") {
        if (value.length < 4) return "Username must be at least 4 characters";
      }
      break;
  }

  return "Please enter a valid value";
}

function showError(input, message) {
  input.classList.add("error");
  input.classList.remove("valid");

  const errorElement = document.getElementById(`${input.id}Error`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add("show");
  }
}

function clearError(input) {
  input.classList.remove("error");
  input.classList.add("valid");

  const errorElement = document.getElementById(`${input.id}Error`);
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.classList.remove("show");
  }
}

// ===== REAL-TIME VALIDATION =====
function setupRealTimeValidation() {
  const inputs = form.querySelectorAll("input, select, textarea");

  inputs.forEach((input) => {
    // Validate on blur
    input.addEventListener("blur", () => {
      if (input.value.trim()) {
        validateInput(input)
          ? clearError(input)
          : showError(input, getErrorMessage(input));
      }
    });

    // Clear error on focus
    input.addEventListener("focus", () => {
      clearError(input);
    });

    // Real-time validation for specific inputs
    if (input.type === "email") {
      input.addEventListener(
        "input",
        debounce(() => {
          if (input.value.trim() && validateEmail(input.value)) {
            clearError(input);
          }
        }, 300)
      );
    }

    if (input.id === "password") {
      input.addEventListener("input", () => {
        updatePasswordStrength(input.value);
        updatePasswordRequirements(input.value);
      });
    }

    if (input.id === "confirmPassword") {
      input.addEventListener("input", () => {
        const password = document.getElementById("password").value;
        const confirm = input.value;

        if (password && confirm) {
          if (password === confirm) {
            clearError(input);
            showPasswordMatch(true);
          } else {
            showError(input, "Passwords do not match");
            showPasswordMatch(false);
          }
        }
      });
    }
  });
}

// ===== PASSWORD STRENGTH =====
function initPasswordStrength() {
  const passwordInput = document.getElementById("password");
  passwordInput.addEventListener("input", (e) => {
    updatePasswordStrength(e.target.value);
    updatePasswordRequirements(e.target.value);
  });
}

function updatePasswordStrength(password) {
  let strength = 0;
  const strengthBar = document.getElementById("strengthBar");
  const strengthText = document.getElementById("strengthText");

  // Length check
  if (password.length >= 8) strength += 20;

  // Character type checks
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[a-z]/.test(password)) strength += 20;
  if (/\d/.test(password)) strength += 20;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;

  // Update UI
  strengthBar.style.width = `${strength}%`;

  // Update color and text based on strength
  if (strength < 40) {
    strengthBar.style.background = "#f72585"; // Red
    strengthText.textContent = "Weak";
    strengthText.style.color = "#f72585";
  } else if (strength < 80) {
    strengthBar.style.background = "#f8961e"; // Orange
    strengthText.textContent = "Fair";
    strengthText.style.color = "#f8961e";
  } else {
    strengthBar.style.background = "#4cc9f0"; // Green
    strengthText.textContent = "Strong";
    strengthText.style.color = "#4cc9f0";
  }
}

function updatePasswordRequirements(password) {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  Object.keys(requirements).forEach((rule) => {
    const element = document.querySelector(`.req-item[data-rule="${rule}"] i`);
    if (requirements[rule]) {
      element.className = "fas fa-check-circle";
      element.style.color = "#4cc9f0";
      element.parentElement.classList.add("valid");
    } else {
      element.className = "fas fa-circle";
      element.style.color = "#adb5bd";
      element.parentElement.classList.remove("valid");
    }
  });
}

function showPasswordMatch(isMatch) {
  const confirmInput = document.getElementById("confirmPassword");
  const feedback = confirmInput.parentElement.querySelector(".input-feedback");
  const checkIcon = feedback.querySelector(".check-icon");
  const errorIcon = feedback.querySelector(".error-icon");
  const statusText = feedback.querySelector(".match-status");

  if (isMatch) {
    checkIcon.classList.remove("hidden");
    errorIcon.classList.add("hidden");
    statusText.textContent = "Passwords match";
    statusText.style.color = "#4cc9f0";
    confirmInput.classList.remove("error");
    confirmInput.classList.add("valid");
  } else {
    checkIcon.classList.add("hidden");
    errorIcon.classList.remove("hidden");
    statusText.textContent = "Passwords do not match";
    statusText.style.color = "#f72585";
    confirmInput.classList.add("error");
    confirmInput.classList.remove("valid");
  }
}

// ===== CHARACTER COUNTERS =====
function initCharacterCounters() {
  const textInputs = document.querySelectorAll('input[type="text"], textarea');

  textInputs.forEach((input) => {
    const counter = input.parentElement.querySelector(".char-counter");
    if (counter) {
      input.addEventListener("input", () => {
        const maxLength = input.maxLength || 999;
        const currentLength = input.value.length;
        counter.textContent = `${currentLength}/${maxLength}`;

        // Update color based on length
        if (currentLength > maxLength * 0.9) {
          counter.style.color = "#f72585";
        } else if (currentLength > maxLength * 0.7) {
          counter.style.color = "#f8961e";
        } else {
          counter.style.color = "#adb5bd";
        }
      });

      // Trigger initial count
      input.dispatchEvent(new Event("input"));
    }
  });
}

// ===== FILE UPLOAD =====
function initFileUpload() {
  const fileInput = document.getElementById("profilePic");
  const filePreview = document.getElementById("filePreview");

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a valid image file (JPEG, PNG, or GIF)");
        fileInput.value = "";
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        fileInput.value = "";
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        filePreview.innerHTML = `
                    <div class="file-preview-item">
                        <img src="${e.target.result}" alt="Preview">
                        <div>
                            <p>${file.name}</p>
                            <p>${(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <button type="button" class="remove-file">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;

        // Add remove file functionality
        filePreview
          .querySelector(".remove-file")
          .addEventListener("click", () => {
            fileInput.value = "";
            filePreview.innerHTML = "";
          });
      };
      reader.readAsDataURL(file);
    }
  });
}

// ===== FORM SUBMISSION =====
async function handleSubmit(e) {
  e.preventDefault();

  // Validate all steps
  let allValid = true;
  for (let i = 0; i < formSteps.length; i++) {
    showStep(i);
    if (!validateCurrentStep()) {
      allValid = false;
      break;
    }
    saveStepData();
  }

  if (!allValid) {
    alert("Please fix all errors before submitting");
    return;
  }

  // Validate terms agreement
  const terms = document.getElementById("terms");
  if (!terms.checked) {
    showError(terms, "You must agree to the terms and conditions");
    terms.scrollIntoView({ behavior: "smooth" });
    return;
  }

  // Show loading state
  submitBtn.disabled = true;
  const submitText = submitBtn.querySelector(".submit-text");
  const loading = submitBtn.querySelector(".loading");
  submitText.classList.add("hidden");
  loading.classList.remove("hidden");

  try {
    // Simulate API call
    await submitFormData(formData);

    // Show success modal
    setTimeout(() => {
      showSuccessModal();
    }, 1000);
  } catch (error) {
    console.error("Submission error:", error);
    alert("There was an error submitting the form. Please try again.");
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    submitText.classList.remove("hidden");
    loading.classList.add("hidden");
  }
}

async function submitFormData(data) {
  // Simulate API call delay
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // In a real application, you would send data to your server here
      console.log("Form data submitted:", data);
      resolve({ success: true, message: "Form submitted successfully" });
    }, 1500);
  });
}

function saveStepData() {
  const currentStepElement = formSteps[currentStep];
  const inputs = currentStepElement.querySelectorAll("input, select, textarea");

  inputs.forEach((input) => {
    if (input.type === "checkbox") {
      // Handle checkboxes
      const checkboxes = currentStepElement.querySelectorAll(
        `input[name="${input.name}"]:checked`
      );
      formData[input.name] = Array.from(checkboxes).map((cb) => cb.value);
    } else if (input.type === "radio") {
      // Handle radio buttons
      const checkedRadio = currentStepElement.querySelector(
        `input[name="${input.name}"]:checked`
      );
      if (checkedRadio) {
        formData[input.name] = checkedRadio.value;
      }
    } else if (input.type === "file") {
      // Handle file uploads
      if (input.files.length > 0) {
        formData[input.name] = input.files[0].name;
      }
    } else {
      // Handle other inputs
      formData[input.name] = input.value.trim();
    }
  });
}

// ===== REVIEW SECTION =====
function updateReviewSection() {
  // Personal Information
  document.getElementById("reviewName").textContent = `${
    formData.firstName || "-"
  } ${formData.lastName || "-"}`;
  document.getElementById("reviewEmail").textContent = formData.email || "-";
  document.getElementById("reviewPhone").textContent = `${
    formData.countryCode || ""
  } ${formData.phone || "-"}`;
  document.getElementById("reviewAddress").textContent =
    formData.address || "-";

  // Account Details
  document.getElementById("reviewUsername").textContent =
    formData.username || "-";

  // Preferences
  document.getElementById("reviewCountry").textContent =
    getCountryName(formData.country) || "-";
  document.getElementById("reviewLanguage").textContent =
    getLanguageName(formData.language) || "-";

  const notifications = formData.notifications || [];
  document.getElementById("reviewNotifications").textContent =
    notifications.length > 0 ? notifications.join(", ") : "None";
}

function getCountryName(code) {
  const countries = {
    US: "United States",
    UK: "United Kingdom",
    CA: "Canada",
    AU: "Australia",
    IN: "India",
    DE: "Germany",
    FR: "France",
    JP: "Japan",
  };
  return countries[code];
}

function getLanguageName(code) {
  const languages = {
    en: "English",
    es: "Spanish",
    fr: "French",
  };
  return languages[code];
}

// ===== SUCCESS MODAL =====
function showSuccessModal() {
  // Update modal data
  const modalContent = `
        <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Username:</strong> ${formData.username}</p>
        <p><strong>Account Created:</strong> ${new Date().toLocaleString()}</p>
    `;
  modalData.innerHTML = modalContent;

  // Show modal
  successModal.classList.remove("hidden");
}

function downloadFormData() {
  const dataStr = JSON.stringify(formData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `registration-data-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===== FORM RESET =====
function resetForm() {
  form.reset();
  currentStep = 0;
  showStep(0);
  updateProgressBar();

  // Clear form data object
  Object.keys(formData).forEach((key) => {
    formData[key] = "";
  });

  // Clear file preview
  const filePreview = document.getElementById("filePreview");
  filePreview.innerHTML = "";

  // Clear all errors
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach((error) => {
    error.textContent = "";
    error.classList.remove("show");
  });

  // Remove error/valid classes
  const inputs = form.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    input.classList.remove("error", "valid");
  });

  // Reset password strength
  document.getElementById("strengthBar").style.width = "0%";
  document.getElementById("strengthText").textContent = "Very Weak";

  // Reset character counters
  const counters = document.querySelectorAll(".char-counter");
  counters.forEach((counter) => {
    counter.textContent = "0/50";
    counter.style.color = "#adb5bd";
  });
}

// ===== DATA PREVIEW =====
function toggleDataPreview() {
  saveStepData();
  formDataPreview.textContent = JSON.stringify(formData, null, 2);
  formDataPreview.classList.toggle("hidden");

  togglePreview.innerHTML = formDataPreview.classList.contains("hidden")
    ? '<i class="fas fa-code"></i> Show Form Data'
    : '<i class="fas fa-eye-slash"></i> Hide Form Data';
}

// ===== PASSWORD VISIBILITY =====
function togglePasswordVisibility() {
  const passwordInput = document.getElementById("password");
  const toggleIcon = document
    .getElementById("togglePassword")
    .querySelector("i");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.className = "fas fa-eye-slash";
  } else {
    passwordInput.type = "password";
    toggleIcon.className = "fas fa-eye";
  }
}

function toggleConfirmPasswordVisibility() {
  const confirmInput = document.getElementById("confirmPassword");
  const toggleIcon = document
    .getElementById("toggleConfirmPassword")
    .querySelector("i");

  if (confirmInput.type === "password") {
    confirmInput.type = "text";
    toggleIcon.className = "fas fa-eye-slash";
  } else {
    confirmInput.type = "password";
    toggleIcon.className = "fas fa-eye";
  }
}

// ===== REAL-TIME UPDATES =====
function setupRealTimeUpdates() {
  // Update form data on input
  const inputs = form.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      saveStepData();
    });

    input.addEventListener("change", () => {
      saveStepData();
    });
  });
}

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function animateButton(button) {
  button.style.animation = "pulse 0.5s ease";
  setTimeout(() => {
    button.style.animation = "";
  }, 500);
}

// ===== EXPORT FUNCTIONS (for testing/development) =====
window.formUtils = {
  validateEmail,
  validatePhone,
  validatePassword,
  getFormData: () => formData,
  resetForm,
  showStep,
};

// ===== ERROR HANDLING =====
window.addEventListener("error", (e) => {
  console.error("Form error:", e.error);
  // You could show a user-friendly error message here
});

// ===== OFFLINE SUPPORT =====
window.addEventListener("online", () => {
  console.log("Application is online");
  // Could implement auto-save/retry logic here
});

window.addEventListener("offline", () => {
  console.log("Application is offline");
  // Could show offline warning here
});
