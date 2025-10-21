// OfferComparator - RFQ Generator Page JavaScript

// DOM Elements
const rfqForm = document.getElementById('rfqForm');
const progressSection = document.getElementById('progressSection');
const progressBar = document.getElementById('progressBar');
const successSection = document.getElementById('successSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const constructionFields = document.getElementById('constructionFields');

// Set default deadline to 14 days from now
const deadlineInput = document.getElementById('deadline');
const defaultDeadline = new Date();
defaultDeadline.setDate(defaultDeadline.getDate() + 14);
deadlineInput.value = defaultDeadline.toISOString().split('T')[0];
deadlineInput.min = new Date().toISOString().split('T')[0]; // Can't select past dates

// Event Listeners
rfqForm.addEventListener('submit', handleFormSubmit);

// Template selection
function selectTemplate(templateType) {
    document.getElementById(`template-${templateType}`).checked = true;

    // Show/hide construction-specific fields
    if (templateType === 'construction') {
        constructionFields.style.display = 'block';
    } else {
        constructionFields.style.display = 'none';
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    // Hide previous messages
    successSection.style.display = 'none';
    errorSection.style.display = 'none';

    // Get form data
    const formData = new FormData(rfqForm);

    // Add template type
    const selectedTemplate = document.querySelector('input[name="template"]:checked').value;
    formData.append('template', selectedTemplate);

    // Show progress
    progressSection.style.display = 'block';
    updateProgress(30);

    try {
        // Send request
        const response = await fetch('/api/generate-rfq', {
            method: 'POST',
            body: formData
        });

        updateProgress(70);

        const result = await response.json();

        if (result.error) {
            throw new Error(result.error);
        }

        updateProgress(100);

        // Show success
        setTimeout(() => {
            progressSection.style.display = 'none';
            showSuccess(result.download_url);
        }, 500);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Wystąpił błąd podczas generowania dokumentu');
        progressSection.style.display = 'none';
    }
}

// Update progress bar
function updateProgress(percent) {
    progressBar.style.width = percent + '%';
    progressBar.textContent = percent + '%';
}

// Show success message
function showSuccess(downloadUrl) {
    successSection.style.display = 'block';
    successSection.classList.add('fade-in');

    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.href = downloadUrl;

    // Scroll to success section
    successSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Show error message
function showError(message) {
    errorSection.style.display = 'block';
    errorMessage.textContent = message;
    errorSection.classList.add('fade-in');

    // Scroll to error section
    errorSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Form validation helpers
function validateForm() {
    const projectName = document.getElementById('projectName').value.trim();
    const companyName = document.getElementById('companyName').value.trim();
    const deadline = document.getElementById('deadline').value;
    const description = document.getElementById('description').value.trim();

    if (!projectName) {
        showError('Nazwa projektu jest wymagana');
        return false;
    }

    if (!companyName) {
        showError('Nazwa firmy jest wymagana');
        return false;
    }

    if (!deadline) {
        showError('Termin składania ofert jest wymagany');
        return false;
    }

    if (!description) {
        showError('Opis przedmiotu zamówienia jest wymagany');
        return false;
    }

    return true;
}

// Auto-save form data to localStorage (optional feature)
function saveFormData() {
    const formData = {
        projectName: document.getElementById('projectName').value,
        companyName: document.getElementById('companyName').value,
        deadline: document.getElementById('deadline').value,
        contactPerson: document.getElementById('contactPerson').value,
        contactEmail: document.getElementById('contactEmail').value,
        contactPhone: document.getElementById('contactPhone').value,
        description: document.getElementById('description').value,
        location: document.getElementById('location').value,
        constructionDuration: document.getElementById('constructionDuration').value
    };

    localStorage.setItem('rfqFormData', JSON.stringify(formData));
}

// Load saved form data
function loadFormData() {
    const savedData = localStorage.getItem('rfqFormData');
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);

            // Only load if user confirms
            if (confirm('Znaleziono zapisane dane formularza. Czy chcesz je wczytać?')) {
                Object.keys(formData).forEach(key => {
                    const element = document.getElementById(key);
                    if (element) {
                        element.value = formData[key];
                    }
                });
            } else {
                localStorage.removeItem('rfqFormData');
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }
}

// Auto-save on form change (debounced)
let saveTimeout;
rfqForm.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveFormData, 1000);
});

// Clear saved data on successful submission
rfqForm.addEventListener('submit', () => {
    setTimeout(() => {
        localStorage.removeItem('rfqFormData');
    }, 1000);
});

// Load saved data on page load
window.addEventListener('load', loadFormData);

// Character counter for description
const descriptionField = document.getElementById('description');
const descriptionCounter = document.createElement('div');
descriptionCounter.className = 'form-text text-end';
descriptionField.parentNode.appendChild(descriptionCounter);

descriptionField.addEventListener('input', () => {
    const length = descriptionField.value.length;
    descriptionCounter.textContent = `${length} znaków`;

    if (length > 500) {
        descriptionCounter.classList.add('text-success');
    } else if (length > 100) {
        descriptionCounter.classList.add('text-info');
    } else {
        descriptionCounter.classList.remove('text-success', 'text-info');
    }
});

// Quick fill buttons (for demo/testing)
function quickFillBasic() {
    document.getElementById('projectName').value = 'Wdrożenie systemu CRM';
    document.getElementById('companyName').value = 'Przykładowa Firma Sp. z o.o.';
    document.getElementById('contactPerson').value = 'Jan Kowalski';
    document.getElementById('contactEmail').value = 'j.kowalski@firma.pl';
    document.getElementById('contactPhone').value = '+48 123 456 789';
    document.getElementById('description').value = 'Firma poszukuje dostawcy systemu CRM, który wspierałby zarządzanie relacjami z klientami, automatyzację sprzedaży oraz integrację z istniejącymi systemami.';
}

// Add quick fill button (only in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const quickFillBtn = document.createElement('button');
    quickFillBtn.type = 'button';
    quickFillBtn.className = 'btn btn-sm btn-outline-info mb-3';
    quickFillBtn.innerHTML = '<i class="bi bi-lightning-fill me-1"></i>Wypełnij przykładowymi danymi';
    quickFillBtn.onclick = quickFillBasic;
    rfqForm.insertBefore(quickFillBtn, rfqForm.firstChild);
}
