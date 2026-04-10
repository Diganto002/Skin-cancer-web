/**
 * Advanced Skin Cancer Diagnosis — script.js
 * Handles: drag-drop upload, file preview, mock AI results, accordion, model info
 */

(function () {
  'use strict';

  /* ── Element references ─────────────────────────────── */
  const dropZone        = document.getElementById('drop-zone');
  const fileInput       = document.getElementById('file-input');
  const uploadBtn       = document.getElementById('upload-btn');
  const resultsSection  = document.getElementById('results-section');
  const previewImg      = document.getElementById('preview-img');
  const fileNameDisplay = document.getElementById('file-name-display');

  const diagnosisAlert  = document.getElementById('diagnosis-alert');
  const alertIcon       = document.getElementById('alert-icon');
  const alertTitle      = document.getElementById('alert-title');
  const alertConfidence = document.getElementById('alert-confidence');

  const progressBar     = document.getElementById('progress-bar');
  const progressPct     = document.getElementById('progress-pct');

  const accordionBtn    = document.getElementById('accordion-btn');
  const accordionBody   = document.getElementById('accordion-body');
  const accordionArrow  = document.getElementById('accordion-arrow');

  const effBar          = document.getElementById('eff-bar');
  const effPct          = document.getElementById('eff-pct');
  const denBar          = document.getElementById('den-bar');
  const denPct          = document.getElementById('den-pct');

  const insightsText    = document.getElementById('insights-text');
  const resetBtn        = document.getElementById('reset-btn');
  const modelInfoText   = document.getElementById('model-info-text');
  const modelRadios     = document.querySelectorAll('input[name="ai-model"]');

  /* ── Model info descriptions ────────────────────────── */
  const MODEL_INFO = {
    auto:         'Automatically selects the best of both EfficientNetB3 and DenseNet121 for highest accuracy.',
    efficientnet: 'EfficientNetB3 is a compound-scaled CNN achieving excellent accuracy-efficiency trade-offs for image classification.',
    densenet:     'DenseNet121 uses dense connections between layers for feature reuse, offering strong performance on medical imaging tasks.',
  };

  /* ── Mock AI insights ───────────────────────────────── */
  const INSIGHTS = {
    malignant: [
      'The irregular border and color variation in this lesion are common indicators of melanoma. Immediate consultation with a dermatologist is strongly recommended.',
      'High confidence malignancy detected. Asymmetry and uneven pigmentation are key risk factors identified by the AI models. Please seek professional evaluation promptly.',
      'The lesion exhibits features associated with basal cell carcinoma. Early treatment greatly improves outcomes. Please consult a medical professional.',
    ],
    benign: [
      'The lesion shows consistent color and smooth borders, suggesting it is benign. Continue regular skin self-examinations and schedule annual dermatology check-ups.',
      'No significant malignancy markers detected. However, monitor the lesion for any changes in size, shape, or color over time.',
      'The AI classifies this lesion as likely benign. Maintain sun-safe behaviors and use broad-spectrum SPF 30+ sunscreen daily.',
    ],
  };

  /* ── Utility: random int in [min, max] ──────────────── */
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /* ── Update sidebar model info on radio change ──────── */
  modelRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      modelInfoText.textContent = MODEL_INFO[radio.value] || '';
    });
  });

  /* ── Drag-and-drop event handlers ───────────────────── */
  ['dragenter', 'dragover'].forEach(function (evt) {
    dropZone.addEventListener(evt, function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(function (evt) {
    dropZone.addEventListener(evt, function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
    });
  });

  dropZone.addEventListener('drop', function (e) {
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file && isValidImage(file)) {
      handleFile(file);
    } else {
      showDropError();
    }
  });

  /* ── Click / keyboard on drop zone ─────────────────── */
  dropZone.addEventListener('click', function (e) {
    // Prevent double-trigger when clicking the inner button (button handles it)
    if (e.target !== uploadBtn) {
      fileInput.click();
    }
  });

  dropZone.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  uploadBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    fileInput.click();
  });

  fileInput.addEventListener('change', function () {
    const file = fileInput.files && fileInput.files[0];
    if (file && isValidImage(file)) {
      handleFile(file);
    }
    // Reset input so same file can be re-selected
    fileInput.value = '';
  });

  /* ── Validate image type ────────────────────────────── */
  function isValidImage(file) {
    return /^image\/(jpeg|png|webp)$/i.test(file.type);
  }

  /* ── Show error hint on bad file ────────────────────── */
  function showDropError() {
    dropZone.classList.add('drag-over');
    dropZone.querySelector('.drop-zone-title').textContent = '⚠️ Unsupported file type!';
    setTimeout(function () {
      dropZone.classList.remove('drag-over');
      dropZone.querySelector('.drop-zone-title').textContent = 'Drop your skin lesion image here';
    }, 2000);
  }

  /* ── Main handler: load file → show results ─────────── */
  function handleFile(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      // 1. Show image preview
      previewImg.src = e.target.result;
      fileNameDisplay.textContent = file.name;

      // 2. Scroll to results
      resultsSection.hidden = false;
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // 3. Reset UI to "pending" state
      resetResultsUI();

      // 4. Simulate AI processing delay (800 ms)
      setTimeout(function () {
        displayResults();
      }, 800);
    };

    reader.readAsDataURL(file);
  }

  /* ── Reset results to a "loading" state ─────────────── */
  function resetResultsUI() {
    diagnosisAlert.className = 'diagnosis-alert alert-pending';
    alertIcon.textContent = '⏳';
    alertTitle.textContent = 'Analyzing image…';
    alertConfidence.textContent = 'Running AI model, please wait.';

    progressBar.style.width = '0%';
    progressBar.className = 'progress-bar';
    progressPct.textContent = '0%';

    effBar.style.width = '0%';
    effPct.textContent = '—';
    denBar.style.width = '0%';
    denPct.textContent = '—';

    insightsText.textContent = 'Awaiting analysis…';

    // Collapse accordion
    accordionBody.hidden = true;
    accordionBtn.setAttribute('aria-expanded', 'false');
  }

  /* ── Simulate and display results ───────────────────── */
  function displayResults() {
    // Mock prediction: ~50 / 50 split for demo
    const isMalignant = Math.random() > 0.5;
    const label       = isMalignant ? 'Malignant' : 'Benign';

    // Overall confidence (malignant: 60–97%, benign: 70–98%)
    const confidence  = isMalignant ? randomInt(60, 97) : randomInt(70, 98);

    // Per-model values (slightly varied around overall)
    const effConf     = Math.min(99, Math.max(50, confidence + randomInt(-5, 5)));
    const denConf     = Math.min(99, Math.max(50, confidence + randomInt(-6, 6)));

    // ── Update alert box ──
    if (isMalignant) {
      diagnosisAlert.className = 'diagnosis-alert alert-malignant';
      alertIcon.textContent = '⚠️';
    } else {
      diagnosisAlert.className = 'diagnosis-alert alert-benign';
      alertIcon.textContent = '✅';
    }
    alertTitle.textContent     = 'Diagnosis: ' + label;
    alertConfidence.textContent = 'Overall Confidence: ' + confidence + '%';

    // ── Update progress bar ──
    progressBar.style.width = confidence + '%';
    progressBar.className   = 'progress-bar ' + (isMalignant ? 'bar-malignant' : 'bar-benign');
    progressPct.textContent = confidence + '%';

    // ── Update breakdown ──
    effBar.style.width = effConf + '%';
    effPct.textContent = effConf + '%';
    denBar.style.width = denConf + '%';
    denPct.textContent = denConf + '%';

    // ── Update insights ──
    insightsText.textContent = pickRandom(INSIGHTS[isMalignant ? 'malignant' : 'benign']);
  }

  /* ── Accordion toggle ───────────────────────────────── */
  accordionBtn.addEventListener('click', function () {
    const isOpen = accordionBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      accordionBody.hidden = true;
      accordionBtn.setAttribute('aria-expanded', 'false');
    } else {
      accordionBody.hidden = false;
      accordionBtn.setAttribute('aria-expanded', 'true');
    }
  });

  /* ── Reset button ───────────────────────────────────── */
  resetBtn.addEventListener('click', function () {
    resultsSection.hidden = true;
    previewImg.src = '';
    fileNameDisplay.textContent = '—';

    // Scroll back to upload area
    dropZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

})();
