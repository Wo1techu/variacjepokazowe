// OfferComparator - Compare Page JavaScript

let selectedFiles = [];

// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileListSection = document.getElementById('fileListSection');
const fileList = document.getElementById('fileList');
const fileCount = document.getElementById('fileCount');
const compareBtn = document.getElementById('compareBtn');
const clearBtn = document.getElementById('clearBtn');
const progressSection = document.getElementById('progressSection');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');

// Event Listeners
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
compareBtn.addEventListener('click', compareOffers);
clearBtn.addEventListener('click', clearFiles);

// Drag and Drop Events
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');

    const files = Array.from(e.dataTransfer.files).filter(file =>
        file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );

    if (files.length > 0) {
        addFiles(files);
    } else {
        showError('Proszę wybrać pliki Excel (.xlsx lub .xls)');
    }
});

// Handle file selection from input
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFiles(files);
}

// Add files to the list
function addFiles(files) {
    selectedFiles = [...selectedFiles, ...files];
    updateFileList();
    hideError();
}

// Update file list display
function updateFileList() {
    if (selectedFiles.length === 0) {
        fileListSection.style.display = 'none';
        compareBtn.disabled = true;
        return;
    }

    fileListSection.style.display = 'block';
    fileCount.textContent = selectedFiles.length;

    fileList.innerHTML = '';

    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item fade-in';
        fileItem.innerHTML = `
            <div class="file-name">
                <i class="bi bi-file-earmark-excel text-success"></i>
                <span>${file.name}</span>
            </div>
            <div class="file-size">${formatFileSize(file.size)}</div>
            <i class="bi bi-x-circle remove-btn" onclick="removeFile(${index})"></i>
        `;
        fileList.appendChild(fileItem);
    });

    // Enable compare button if at least 2 files
    compareBtn.disabled = selectedFiles.length < 2;

    if (selectedFiles.length === 1) {
        showError('Dodaj co najmniej jeszcze jeden plik do porównania');
    } else {
        hideError();
    }
}

// Remove file from list
function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
}

// Clear all files
function clearFiles() {
    selectedFiles = [];
    fileInput.value = '';
    updateFileList();
    hideResults();
    hideError();
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Compare offers
async function compareOffers() {
    if (selectedFiles.length < 2) {
        showError('Wybierz co najmniej 2 pliki do porównania');
        return;
    }

    // Show progress
    progressSection.style.display = 'block';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
    compareBtn.disabled = true;

    // Prepare form data
    const formData = new FormData();
    selectedFiles.forEach(file => {
        formData.append('files', file);
    });

    try {
        // Simulate progress
        updateProgress(20, 'Przesyłanie plików...');

        // Send request
        const response = await fetch('/api/compare', {
            method: 'POST',
            body: formData
        });

        updateProgress(60, 'Analizowanie ofert...');

        const result = await response.json();

        updateProgress(90, 'Generowanie wyników...');

        if (result.error) {
            throw new Error(result.error);
        }

        updateProgress(100, 'Gotowe!');

        setTimeout(() => {
            displayResults(result);
            progressSection.style.display = 'none';
        }, 500);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Wystąpił błąd podczas porównywania ofert');
        progressSection.style.display = 'none';
        compareBtn.disabled = false;
    }
}

// Update progress bar
function updateProgress(percent, text) {
    progressBar.style.width = percent + '%';
    progressBar.textContent = percent + '%';
    progressText.textContent = text;
}

// Display results
function displayResults(result) {
    resultsSection.style.display = 'block';
    resultsSection.classList.add('fade-in');

    // Summary
    displaySummary(result.summary);

    // Price analysis
    if (result.price_analysis && result.price_analysis.prices) {
        displayPriceAnalysis(result.price_analysis);
    }

    // Comparison table
    if (result.comparison_table && result.comparison_table.length > 0) {
        displayComparisonTable(result);
    }

    // Download button
    if (result.download_url) {
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.href = result.download_url;
        downloadBtn.style.display = 'inline-block';
    }

    compareBtn.disabled = false;
}

// Display summary
function displaySummary(summary) {
    const summarySection = document.getElementById('summarySection');
    summarySection.innerHTML = `
        <h5><i class="bi bi-info-circle text-primary me-2"></i>Podsumowanie</h5>
        <div class="row g-3 mt-2">
            <div class="col-md-4">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h3 class="text-primary mb-0">${summary.total_offers}</h3>
                        <p class="text-muted mb-0 small">Porównanych ofert</p>
                    </div>
                </div>
            </div>
            ${summary.offers_info.map((info, idx) => `
                <div class="col-md-4">
                    <div class="card bg-light">
                        <div class="card-body">
                            <h6 class="mb-1">Oferta ${idx + 1}</h6>
                            <p class="small mb-1 text-truncate" title="${info.filename}">
                                <i class="bi bi-file-earmark-excel text-success me-1"></i>${info.filename}
                            </p>
                            <p class="small text-muted mb-0">${info.rows} wierszy, ${info.columns} kolumn</p>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Display price analysis
function displayPriceAnalysis(priceAnalysis) {
    const priceSection = document.getElementById('priceSection');

    if (!priceAnalysis.cheapest) {
        priceSection.innerHTML = `
            <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                Nie znaleziono kolumn z cenami w plikach.
            </div>
        `;
        return;
    }

    const difference = priceAnalysis.difference;
    const percentDiff = ((difference / priceAnalysis.most_expensive.total) * 100).toFixed(2);

    priceSection.innerHTML = `
        <h5><i class="bi bi-cash-stack text-success me-2"></i>Analiza Cen</h5>
        <div class="row g-3 mt-2">
            <div class="col-md-4">
                <div class="card border-success">
                    <div class="card-body">
                        <h6 class="text-success">
                            <i class="bi bi-trophy-fill me-2"></i>Najtańsza oferta
                        </h6>
                        <p class="mb-1 small text-truncate" title="${priceAnalysis.cheapest.offer}">
                            ${priceAnalysis.cheapest.offer}
                        </p>
                        <h4 class="mb-0 text-success">${priceAnalysis.cheapest.total.toLocaleString('pl-PL', {minimumFractionDigits: 2})} zł</h4>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-danger">
                    <div class="card-body">
                        <h6 class="text-danger">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>Najdroższa oferta
                        </h6>
                        <p class="mb-1 small text-truncate" title="${priceAnalysis.most_expensive.offer}">
                            ${priceAnalysis.most_expensive.offer}
                        </p>
                        <h4 class="mb-0 text-danger">${priceAnalysis.most_expensive.total.toLocaleString('pl-PL', {minimumFractionDigits: 2})} zł</h4>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-warning">
                    <div class="card-body">
                        <h6 class="text-warning">
                            <i class="bi bi-calculator-fill me-2"></i>Różnica
                        </h6>
                        <p class="mb-1 small">Między ofertami</p>
                        <h4 class="mb-0 text-warning">${difference.toLocaleString('pl-PL', {minimumFractionDigits: 2})} zł</h4>
                        <p class="small text-muted mb-0">(${percentDiff}%)</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Display comparison table
function displayComparisonTable(result) {
    const comparisonTableDiv = document.getElementById('comparisonTable');

    let tableHTML = `
        <h5><i class="bi bi-table text-primary me-2"></i>Tabela Porównawcza</h5>
        <div class="table-responsive mt-3">
            <table class="table table-striped table-hover results-table">
                <thead>
                    <tr>
                        <th>Parametr</th>
    `;

    // Add offer columns
    for (let i = 0; i < result.count; i++) {
        tableHTML += `<th>Oferta ${i + 1}</th>`;
    }

    tableHTML += `
                    </tr>
                </thead>
                <tbody>
    `;

    // Add rows
    result.comparison_table.forEach(row => {
        tableHTML += `<tr><td><strong>${row.parameter}</strong></td>`;
        for (let i = 0; i < result.count; i++) {
            const value = row[`offer_${i + 1}`] || 'N/A';
            tableHTML += `<td>${value}</td>`;
        }
        tableHTML += `</tr>`;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>
    `;

    comparisonTableDiv.innerHTML = tableHTML;
}

// Show error
function showError(message) {
    errorSection.style.display = 'block';
    errorMessage.textContent = message;
    errorSection.classList.add('fade-in');
}

// Hide error
function hideError() {
    errorSection.style.display = 'none';
}

// Hide results
function hideResults() {
    resultsSection.style.display = 'none';
}
