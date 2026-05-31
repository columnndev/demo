/**
 * Releasy AI Dashboard & Template Hub
 * Core application logic and interactive state engine.
 */

// Freeze a deep copy of the 8 default templates so resetDemoSystem can always restore them
const DEFAULT_TEMPLATES_COUNT = 8;

// Global App State
const state = {
  // Pre-configured cases mimicking customer service scenarios
  cases: {
    1: {
      id: 1,
      name: "Sven Svensson",
      number: "840321-4412",
      type: "Totalavbrott Bredband",
      mood: "Frustrerad",
      moodClass: "negative",
      solution: "Kreditering av månadsavgift samt bokning av tekniker (tidigaste tid imorgon kl 09:00)",
      rawText: "Hej, mitt namn är Sven Svensson (840321-4412). Mitt internet har legat nere sedan imorse kl 08:00. Jag har testat att starta om routern men inga lampor lyser grönt. Jag betalar mycket pengar för detta och har missat två viktiga jobbmöten idag! Extremt missnöjd, förväntar mig kompensation samt snabb hjälp."
    },
    2: {
      id: 2,
      name: "Anna Berg",
      number: "910712-3321",
      type: "Felaktig fakturaavgift",
      mood: "Undrande",
      moodClass: "neutral",
      solution: "Kreditering av 249 kr på nästa faktura samt skriftlig bekräftelse via e-post",
      rawText: "Hej! Jag fick precis min faktura för maj månad och ser att det lagts på en extra avgift på 249 kr som heter 'Aktiveringsavgift mobil'. Jag tecknade abonnemanget under er kampanj i april där det stod att startavgiften skulle dras av. Kan ni kolla på detta och korrigera fakturan? Hälsningar, Anna Berg (kundnummer: 910712-3321)."
    },
    3: {
      id: 3,
      name: "Lars Larsson",
      number: "760905-1212",
      type: "Uppgradering till Familjeavtal",
      mood: "Positiv",
      moodClass: "positive",
      solution: "Sammanslagning till 'Releasy Family Pack', sparar 150 kr/månad. Aktiveringslänk skickad",
      rawText: "Tjena, Lars Larsson här (nummer 760905-1212). Jag och min fru har idag två separata mobilabonnemang hos er. Vi såg ert erbjudande om 'Releasy Family Pack' där man kan samla upp till 4 avtal och spara 150 kr i månaden. Hur går vi tillväga för att slå ihop våra avtal, och kan vi göra det direkt? Tack på förhand!"
    },
    4: {
      id: 4,
      name: "Per Persson",
      number: "850412-1212",
      type: "Anläggningsinflytt (Privat)",
      mood: "Positiv",
      moodClass: "positive",
      solution: "Inflytt registrerad på anläggning 735999102030405060",
      rawText: "Kund ringer in och vill göra inflytt på sin nya elanläggning privat. Namn: Per Persson, persnr: 850412-1212. Nya adressen är Storgatan 12 lägenhet 1201, anläggningsid: 735999102030405060. Datum för inflytt: 2026-06-01. Avtalstyp: Rörligt elavtal privat. Handläggarens kod: ximsgus."
    }
  },

  // CRM Extended Case queue (8 mock customers for the CRM Matris)
  crmQueue: [
    { id: 1, name: "Sven Svensson", number: "840321-4412", category: "Bredbandsavbrott", mood: "Frustrerad", moodClass: "negative", status: "Öppet", priority: "Hög" },
    { id: 2, name: "Anna Berg", number: "910712-3321", category: "Fakturafråga", mood: "Undrande", moodClass: "neutral", status: "Öppet", priority: "Medel" },
    { id: 3, name: "Lars Larsson", number: "760905-1212", category: "Avtalsuppgradering", mood: "Positiv", moodClass: "positive", status: "Öppet", priority: "Låg" },
    { id: 4, name: "Karin Ek", number: "691104-5542", category: "Uppsägning", mood: "Frustrerad", moodClass: "negative", status: "Öppet", priority: "Kritisk", rawText: "Hej! Jag vill härmed säga upp mitt abonnemang med omedelbar verkan. Er kundservice har varit under all kritik och jag har hittat ett bättre erbjudande hos en konkurrent. Hoppas ni kan bekräfta uppsägningen snabbt. Mvh Karin Ek (691104-5542)." },
    { id: 5, name: "Erik Nilsson", number: "880415-3211", category: "Teknisk support", mood: "Undrande", moodClass: "neutral", status: "Pågående", priority: "Medel", rawText: "Tjena! Mitt wifi kopplar ifrån stup i kvarten på min telefon, men på datorn funkar det fint. Har startat om allt men problemet kvarstår. Finns det någon känd bugg eller inställning man kan ändra? Erik Nilsson (880415-3211)." },
    { id: 6, name: "Maria Lind", number: "940822-1142", category: "Flyttanmälan", mood: "Positiv", moodClass: "positive", status: "Nytt", priority: "Låg", rawText: "Hej! Jag ska flytta den 1 juni och vill gärna ta med mina tjänster till min nya adress på Kungsgatan 12. Hur gör jag för att flytta mitt bredband utan att drabbas av något avbrott? Bästa hälsningar, Maria Lind (940822-1142)." },
    { id: 7, name: "Johan Bergqvist", number: "790118-2931", category: "Driftstörning", mood: "Frustrerad", moodClass: "negative", status: "Nytt", priority: "Hög", rawText: "Bredbandet har legat nere hela kvällen i hela huset! Grannarna säger samma sak. När beräknas det vara löst? Jag jobbar natt och måste ha tillgång till nätet. Svara gärna snabbt! Johan Bergqvist (790118-2931)." },
    { id: 8, name: "Sofia Holm", number: "921005-7764", category: "Beställning", mood: "Positiv", moodClass: "positive", status: "Stängd", priority: "Låg", rawText: "Hej, jag vill beställa er nya tv-box! Såg att man får den kostnadsfritt om man binder upp sig på 12 månader. Kan ni ordna det till min registrerade adress? Hälsningar Sofia Holm (921005-7764)." }
  ],

  // Templates list (including default presets)
  templates: [
    {
      id: "tmpl-1",
      name: "Support & Kompensation",
      desc: "Används vid tekniska driftavbrott eller strul",
      text: `Hej {{kund_namn}},

Tack för att du hörde av dig till oss. Jag förstår verkligen att det är frustrerande att drabbas av {{problem_typ}}, speciellt när det påverkar din arbetsdag.

Jag har undersökt ditt konto (kundnummer {{kund_nummer}}) och har genast vidtagit följande åtgärder:
- Åtgärdsförslag: {{ai_losning}}.

Vi på Releasy sätter alltid din upplevelse först och hoppas att detta löser problemet för dig. Om du har ytterligare funderingar är det bara att svara direkt på detta e-postmeddelande.

Vänliga hälsningar,
{{agent_namn}}
Releasy AI`
    },
    {
      id: "tmpl-2",
      name: "Fakturaavstämning & Kreditering",
      desc: "Används vid felaktiga debiteringar och avgifter",
      text: `Hej {{kund_namn}},

Tack för att du hör av dig till oss angående din faktura (kundnummer {{kund_nummer}}).

Jag har granskat debiteringen gällande {{problem_typ}} och ser att det blivit fel i vår systemdebitering. Jag ber så hemskt mycket om ursäkt för detta. Jag har åtgärdat det genom följande:
- Åtgärd: {{ai_losning}}.

Justeringen sker automatiskt och du behöver inte göra något mer. Vi hoppas att detta ger en bra lösning!

Ha en fantastisk dag!

Med vänliga hälsningar,
{{agent_namn}}
Releasy AI`
    },
    {
      id: "tmpl-3",
      name: "Avtalsuppgradering & Erbjudande",
      desc: "Skickas vid intresse för nya samlade avtal/sälj",
      text: `Hej {{kund_namn}}!

Vad trevligt att du hör dig angående {{problem_typ}}. Vi hjälper dig mer än gärna att spara pengar och optimera dina avtal!

Efter att ha kollat på din profil (kundnummer {{kund_nummer}}) kan jag erbjuda följande paket:
- Föreslagen lösning: {{ai_losning}}.

För att slutföra denna uppgradering har jag förberett avtalet. Du kommer inom kort få ett SMS med en säker länk för att signera med BankID.

Tack för att du väljer att samla dina tjänster hos Releasy!

Med vänliga hälsningar,
{{agent_namn}}
Releasy AI`
    },
    {
      id: "tmpl-4",
      name: "Inflyttningsbeställning (Elnät)",
      desc: "Komplex inflyttningsmall som AI:n nu fyller i per automatik",
      text: `Fullmakt: NEJ

Namn: {{kund_namn}}

Kundnummer: {{kund_nummer}}

Namn och kontaktuppgifter till den som anmält inflytt: {{kontakt_uppgifter}}

Avtalsstart: {{inflytt_datum}}

Anläggnings id: {{anlaggnings_id}}

Fakturaadress: {{adress}}

Faktureringssätt: E-faktura

Bekräftelseadress: {{epost}}

Informerat om anvisningsavtal: JA

// {{agent_namn}} KS Privat`
    },
    {
      id: "tmpl-5",
      name: "Avflyttningsbeställning (Elnät)",
      desc: "Komplex avflyttningsmall för utflytt från anläggning",
      text: `Fullmakt: NEJ

Namn: {{kund_namn}}

Kundnummer: {{kund_nummer}}

Namn och kontaktuppgifter till den som anmält avflytt: {{kontakt_uppgifter}}

Avtalsslut: {{inflytt_datum}}

Anläggnings id: {{anlaggnings_id}}

Behöver kunden ett nytt avtal? {{avtals_typ}}

Fakturaadress för slutfaktura: {{adress}}

Bekräftelseadress: {{epost}}

Informerat om att anläggningen frånkopplas 2–5 dagar efter att avtalet upphört, för villa/fritidshus finns risk för skador vid minusgrader JA

// {{agent_namn}} KS Privat

----------------------------------------------------

Bekräftelsen skickas inom 4 dagar

INFORMERA UPPSÄGNINGSTID 5 DAGAR`
    },
    {
      id: "tmpl-6",
      name: "Makulera Inflytt",
      desc: "Används vid makulering av befintlig inflyttning",
      text: `GE KUNDEN ANL ID OM DE SKA TECKNA MED ELHANDLARE
 
MAKULERA INFLYTT

Anläggningsid: {{anlaggnings_id}}

Kundnummer: {{kund_nummer}}

Orsak: Kunden ångrade sig`
    },
    {
      id: "tmpl-7",
      name: "Makulerad Avflytt (GRID_DEL)",
      desc: "Används vid makulering av avflytt via GRID_DEL",
      text: `Makulerad avflytt - GRID_DEL

Anläggningsid: {{anlaggnings_id}}

Kundnummer: {{kund_nummer}}

Handläggare: {{agent_namn}}`
    },
    {
      id: "tmpl-8",
      name: "Generell Samtalsnotering (Logg)",
      desc: "Används vid allmänna ärenden som faktura, teknisk support etc för att logga händelsen i CRM",
      text: `KUND: {{kund_namn}} ({{kund_nummer}})
ÄRENDE: {{problem_typ}}
ÅTGÄRD/NOTERING: {{ai_losning}}`
    }
  ],

  // Current selections
  selectedCaseId: 1,
  selectedTemplateId: "tmpl-1",
  agentName: "Göran Releasyson",
  agentSignatureCode: "xsimsgus ks privat",
  agentDept: "Customer Care Global",
  isGenerating: false,
  activeTab: "view-dashboard",
  lastMatchedRoutine: null,
  
  // Custom configurations (Settings)
  settings: {
    activeModel: "Releasy AI v1 Flash (Rek.)",
    temperature: 0.3,
    csatLimit: 92,
    useTypewriter: true,
    themeMode: "dark",
    themeAccent: "default"
  },
  
  // Custom structured data variables (hydrated on AI analysis)
  variables: {
    kund_namn: "Sven Svensson",
    kund_nummer: "840321-4412",
    problem_typ: "Totalavbrott Bredband",
    ai_losning: "Kreditering av månadsavgift samt bokning av tekniker (tidigaste tid imorgon kl 09:00)",
    agent_namn: "Göran Releasyson",
    
    // New utility move-in specific variables
    anlaggnings_id: "-",
    adress: "-",
    inflytt_datum: "-",
    avtals_typ: "-",
    signatur_kod: "-"
  },
  
  // Knowledge Base (RAG Data)
  knowledgeBase: [
    { sakring: "16A", avgift: "450 kr/mån", forbrukning: "10-20 000 kWh", maxEffekt: "11 kW" },
    { sakring: "20A", avgift: "590 kr/mån", forbrukning: "20 000-25 000 kWh", maxEffekt: "14 kW" },
    { sakring: "25A", avgift: "740 kr/mån", forbrukning: "25 000-30 000 kWh", maxEffekt: "17 kW" },
    { sakring: "35A", avgift: "1 130 kr/mån", forbrukning: "30 000-40 000 kWh", maxEffekt: "24 kW" },
    { sakring: "50A", avgift: "1 730 kr/mån", forbrukning: "40 000-55 000 kWh", maxEffekt: "35 kW" },
    { sakring: "63A", avgift: "2 480 kr/mån", forbrukning: "55 000-70 000 kWh", maxEffekt: "44 kW" }
  ],
  
  // Dynamic learned style profile
  styleProfile: {
    tone: 50,      // 0 = Formell, 50 = Balanserad, 100 = Vänlig
    structure: 50, // 0 = Kompakt, 50 = Normal, 100 = Detaljerad
    address: 80,   // 0 = Ni-form, 100 = Du-form
    learnedRules: [
      "🎯 Stilprofil aktiverad",
      "🇸🇪 Svensk kundservicejargong",
      "📚 Rutin-Expertis: 366/366 PDF:er",
      "⚡ Releasy AI Super-mode"
    ],
    learnedPhrases: []
  },
  lastMatchedRoutine: null,
  guideMode: "stepper", // "stepper" or "gallery"
  _currentStep: 0,
  _stepsCompleted: {} // maps "routineTitle" -> Array of booleans [false, true...]
};

// Document Elements caching
const elements = {
  // Navigation tabs links
  navLinks: document.querySelectorAll(".nav-menu a"),
  tabViews: document.querySelectorAll(".tab-view"),
  topTitleIndicator: document.getElementById("top-title-indicator"),

  // Quick Workspace Action elements
  btnClearText: document.getElementById("btn-clear-text"),
  btnLoadDemoUtflytt: document.getElementById("btn-load-demo-utflytt"),
  btnLoadDemoInflytt: document.getElementById("btn-load-demo-inflytt"),
  txtCustomerRaw: document.getElementById("txt-customer-raw"),
  btnExtractData: document.getElementById("btn-extract-data"),
  scannerVisual: document.getElementById("scanner-visual"),
  boxStructuredData: document.getElementById("box-structured-data"),
  
  // Structured Labels
  lblCName: document.getElementById("lbl-c-name"),
  lblCNum: document.getElementById("lbl-c-num"),
  lblCType: document.getElementById("lbl-c-type"),
  badgeCMood: document.getElementById("badge-c-mood"),
  lblCSol: document.getElementById("lbl-c-sol"),
  
  // New Move-in Extraction Labels in UI
  lblCAnlaggning: document.getElementById("lbl-c-anlaggning"),
  lblCAdress: document.getElementById("lbl-c-adress"),
  lblCInflyttDatum: document.getElementById("lbl-c-inflytt-datum"),
  lblCAvtalstyp: document.getElementById("lbl-c-avtalstyp"),
  lblCHandlaggare: document.getElementById("lbl-c-handlaggare"),

  // New Move-in structural rows in UI
  rowCAnlaggning: document.getElementById("row-c-anläggning"),
  rowCAdress: document.getElementById("row-c-adress"),
  rowCInflyttDatum: document.getElementById("row-c-inflytt-datum"),
  rowCAvtalstyp: document.getElementById("row-c-avtalstyp"),
  rowCHandlaggare: document.getElementById("row-c-handlaggare"),
  rowCAiSol: document.getElementById("row-c-ai-sol"),
  
  // Templates
  listTemplatesContainer: document.getElementById("list-templates-container"),
  btnTriggerModal: document.getElementById("btn-trigger-modal"),
  
  // Output and AI Copilot
  txtAiDraft: document.getElementById("txt-ai-draft"),
  outputIndicatorDot: document.getElementById("output-indicator-dot"),
  outputIndicatorText: document.getElementById("output-indicator-text"),
  txtCopilotPrompt: document.getElementById("txt-copilot-prompt"),
  btnSendPrompt: document.getElementById("btn-send-prompt"),
  chipsSuggestionsRow: document.getElementById("chips-suggestions-row"),
  btnCopyDraft: document.getElementById("btn-copy-draft"),
  btnSendEmail: document.getElementById("btn-send-email"),
  
  // Modal Elements
  modalTemplate: document.getElementById("modal-template"),
  btnCloseModal: document.getElementById("btn-close-modal"),
  btnCancelModal: document.getElementById("btn-cancel-modal"),
  btnSaveTemplate: document.getElementById("btn-save-template"),
  modalInputName: document.getElementById("modal-input-name"),
  modalInputDesc: document.getElementById("modal-input-desc"),
  modalInputText: document.getElementById("modal-input-text"),
  
  // Other visual KPI metrics
  valHandlingTime: document.getElementById("val-handling-time"),
  valCsatEst: document.getElementById("val-csat-est"),
  valActiveTemplates: document.getElementById("val-active-templates"),
  valEscalationRate: document.getElementById("val-escalation-rate"),
  kpiAutomationBar: document.getElementById("kpi-automation-bar"),
  txtAutomationPct: document.getElementById("txt-automation-pct"),
  btnResetDemo: document.getElementById("btn-reset-demo"),
  toastNotify: document.getElementById("toast-notify"),
  topDateIndicator: document.getElementById("top-date-indicator"),

  // Templates library specific elements
  txtSearchTemplates: document.getElementById("txt-search-templates"),
  btnNewTemplateLib: document.getElementById("btn-new-template-lib"),
  libTemplatesGrid: document.getElementById("lib-templates-grid"),

  // CRM Matrix elements
  txtSearchCrm: document.getElementById("txt-search-crm"),
  crmTableBody: document.getElementById("crm-table-body"),

  // Settings specific elements
  optModel1: document.getElementById("opt-model-1"),
  optModel2: document.getElementById("opt-model-2"),
  optModel3: document.getElementById("opt-model-3"),
  rngTemp: document.getElementById("rng-temp"),
  txtValTemp: document.getElementById("txt-val-temp"),
  rngCsat: document.getElementById("rng-csat"),
  txtValCsatLimit: document.getElementById("txt-val-csat-limit"),
  chkTypewriter: document.getElementById("chk-typewriter"),
  txtSettingsSignature: document.getElementById("txt-settings-signature"),
  txtSettingsDept: document.getElementById("txt-settings-dept"),
  btnSaveSettings: document.getElementById("btn-save-settings"),

  // Learned Writing Style DOM elements
  valStyleTone: document.getElementById("val-style-tone"),
  fillStyleTone: document.getElementById("fill-style-tone"),
  valStyleStructure: document.getElementById("val-style-structure"),
  fillStyleStructure: document.getElementById("fill-style-structure"),
  valStyleAddress: document.getElementById("val-style-address"),
  fillStyleAddress: document.getElementById("fill-style-address"),
  learnedRulesList: document.getElementById("learned-rules-list"),
  learnedPhrasesList: document.getElementById("learned-phrases-list"),
  btnLearnEdits: document.getElementById("btn-learn-edits"),
  btnResetStyle: document.getElementById("btn-reset-style"),
  chipSpellcheck: document.getElementById("chip-spellcheck"),
  
  // New System Guide and Lightbox Elements
  cardSystemGuide: document.getElementById("card-system-guide"),
  systemGuideTitle: document.getElementById("system-guide-title"),
  systemGuideDesc: document.getElementById("system-guide-desc"),
  systemGuideImg: document.getElementById("system-guide-img"),
  systemGuideImgContainer: document.getElementById("system-guide-img-container"),
  modalLightbox: document.getElementById("modal-lightbox"),
  lightboxImg: document.getElementById("lightbox-img"),
  lightboxCaption: document.getElementById("lightbox-caption"),
  lightboxCounter: document.getElementById("lightbox-counter"),
  lightboxPrev: document.getElementById("lightbox-prev"),
  lightboxNext: document.getElementById("lightbox-next"),
  btnCloseLightbox: document.getElementById("btn-close-lightbox"),
  
  // Custom Stepper DOM elements
  guideModeStepperBtn: document.getElementById("guide-mode-stepper-btn"),
  guideModeGalleryBtn: document.getElementById("guide-mode-gallery-btn"),
  stepperProgressBox: document.getElementById("stepper-progress-box"),
  stepperProgressText: document.getElementById("stepper-progress-text"),
  stepperProgressPct: document.getElementById("stepper-progress-pct"),
  stepperProgressBar: document.getElementById("stepper-progress-bar"),
  stepperStepsList: document.getElementById("stepper-steps-list"),
  stepperCelebrationOverlay: document.getElementById("stepper-celebration-overlay"),
  btnCloseCelebration: document.getElementById("btn-close-celebration"),
  
  // Upgraded PDF screenshots tabs and container Elements
  routineViewerPlaceholder: document.getElementById("routine-viewer-placeholder"),
  routineViewerIframeContainer: document.getElementById("routine-viewer-iframe-container"),
  routineViewerImagesContainer: document.getElementById("routine-viewer-images-container"),
  routineTabsRow: document.getElementById("routine-tabs-row"),
  btnRoutinePdfTab: document.getElementById("btn-routine-pdf-tab"),
  btnRoutineImgTab: document.getElementById("btn-routine-img-tab"),
  routineImgCount: document.getElementById("routine-img-count")
};

// =========================================================================
// VISUAL APPEARANCE & THEME ENGINE
// =========================================================================

// Initialize visual theme and accent color from localStorage
function initTheme() {
  const savedMode = localStorage.getItem("releasy_theme_mode") || "dark";
  const savedAccent = localStorage.getItem("releasy_theme_accent") || "default";
  
  state.settings.themeMode = savedMode;
  state.settings.themeAccent = savedAccent;
  
  applyThemeToBody();
}

// Apply CSS classes to document body based on state settings
function applyThemeToBody() {
  const body = document.body;
  
  // Toggle dark/light mode
  if (state.settings.themeMode === "light") {
    body.classList.add("light-mode");
  } else {
    body.classList.remove("light-mode");
  }
  
  // Clean theme classes
  body.classList.remove("theme-cyan", "theme-emerald", "theme-sunset", "theme-gold");
  
  // Apply active accent theme
  if (state.settings.themeAccent !== "default") {
    body.classList.add(`theme-${state.settings.themeAccent}`);
  }
  
  // Update theme settings UI selection states
  syncThemeUI();
}

// Sync settings panel buttons and presets indicators to reflect active state settings
function syncThemeUI() {
  // 1. Sync segmented mode controls
  const modeSegmented = document.getElementById("theme-mode-segmented");
  if (modeSegmented) {
    const buttons = modeSegmented.querySelectorAll(".btn-segment");
    buttons.forEach(btn => {
      const mode = btn.getAttribute("data-mode");
      if (mode === state.settings.themeMode) {
        btn.classList.add("active");
        btn.style.color = "#ffffff";
      } else {
        btn.classList.remove("active");
        btn.style.color = "";
      }
    });
  }
  
  // 2. Sync accent color presets dots
  const accentGrid = document.getElementById("theme-accent-grid");
  if (accentGrid) {
    const buttons = accentGrid.querySelectorAll(".theme-color-btn");
    buttons.forEach(btn => {
      const theme = btn.getAttribute("data-theme");
      if (theme === state.settings.themeAccent) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }
}

// INITIALIZATION
window.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setupEventListeners();
  
  // Start with empty message boxes for a blank canvas on load
  elements.txtCustomerRaw.value = "";
  elements.txtAiDraft.textContent = "";

  // Reset state variables to blank/placeholder values
  state.selectedCaseId = null;
  state.variables.kund_namn = "-";
  state.variables.kund_nummer = "-";
  state.variables.problem_typ = "-";
  state.variables.ai_losning = "-";
  state.variables.anlaggnings_id = "-";
  state.variables.adress = "-";
  state.variables.inflytt_datum = "-";
  state.variables.avtals_typ = "-";
  state.variables.signatur_kod = state.agentSignatureCode;

  // Reset Structured UI Labels
  elements.lblCName.textContent = "-";
  elements.lblCNum.textContent = "-";
  if (elements.lblCType) elements.lblCType.textContent = "-";
  elements.lblCSol.textContent = "-";
  if (elements.lblCAnlaggning) elements.lblCAnlaggning.textContent = "-";
  if (elements.lblCAdress) elements.lblCAdress.textContent = "-";
  if (elements.lblCInflyttDatum) elements.lblCInflyttDatum.textContent = "-";
  if (elements.lblCAvtalstyp) elements.lblCAvtalstyp.textContent = "-";
  if (elements.lblCHandlaggare) elements.lblCHandlaggare.textContent = "-";
  
  if (elements.badgeCMood) {
    elements.badgeCMood.className = "sentiment-badge neutral";
    elements.badgeCMood.textContent = "-";
  }

  // Hide move-in/move-out specific rows in dashboard by default
  if (elements.rowCAnlaggning) elements.rowCAnlaggning.style.display = "none";
  if (elements.rowCAdress) elements.rowCAdress.style.display = "none";
  if (elements.rowCInflyttDatum) elements.rowCInflyttDatum.style.display = "none";
  if (elements.rowCAvtalstyp) elements.rowCAvtalstyp.style.display = "none";
  if (elements.rowCHandlaggare) elements.rowCHandlaggare.style.display = "none";
  if (elements.rowCAiSol) elements.rowCAiSol.style.display = "flex";

  renderTemplatesList();
  updateTopDate();
  
  // Set initial avatar initials dynamically
  document.querySelectorAll(".avatar").forEach(a => {
    a.textContent = state.agentName ? state.agentName.trim().charAt(0).toUpperCase() : "R";
  });
  
  // Load templates & CRM sub-systems
  renderTemplatesLibrary();
  renderCrmTable();
  
  // Load Routines
  renderRoutinesLibrary();

  // Initialize and render learned style profile UI
  updateStyleProfileUI();

  // Initialize view states
  switchTab("view-dashboard");

  // Start automation progress bar animation
  setTimeout(() => {
    elements.kpiAutomationBar.style.width = "84%";
  }, 300);
});

// Event Listeners Registration
function setupEventListeners() {
  // --- 1. Sidebar Tab Switching ---
  elements.navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetView = link.getAttribute("data-target");
      if (!targetView) return;
      switchTab(targetView);
    });
  });

  // Setup Quick Action click handlers
  elements.btnClearText.addEventListener("click", () => {
    elements.txtCustomerRaw.value = "";
    
    // Reset state variables
    state.variables.kund_namn = "-";
    state.variables.kund_nummer = "-";
    state.variables.problem_typ = "-";
    state.variables.ai_losning = "-";
    state.variables.anlaggnings_id = "-";
    state.variables.adress = "-";
    state.variables.inflytt_datum = "-";
    state.variables.avtals_typ = "-";
    state.variables.signatur_kod = state.agentSignatureCode;
    
    // Reset Structured UI Labels
    elements.lblCName.textContent = "-";
    elements.lblCNum.textContent = "-";
    if (elements.lblCType) elements.lblCType.textContent = "-";
    elements.lblCSol.textContent = "-";
    elements.lblCAnlaggning.textContent = "-";
    elements.lblCAdress.textContent = "-";
    elements.lblCInflyttDatum.textContent = "-";
    elements.lblCAvtalstyp.textContent = "-";
    elements.lblCHandlaggare.textContent = "-";
    
    elements.txtAiDraft.textContent = "Skriv eller klistra in en samtalsnotering till vänster och klicka på 'Analysera' för att generera en sammanfattning och systemmall.";
    showToast("Fälten har rensats! Skriv eller klistra in fritt. 🧹");
  });

  elements.btnLoadDemoUtflytt.addEventListener("click", () => {
    elements.txtCustomerRaw.value = "Matilda Johansson tel: 0733-455222 anl 735123456789012345 adress Snesgatan 8 vill göra utflytt 2026-06-15 och inte teckna nytt. Handläggarens kod: ximsgus.";
    showToast("Testexempel Utflytt inladdat! 📋");
    setTimeout(runAiExtraction, 300);
  });

  elements.btnLoadDemoInflytt.addEventListener("click", () => {
    elements.txtCustomerRaw.value = "Kund ringer in och vill göra inflytt på sin nya elanläggning privat. Namn: Per Persson, persnr: 850412-1212. Nya adressen är Storgatan 12 lägenhet 1201, anläggningsid: 735999102030405060. Datum för inflytt: 2026-06-01. Avtalstyp: Rörligt elavtal privat. Handläggarens kod: ximsgus.";
    showToast("Testexempel Inflytt inladdat! 📋");
    setTimeout(runAiExtraction, 300);
  });

  const btnLoadDemoFelanmalan = document.getElementById("btn-load-demo-felanmalan");
  if (btnLoadDemoFelanmalan) {
    btnLoadDemoFelanmalan.addEventListener("click", () => {
      elements.txtCustomerRaw.value = "Johan Bergqvist 790118-2931 ringer in och säger att hela huset är utan ström sedan igår kväll kl 20. Grannarna på samma servis är också drabbade. Kund är extremt frustrerad och kräver besked om när det är löst. Anläggningsid: 735200340050067080. Adress: Ekvägen 14. Handläggarens kod: ximsgus.";
      showToast("Testexempel Felanmälan inladdat! ⚡");
      setTimeout(runAiExtraction, 300);
    });
  }

  const btnLoadDemoKreditering = document.getElementById("btn-load-demo-kreditering");
  if (btnLoadDemoKreditering) {
    btnLoadDemoKreditering.addEventListener("click", () => {
      elements.txtCustomerRaw.value = "Anna Berg 910712-3321 ringer ang faktura för maj. Hon ser en extra avgift på 249 kr kallad 'Aktiveringsavgift mobil'. Kampanjen hon tecknade sig på i april lovade att startavgiften drogs av. Kunden vill ha kreditering av avgiften. Handläggarens kod: ximsgus.";
      showToast("Testexempel Kreditering inladdat! 💳");
      setTimeout(runAiExtraction, 300);
    });
  }

  const btnLoadDemoAvbetalning = document.getElementById("btn-load-demo-avbetalning");
  if (btnLoadDemoAvbetalning) {
    btnLoadDemoAvbetalning.addEventListener("click", () => {
      elements.txtCustomerRaw.value = "Erik Nilsson 880415-3211 har en faktura på 3200 kr som förfaller 2026-06-15. Kunden har tillfälligt betalningssvårigheter och undrar om de kan dela upp betalningen på 2-3 månader. Vill ha avbetalningsplan. Handläggarens kod: ximsgus.";
      showToast("Testexempel Avbetalning inladdat! 📋");
      setTimeout(runAiExtraction, 300);
    });
  }

  // Extract Data button
  elements.btnExtractData.addEventListener("click", () => {
    runAiExtraction();
  });

  // Variables Helper click triggers in main dashboard
  document.querySelectorAll(".variables-helper .var-badge").forEach(badge => {
    badge.addEventListener("click", (e) => {
      const variable = e.target.getAttribute("data-var");
      showToast(`Kopierade variabel: ${variable}`);
      navigator.clipboard.writeText(variable);
    });
  });

  // Prompt Chat handlers
  elements.btnSendPrompt.addEventListener("click", () => {
    handleAiPromptCommand();
  });

  elements.txtCopilotPrompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleAiPromptCommand();
    }
  });

  // Dynamic chips – event delegation (works with dynamically inserted chips)
  elements.chipsSuggestionsRow.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    
    // Handle analyze action
    if (chip.getAttribute("data-action") === "analyze") {
      runAiExtraction();
      return;
    }
    
    const promptText = chip.getAttribute("data-prompt");
    if (!promptText) return;
    
    // Smart context: For meta-commands ("Sök rutin", "Hur gör jag"), combine with user's own text
    const isMetaCommand = promptText === "Hur gör jag" || promptText === "Sök rutin";
    
    if (isMetaCommand) {
      // Check if the user already typed something in the copilot input
      const existingInput = elements.txtCopilotPrompt.value.trim();
      // Or use the customer raw text as context
      const rawText = elements.txtCustomerRaw ? elements.txtCustomerRaw.value.trim() : "";
      
      if (existingInput) {
        // User typed something – use it as the search query with "hur" prefix for RAG trigger
        elements.txtCopilotPrompt.value = "hur " + existingInput;
      } else if (rawText && rawText.length > 3) {
        // No copilot input, but there's customer text – use that
        elements.txtCopilotPrompt.value = "hur " + rawText.substring(0, 100);
      } else {
        // Nothing typed – just focus the input so user can type
        elements.txtCopilotPrompt.value = "";
        elements.txtCopilotPrompt.placeholder = "Skriv din fråga här, t.ex. 'hur tar jag bort påminnelseavgift'...";
        elements.txtCopilotPrompt.focus();
        return; // Don't send an empty prompt
      }
    } else {
      elements.txtCopilotPrompt.value = promptText;
    }
    
    handleAiPromptCommand();
  });

  // Initialize dynamic chips based on current editor content
  updateDynamicChips();
  
  // Watch the editor for content changes to update chips contextually
  const editorObserver = new MutationObserver(() => {
    clearTimeout(state._chipDebounce);
    state._chipDebounce = setTimeout(() => updateDynamicChips(), 400);
  });
  editorObserver.observe(elements.txtAiDraft, { childList: true, subtree: true, characterData: true });

  // Copy draft button
  if (elements.btnCopyDraft) {
    elements.btnCopyDraft.addEventListener("click", () => {
      copyDraftToClipboard();
    });
  }

  // Send Email simulated stängning
  if (elements.btnSendEmail) {
    elements.btnSendEmail.addEventListener("click", () => {
      showToast("📧 Samtalsmall kopierad och ärendet registrerat i CRM!");
      animateKpiSuccess();
    });
  }

  // Reset Demo Button
  elements.btnResetDemo.addEventListener("click", () => {
    resetDemoSystem();
  });

  // Modal handlers
  elements.btnTriggerModal.addEventListener("click", () => {
    openModal();
  });
  elements.btnNewTemplateLib.addEventListener("click", () => {
    openModal();
  });

  elements.btnCloseModal.addEventListener("click", closeModal);
  elements.btnCancelModal.addEventListener("click", closeModal);
  elements.btnSaveTemplate.addEventListener("click", saveCustomTemplate);

  const btnGenerateMagic = document.getElementById("btn-generate-magic");
  if (btnGenerateMagic) {
    btnGenerateMagic.addEventListener("click", generateTemplateWithAi);
  }

  // Modal variable badges click listener
  document.querySelectorAll(".modal-badge").forEach(badge => {
    badge.addEventListener("click", (e) => {
      const tag = e.target.getAttribute("data-var");
      const textInput = elements.modalInputText;
      const startPos = textInput.selectionStart;
      const endPos = textInput.selectionEnd;
      
      textInput.value = textInput.value.substring(0, startPos)
        + tag
        + textInput.value.substring(endPos, textInput.value.length);
      
      textInput.focus();
      textInput.selectionStart = startPos + tag.length;
      textInput.selectionEnd = startPos + tag.length;
    });
  });

  // --- 2. Upgraded Template Library search filter ---
  elements.txtSearchTemplates.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    renderTemplatesLibrary(query);
  });

  // --- 3. Upgraded CRM Matrix search filter ---
  elements.txtSearchCrm.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    renderCrmTable(query);
  });

  // --- 4. Upgraded Settings triggers ---
  // Model selector options
  const models = [
    { btn: elements.optModel1, name: "Releasy AI v1 Flash (Rek.)" },
    { btn: elements.optModel2, name: "Releasy AI v1 Pro" },
    { btn: elements.optModel3, name: "Releasy AI v2 Finetuned" }
  ];
  models.forEach(m => {
    m.btn.addEventListener("click", () => {
      models.forEach(item => item.btn.classList.remove("active"));
      m.btn.classList.add("active");
      state.settings.activeModel = m.name;
      showToast(`Bytte AI Modell till: ${m.name}`);
    });
  });

  // Sliders Binders
  elements.rngTemp.addEventListener("input", (e) => {
    state.settings.temperature = parseFloat(e.target.value);
    elements.txtValTemp.textContent = e.target.value;
  });
  elements.rngCsat.addEventListener("input", (e) => {
    state.settings.csatLimit = parseInt(e.target.value);
    elements.txtValCsatLimit.textContent = `${e.target.value}%`;
  });

  // Toggles Binders
  elements.chkTypewriter.addEventListener("change", (e) => {
    state.settings.useTypewriter = e.target.checked;
  });

  // Signature Save Binders
  elements.btnSaveSettings.addEventListener("click", () => {
    state.agentName = elements.txtSettingsSignature.value.trim() || "Göran Releasyson";
    state.agentDept = elements.txtSettingsDept.value.trim() || "Customer Care Global";
    
    const sigInput = document.getElementById("txt-settings-sig-code");
    if (sigInput) {
      state.agentSignatureCode = sigInput.value.trim();
    }
    
    state.variables.agent_namn = state.agentName;
    state.variables.signatur_kod = state.agentSignatureCode;
    
    // Update profile widgets
    document.querySelectorAll(".profile-name").forEach(n => n.textContent = state.agentName);
    document.querySelectorAll(".profile-role").forEach(r => r.textContent = state.agentDept);
    document.querySelectorAll(".avatar").forEach(a => {
      a.textContent = state.agentName ? state.agentName.trim().charAt(0).toUpperCase() : "R";
    });
    
    // Update live metadata field
    if (elements.lblCHandlaggare) elements.lblCHandlaggare.textContent = state.agentName;
    
    compileActiveTemplate();
    switchTab("view-dashboard");
    showToast("Inställningar och signatur har sparats! 💾");
  });

  // --- 5. Learned Writing Style Engine listeners ---
  if (elements.btnLearnEdits) {
    elements.btnLearnEdits.addEventListener("click", () => {
      learnStyleFromManualEdits();
    });
  }

  if (elements.btnResetStyle) {
    elements.btnResetStyle.addEventListener("click", () => {
      resetStyleProfile();
    });
  }

  if (elements.chipSpellcheck) {
    elements.chipSpellcheck.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const corrected = runGrammarCorrection();
      if (corrected) {
        showToast("Rättade skrivfel och stavfel i utkastet! ✍️");
      } else {
        showToast("Inga uppenbara skrivfel hittades i utkastet. 👍");
      }
    });
  }

  // --- 6. Visual Theme & Color Preset Accent Event Listeners ---
  const modeSegmented = document.getElementById("theme-mode-segmented");
  if (modeSegmented) {
    const buttons = modeSegmented.querySelectorAll(".btn-segment");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-mode");
        state.settings.themeMode = mode;
        localStorage.setItem("releasy_theme_mode", mode);
        applyThemeToBody();
        showToast(`Växlade till ${mode === "light" ? "Ljust" : "Mörkt"} läge! 🎨`);
      });
    });
  }

  const accentGrid = document.getElementById("theme-accent-grid");
  if (accentGrid) {
    const buttons = accentGrid.querySelectorAll(".theme-color-btn");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const theme = btn.getAttribute("data-theme");
        state.settings.themeAccent = theme;
        localStorage.setItem("releasy_theme_accent", theme);
        applyThemeToBody();
        
        let themeNameText = "Standard";
        if (theme === "cyan") themeNameText = "Cyber Cyan";
        if (theme === "emerald") themeNameText = "Nordic Emerald";
        if (theme === "sunset") themeNameText = "Crimson Sunset";
        if (theme === "gold") themeNameText = "Amber Gold";
        
        showToast(`Färgaccent ändrad till ${themeNameText}! ✨`);
      });
    });
  }

  // --- 8. Lightbox Carousel & System Guide Events ---
  
  // Carousel state
  state.lightboxImages = []; // Array of {src, caption}
  state.lightboxIndex = 0;
  
  function openLightboxCarousel(images, startIndex) {
    state.lightboxImages = images;
    state.lightboxIndex = startIndex || 0;
    updateLightboxSlide();
    elements.modalLightbox.classList.add("active");
    elements.modalLightbox.style.display = "flex";
  }
  
  function updateLightboxSlide() {
    const img = state.lightboxImages[state.lightboxIndex];
    if (!img) return;
    
    // Smooth transition
    elements.lightboxImg.style.opacity = "0";
    setTimeout(() => {
      elements.lightboxImg.src = img.src;
      elements.lightboxCaption.textContent = img.caption;
      elements.lightboxImg.style.opacity = "1";
    }, 150);
    
    // Show/hide navigation buttons
    const hasMultiple = state.lightboxImages.length > 1;
    if (elements.lightboxPrev) {
      elements.lightboxPrev.style.display = hasMultiple ? "flex" : "none";
    }
    if (elements.lightboxNext) {
      elements.lightboxNext.style.display = hasMultiple ? "flex" : "none";
    }
    
    // Update counter
    if (elements.lightboxCounter) {
      if (hasMultiple) {
        elements.lightboxCounter.textContent = `${state.lightboxIndex + 1} / ${state.lightboxImages.length}`;
        elements.lightboxCounter.style.display = "block";
      } else {
        elements.lightboxCounter.style.display = "none";
      }
    }
  }
  
  function lightboxNavigate(direction) {
    if (state.lightboxImages.length <= 1) return;
    state.lightboxIndex = (state.lightboxIndex + direction + state.lightboxImages.length) % state.lightboxImages.length;
    updateLightboxSlide();
  }
  
  function closeLightbox() {
    elements.modalLightbox.classList.remove("active");
    setTimeout(() => {
      elements.modalLightbox.style.display = "none";
    }, 250);
  }
  
  // Make openLightboxCarousel accessible globally for routine image clicks
  window._openLightboxCarousel = openLightboxCarousel;
  
  // System guide image click → open carousel with all routine images if available
  if (elements.systemGuideImgContainer) {
    elements.systemGuideImgContainer.addEventListener("click", () => {
      const src = elements.systemGuideImg.src;
      if (!src) return;
      
      // Open carousel at the currently browsed thumbnail index
      if (state.lastMatchedRoutine && routineImagesDb[state.lastMatchedRoutine.title]) {
        const routineData = routineImagesDb[state.lastMatchedRoutine.title];
        const images = routineData.images.map(img => ({ src: img.path, caption: img.caption }));
        openLightboxCarousel(images, state._guideImageIndex || 0);
      } else {
        const title = elements.systemGuideTitle.textContent;
        openLightboxCarousel([{ src, caption: title }], 0);
      }
    });
  }

  // Prev/Next button clicks
  if (elements.lightboxPrev) {
    elements.lightboxPrev.addEventListener("click", (e) => { e.stopPropagation(); lightboxNavigate(-1); });
  }
  if (elements.lightboxNext) {
    elements.lightboxNext.addEventListener("click", (e) => { e.stopPropagation(); lightboxNavigate(1); });
  }

  // Close lightbox on overlay click or close button
  if (elements.modalLightbox) {
    elements.modalLightbox.addEventListener("click", (e) => {
      if (e.target === elements.modalLightbox || e.target === elements.btnCloseLightbox) {
        closeLightbox();
      }
    });
  }

  // Keyboard navigation for carousel
  window.addEventListener("keydown", (e) => {
    if (!elements.modalLightbox || !elements.modalLightbox.classList.contains("active")) return;
    
    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      lightboxNavigate(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      lightboxNavigate(1);
    }
  });

  // --- 9. Routine Viewer Tab Swapping Events ---
  if (elements.btnRoutinePdfTab && elements.btnRoutineImgTab) {
    elements.btnRoutinePdfTab.addEventListener("click", () => {
      elements.btnRoutinePdfTab.classList.add("active");
      elements.btnRoutineImgTab.classList.remove("active");
      if (elements.routineViewerIframeContainer) {
        elements.routineViewerIframeContainer.style.display = "block";
      }
      if (elements.routineViewerImagesContainer) {
        elements.routineViewerImagesContainer.style.display = "none";
      }
    });

    elements.btnRoutineImgTab.addEventListener("click", () => {
      elements.btnRoutineImgTab.classList.add("active");
      elements.btnRoutinePdfTab.classList.remove("active");
      if (elements.routineViewerIframeContainer) {
        elements.routineViewerIframeContainer.style.display = "none";
      }
      if (elements.routineViewerImagesContainer) {
        elements.routineViewerImagesContainer.style.display = "block";
      }
    });
  }

  // --- 10. Stepper Guide Mode & Stepper Controller Events ---
  if (elements.guideModeStepperBtn) {
    elements.guideModeStepperBtn.addEventListener("click", () => {
      setGuideMode("stepper");
    });
  }
  if (elements.guideModeGalleryBtn) {
    elements.guideModeGalleryBtn.addEventListener("click", () => {
      setGuideMode("gallery");
    });
  }
  // Note: Stepper checklist row checkboxes, image lightbox click handlers, and slutför buttons are dynamically bound inside updateStepperUI
  if (elements.btnCloseCelebration) {
    elements.btnCloseCelebration.addEventListener("click", () => {
      if (elements.stepperCelebrationOverlay) {
        elements.stepperCelebrationOverlay.classList.remove("active");
        const innerCard = elements.stepperCelebrationOverlay.querySelector(".glass");
        if (innerCard) {
          innerCard.style.transform = "scale(0.9)";
        }
        setTimeout(() => {
          elements.stepperCelebrationOverlay.style.display = "none";
        }, 250);
      }
      
      // Auto-trigger copy layout and draft copy as secondary rewards!
      if (state.lastMatchedRoutine) {
        copyDraftToClipboard();
      }
    });
  }
}

// Tab switcher SPA controller
function switchTab(viewId) {
  state.activeTab = viewId;
  
  // Toggle views
  elements.tabViews.forEach(v => {
    if (v.id === viewId) {
      v.style.display = "flex";
    } else {
      v.style.display = "none";
    }
  });

  // Toggle active sidebar highlight
  elements.navLinks.forEach(link => {
    if (link.getAttribute("data-target") === viewId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Dynamic header text update
  let headerText = "Releasy Dashboard";
  if (viewId === "view-templates") headerText = "Svarsmallar Bibliotek";
  if (viewId === "view-matrix") headerText = "Kundanlytisk Ärendematris (CRM)";
  if (viewId === "view-settings") headerText = "System & Releasy AI Inställningar";
  elements.topTitleIndicator.textContent = headerText;
}

// Load Case Preset into State and UI Textarea
function loadCase(caseId) {
  // Hide guide card when loading a new case
  if (elements.cardSystemGuide) {
    elements.cardSystemGuide.style.display = "none";
  }

  state.selectedCaseId = caseId;
  const currentCase = state.cases[caseId] || state.crmQueue.find(c => c.id === caseId);
  if (!currentCase) return;

  const rawText = currentCase.rawText || state.cases[1].rawText;
  elements.txtCustomerRaw.value = rawText;
  
  // Gentle border glow loading feedback
  elements.txtCustomerRaw.style.borderColor = "rgba(59, 130, 246, 0.4)";
  setTimeout(() => {
    elements.txtCustomerRaw.style.borderColor = "var(--border-light)";
  }, 500);

  // Auto-selection of best template matches for demo
  if (caseId === 1 || caseId === 5 || caseId === 7) selectTemplate("tmpl-1");
  else if (caseId === 2) selectTemplate("tmpl-2");
  else if (caseId === 3 || caseId === 6 || caseId === 8) selectTemplate("tmpl-3");
  else if (caseId === 4) selectTemplate("tmpl-4");
}

// Run Scanning & AI Extraction simulation
function runAiExtraction() {
  state.lastMatchedRoutine = null;
  if (state.isGenerating) return;
  
  const rawText = elements.txtCustomerRaw.value.trim();
  if (!rawText) {
    showToast("⚠️ Skriv eller klistra in en samtalsanteckning först!");
    return;
  }
  
  // Show scanner overlay
  elements.scannerVisual.classList.add("active");
  
  setTimeout(() => {
    let extracted = {
      name: "Kund",
      number: "-",
      type: "Allmänt supportärende",
      solution: "Utredning påbörjad",
      mood: "Undrande",
      moodClass: "neutral"
    };

    // Enhanced Case Detection Intent Engine
    const textLower = rawText.toLowerCase();
    
    // Comprehensive Utflytt (Move-out) signals
    const utflyttKeywords = [
      "utflytt", "flytta ut", "flyttar ut", "säga upp", "säger upp", 
      "avsluta avtal", "avsluta el", "avregistrera", "lämna lägenhet", 
      "flyttar från", "uppsägning", "inte teckna nytt", "inte tecknat nytt",
      "ej teckna", "flytta utflytt"
    ];
    
    // Comprehensive Inflytt (Move-in) signals
    const inflyttKeywords = [
      "inflytt", "flytta in", "flyttar in", "teckna nytt", "teckna elavtal", 
      "starta avtal", "nytt avtal", "flyttar till", "tillträde", "nyinflyttad",
      "anläggningsid", "anläggnings-id", "anl"
    ];
    
    let utflyttScore = 0;
    let inflyttScore = 0;
    
    utflyttKeywords.forEach(kw => {
      if (textLower.includes(kw)) utflyttScore += 2;
    });
    
    inflyttKeywords.forEach(kw => {
      if (textLower.includes(kw)) inflyttScore += 2;
    });
    
    // Additional situational weight
    if (textLower.includes("inte teckna") || textLower.includes("ej nytt") || textLower.includes("inte ha nytt") || textLower.includes("ej teckna nytt")) {
      utflyttScore += 3;
    }
    
    const isMakuleradInflytt = textLower.includes("makulera inflytt") || (textLower.includes("makulera") && inflyttScore > 0);
    const isMakuleradUtflytt = textLower.includes("makulerad avflytt") || textLower.includes("grid_del") || (textLower.includes("makulera") && utflyttScore > 0);
    
    const isUtflytt = !isMakuleradUtflytt && (utflyttScore > inflyttScore && utflyttScore > 0);
    const isInflytt = !isMakuleradInflytt && !isUtflytt && (inflyttScore > 0 || textLower.includes("anläggning"));

    // 1. Extract Name
    // Look at first word or keywords
    const firstWord = rawText.split(/\s+/)[0];
    const excludedFirstWords = ["kund", "handläggare", "nummer", "hej", "tjena", "samtal", "notering", "info", "ärende", "här", "mitt", "namn", "hallo", "hallå", "läs", "laddar"];
    if (firstWord && /^[A-ZÅÄÖa-zåäö]+$/.test(firstWord) && !excludedFirstWords.includes(firstWord.toLowerCase())) {
      extracted.name = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
    } else {
      extracted.name = parseValueByKeywords(rawText, ["namn", "heter", "namn är", "här", "kund:"], "Ej angivet");
    }

    // 2b. Extract Phone number FIRST (before SSN, to avoid confusing them)
    // Matches Swedish mobiles: 07x-xxxxxxx, +467x..., and landlines 0x-xxxxxx
    const phoneRegex = /\b(?:\+46|0)[- ]?(?:7\d(?:[- ]?\d){7}|\d{1,3}[- ]?\d{5,8})\b/;
    const phoneMatch = rawText.match(phoneRegex);
    state.variables.telefon = phoneMatch ? phoneMatch[0] : "";

    // 2. Extract SSN / Personnummer — must be 10-12 digits in YYMMDD(-)XXXX format or 12-digit
    // Exclude strings that look like phone numbers (start with 07/+46/08 etc.)
    const rawForSsn = phoneMatch ? rawText.replace(phoneMatch[0], "PHONE") : rawText;
    const ssnRegex = /\b(?:19|20)\d{6}[-]?\d{4}\b|\b\d{6}[-]\d{4}\b|\b(?:19|20)\d{10}\b/;
    const ssnMatch = rawForSsn.match(ssnRegex);
    extracted.number = ssnMatch ? ssnMatch[0] : "Ej angivet";

    // 2c. Extract Email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const emailMatch = rawText.match(emailRegex);
    state.variables.epost = emailMatch ? emailMatch[0] : "Ej angivet";

    // Create aggregated contact info
    state.variables.kontakt_uppgifter = `${extracted.name} ${state.variables.telefon}`.trim();

    // 3. Evaluate Mood
    extracted.mood = evaluateMoodHeuristics(rawText);
    extracted.moodClass = extracted.mood === "Frustrerad" ? "negative" : (extracted.mood === "Positiv" ? "positive" : "neutral");

    // 4. Case type & specific values
    
    // Global anläggnings-id extraction logic
    const anlRegex = /735\d{15}|\b\d{18}\b|(?:anl|anläggning|anläggningsid|anläggnings-id)\s*[:\s]*(\d+)/i;
    const anlMatch = rawText.match(anlRegex);
    if (anlMatch) {
      state.variables.anlaggnings_id = anlMatch[0].includes("anl") ? anlMatch[1] : anlMatch[0];
    } else {
      state.variables.anlaggnings_id = "735999102030405060";
    }

    // Global address extraction logic
    const adressRegex = /(?:adress|leveransadress|gatan|vägen)\s*[:\s]*([A-Za-zåäöÅÄÖ\s]+\d+(?:\s+lägenhet\s+\d+)?)/i;
    const adressMatch = rawText.match(adressRegex);
    if (adressMatch) {
      let addr = adressMatch[1].trim();
      addr = addr.replace(/\s+(?:vill|ska|gö|göra|för|till|från|är|datum|anl)\b.*/i, '');
      state.variables.adress = addr.charAt(0).toUpperCase() + addr.slice(1);
    } else {
      state.variables.adress = parseValueByKeywords(rawText, ["adressen är", "adress:", "adress"], "Snesgatan 8");
    }

    // Global date extraction
    const dateRegex = /\b\d{4}-\d{2}-\d{2}\b/;
    const dateMatch = rawText.match(dateRegex);
    state.variables.inflytt_datum = dateMatch ? dateMatch[0] : "2026-06-01";

    if (isUtflytt) {
      extracted.type = "Avflyttningsbeställning";
      extracted.solution = "Avregistrering inlagd i elnätet";
      
      // Extract avtalsstatus
      if (rawText.toLowerCase().includes("inte teckna nytt") || rawText.toLowerCase().includes("ej nytt") || rawText.toLowerCase().includes("inte tecknat nytt") || rawText.toLowerCase().includes("inte ha nytt") || rawText.toLowerCase().includes("nej")) {
        state.variables.avtals_typ = "NEJ (Uppsagt / Inte tecknat nytt)";
      } else {
        state.variables.avtals_typ = parseValueByKeywords(rawText, ["avtalstyp:", "avtalstyp", "avtal:", "status:", "nytt avtal?"], "NEJ (Uppsagt / Inte tecknat nytt)");
      }

    } else if (isInflytt) {
      extracted.type = "Inflyttningsbeställning (Privat)";
      extracted.solution = "Inflytt registrerad på anläggning";

      // Extract Avtalstyp
      state.variables.avtals_typ = parseValueByKeywords(rawText, ["avtalstyp:", "avtalstyp", "avtal:"], "Rörligt elavtal privat");

    } else if (isMakuleradInflytt) {
      extracted.type = "Makulera Inflytt";
      extracted.solution = "Inflytt har makulerats från systemet";

    } else if (isMakuleradUtflytt) {
      extracted.type = "Makulerad Avflytt";
      extracted.solution = "Avflytt har makulerats från systemet";

    } else {
      // Smart detection of custom issue types from Swedish free-text notes
      let detectedType = "";
      const textLower = rawText.toLowerCase();
      
      if (textLower.includes("strömavbrott") || (textLower.includes("ström") && textLower.includes("avbrott")) || textLower.includes("ingen el") || textLower.includes("utan ström") || (textLower.includes("el") && textLower.includes("nere"))) {
        detectedType = "Strömavbrott / Felanmälan";
        extracted.solution = "Felanmälan registrerad i BOSSE. Driftcentralen kontaktad och tekniker tillkallad.";
        extracted.mood = extracted.mood === "Undrande" ? "Frustrerad" : extracted.mood;
      } else if (textLower.includes("avbetalning") || textLower.includes("avbetalningsplan") || textLower.includes("dela upp") || textLower.includes("betalningssvårigheter")) {
        detectedType = "Avbetalningsplan / Betalningsstöd";
        extracted.solution = "Avbetalningsplan registrerad i CRM. Kunden informerad om villkor och uppläggningsavgift.";
      } else if (textLower.includes("kreditera") || textLower.includes("makulera") || (textLower.includes("avgift") && textLower.includes("fel")) || (textLower.includes("avgift") && textLower.includes("extra"))) {
        detectedType = "Fakturakreditering";
        extracted.solution = "Felaktig avgift krediterad på nästa faktura. Kreditnota skickas till kunden inom 24h.";
      } else if (textLower.includes("internet") || textLower.includes("bredband") || textLower.includes("router") || textLower.includes("nätverk") || (textLower.includes("nere") && !textLower.includes("el"))) {
        detectedType = "Teknisk Support / Bredband";
        extracted.solution = "Felsökning påbörjad. Kontroll av router, nätverksuppkoppling och ev. bokning av tekniker.";
      } else if (textLower.includes("inkasso") || textLower.includes("kronofogde") || textLower.includes("skuld")) {
        detectedType = "Inkassoärende";
        extracted.solution = "Ärendet kontrollerat mot inkassoregister. Kunden hänvisad till Intrum för betalningsplan.";
        extracted.mood = "Frustrerad";
      } else if (textLower.includes("faktura") || textLower.includes("avgift") || textLower.includes("räkning") || textLower.includes("betala")) {
        detectedType = "Fakturafråga";
        extracted.solution = "Utredning av fakturadifferens samt avstämning mot gällande avtal";
      } else if (textLower.includes("avtal") || textLower.includes("abonnemang") || textLower.includes("säga upp") || textLower.includes("uppsägning")) {
        detectedType = "Avtals- / Uppsägningsfråga";
        extracted.solution = "Genomgång av avtalsvillkor och bindningstider. Kunden informerad om varseltid.";
      } else if (textLower.includes("solceller") || textLower.includes("mikroproduktion")) {
        detectedType = "Solceller / Mikroproduktion";
        extracted.solution = "Inmatningsavtal upprättat. Ny tvåriktad elmätare beställd – leveranstid 3-5 veckor.";
        extracted.mood = "Positiv";
      } else if (textLower.includes("laddbox") || textLower.includes("elbil") || textLower.includes("evify")) {
        detectedType = "Laddbox / Elbil";
        extracted.solution = "Beställning vidarebefordrad till Evify. Kunden kontaktas av installatör inom 5-10 dagar.";
        extracted.mood = "Positiv";
      } else if (textLower.includes("flytt") || textLower.includes("adress")) {
        detectedType = "Flyttanmälan";
        extracted.solution = "Adressändring och flytt av abonnemang planerad";
      } else {
        // Fallback to advanced regex extraction if keywords exist
        const issueRegex = /(?:ärende|problem|gäller|angående|om|frustration\s+om|gällande)\s+([A-Za-zåäöÅÄÖ\s\-]{3,40})/i;
        const match = rawText.match(issueRegex);
        if (match && match[1].trim().length > 3) {
          let val = match[1].trim();
          // Clean up trailing verbs or punctuation
          val = val.replace(/\s+(?:vill|ska|gö|göra|för|till|från|är|datum)\b.*/i, '');
          val = val.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
          detectedType = val.charAt(0).toUpperCase() + val.slice(1);
        }
      }
      
      extracted.type = detectedType || "Bredbandsstörning";
      extracted.solution = extracted.solution || "Teknisk utredning & felsökning påbörjad";
    }

    // Extract System signature operator code
    const kodRegex = /(?:kod|signatur|sign|handläggare)\s*[:\s]*([A-Za-z0-9]+)/i;
    const kodMatch = rawText.match(kodRegex);
    state.variables.signatur_kod = kodMatch ? kodMatch[1] : "ximsgus";

    // Update global state variables
    state.variables.kund_namn = extracted.name;
    state.variables.kund_nummer = extracted.number;
    state.variables.problem_typ = extracted.type;
    state.variables.ai_losning = extracted.solution;

    // Update Structured Data UI Labels
    elements.lblCName.textContent = extracted.name;
    elements.lblCNum.textContent = extracted.number;
    if (elements.lblCType) elements.lblCType.textContent = extracted.type;
    elements.lblCSol.textContent = extracted.solution;

    // Toggle contextual grid layout fields in Structured Box
    if (isUtflytt) {
      elements.rowCAnlaggning.style.display = "flex";
      elements.rowCAdress.style.display = "flex";
      elements.rowCInflyttDatum.style.display = "flex";
      elements.rowCAvtalstyp.style.display = "flex";
      elements.rowCHandlaggare.style.display = "flex";
      elements.rowCAiSol.style.display = "none";

      elements.rowCInflyttDatum.querySelector(".data-label").textContent = "Utflyttningsdatum:";
      elements.rowCAvtalstyp.querySelector(".data-label").textContent = "Avtalsstatus:";

      elements.lblCAnlaggning.textContent = state.variables.anlaggnings_id;
      elements.lblCAdress.textContent = state.variables.adress;
      elements.lblCInflyttDatum.textContent = state.variables.inflytt_datum;
      elements.lblCAvtalstyp.textContent = state.variables.avtals_typ;
      elements.lblCHandlaggare.textContent = state.agentName;

      selectTemplate("tmpl-5");

    } else if (isInflytt) {
      elements.rowCAnlaggning.style.display = "flex";
      elements.rowCAdress.style.display = "flex";
      elements.rowCInflyttDatum.style.display = "flex";
      elements.rowCAvtalstyp.style.display = "none";
      elements.rowCHandlaggare.style.display = "flex";
      elements.rowCAiSol.style.display = "none";

      elements.rowCInflyttDatum.querySelector(".data-label").textContent = "Inflyttningsdatum:";

      elements.lblCAnlaggning.textContent = state.variables.anlaggnings_id;
      elements.lblCAdress.textContent = state.variables.adress;
      elements.lblCInflyttDatum.textContent = state.variables.inflytt_datum;
      elements.lblCHandlaggare.textContent = state.agentName;

      selectTemplate("tmpl-4");

    } else if (isMakuleradInflytt) {
      elements.rowCAnlaggning.style.display = "flex";
      elements.rowCAdress.style.display = "none";
      elements.rowCInflyttDatum.style.display = "none";
      elements.rowCAvtalstyp.style.display = "none";
      elements.rowCHandlaggare.style.display = "flex";
      elements.rowCAiSol.style.display = "none";

      elements.lblCAnlaggning.textContent = state.variables.anlaggnings_id;
      elements.lblCHandlaggare.textContent = state.agentName;

      selectTemplate("tmpl-6");

    } else if (isMakuleradUtflytt) {
      elements.rowCAnlaggning.style.display = "flex";
      elements.rowCAdress.style.display = "none";
      elements.rowCInflyttDatum.style.display = "none";
      elements.rowCAvtalstyp.style.display = "none";
      elements.rowCHandlaggare.style.display = "flex";
      elements.rowCAiSol.style.display = "none";

      elements.lblCAnlaggning.textContent = state.variables.anlaggnings_id;
      elements.lblCHandlaggare.textContent = state.agentName;

      selectTemplate("tmpl-7");

    } else {
      elements.rowCAnlaggning.style.display = "none";
      elements.rowCAdress.style.display = "none";
      elements.rowCInflyttDatum.style.display = "none";
      elements.rowCAvtalstyp.style.display = "none";
      elements.rowCHandlaggare.style.display = "none";
      elements.rowCAiSol.style.display = "flex";

      // Auto-select best template based on detected case type
      const caseTypeLower = (extracted.type || "").toLowerCase();
      if (caseTypeLower.includes("strömavbrott") || caseTypeLower.includes("felanmälan") || caseTypeLower.includes("bredband") || caseTypeLower.includes("teknisk")) {
        selectTemplate("tmpl-1"); // Support & Kompensation
      } else if (caseTypeLower.includes("faktura") || caseTypeLower.includes("kreditering") || caseTypeLower.includes("avbetalning") || caseTypeLower.includes("inkasso")) {
        selectTemplate("tmpl-2"); // Fakturaavstämning & Kreditering
      } else if (caseTypeLower.includes("avtal") || caseTypeLower.includes("solceller") || caseTypeLower.includes("laddbox") || caseTypeLower.includes("uppgradering")) {
        selectTemplate("tmpl-3"); // Avtalsuppgradering
      } else {
        selectTemplate("tmpl-8"); // Generell samtalsnotering
      }
    }

    // Update Sentiment Badge
    elements.badgeCMood.className = `sentiment-badge ${extracted.moodClass || 'neutral'}`;
    elements.badgeCMood.textContent = extracted.mood;
    
    // Hide visual scanner
    elements.scannerVisual.classList.remove("active");
    
    // Auto compile active template with new variables
    compileActiveTemplate();

    // Match routine for system guide visuals
    if (typeof routinesDatabase !== 'undefined') {
      const textLower = (rawText + " " + extracted.type).toLowerCase();
      let targetTitle = "";
      
      if (textLower.includes("avbrott") || textLower.includes("ström") || textLower.includes("bosse") || textLower.includes("felanmälan") || textLower.includes("ingen el") || textLower.includes("nere") && textLower.includes("ström")) {
        targetTitle = "Instruktion - Felanmälan strömavbrott och övriga iakttagelser";
      } else if (textLower.includes("kreditera") || textLower.includes("makulera") || (textLower.includes("faktura") && (textLower.includes("avgift") || textLower.includes("fel") || textLower.includes("extra")))) {
        targetTitle = "Instruktion - Kreditera och makulera faktura";
      } else if (textLower.includes("anstånd") || textLower.includes("avbetalning") || textLower.includes("avbetalningsplan") || textLower.includes("dela upp") || textLower.includes("betalningssvårigheter")) {
        targetTitle = "Instruktion - Anstånd på faktura";
      } else if (textLower.includes("realtid") || textLower.includes("gränssnitt") || textLower.includes("mätare") || textLower.includes("kundgränssnitt")) {
        targetTitle = "Instruktion - Aktivera kundgränssnitt";
      }
      
      if (targetTitle) {
        const matched = routinesDatabase.find(r => r.title === targetTitle);
        if (matched) {
          state.lastMatchedRoutine = matched;
          checkAndShowVisuals();
        }
      }
    }

    showToast("Releasy AI analys slutförd! Mallar och sammanfattning genererade. ✨");
  }, 1400);
}

// Compile variables to active template
function compileActiveTemplate() {
  const activeTemplate = state.templates.find(t => t.id === state.selectedTemplateId);
  if (!activeTemplate) return;
  
  let result = activeTemplate.text;
  
  // Clean up unfilled or default "Ej angivet" placeholders gracefully to keep sentences natural
  if (state.variables.kund_namn === "Ej angivet" || state.variables.kund_namn === "-") {
    result = result.replace(/Hej\s+\{\{kund_namn\}\}\s*[,!]/gi, "Hej,");
    result = result.replace(/\{\{kund_namn\}\}/g, "kunden");
  }
  
  if (state.variables.kund_nummer === "Ej angivet" || state.variables.kund_nummer === "-") {
    result = result.replace(/\(kundnummer\s+\{\{kund_nummer\}\}\)/gi, "");
    result = result.replace(/kundnummer\s+\{\{kund_nummer\}\}/gi, "kundnummer");
  }
  
  // Perform replacement
  result = result.replace(/\{\{kund_namn\}\}/g, state.variables.kund_namn);
  result = result.replace(/\{\{kund_nummer\}\}/g, state.variables.kund_nummer);
  result = result.replace(/\{\{problem_typ\}\}/g, state.variables.problem_typ);
  result = result.replace(/\{\{ai_losning\}\}/g, state.variables.ai_losning);
  result = result.replace(/\{\{agent_namn\}\}/g, state.variables.agent_namn);
  
  result = result.replace(/\{\{anlaggnings_id\}\}/g, state.variables.anlaggnings_id);
  result = result.replace(/\{\{adress\}\}/g, state.variables.adress);
  result = result.replace(/\{\{inflytt_datum\}\}/g, state.variables.inflytt_datum);
  result = result.replace(/\{\{avtals_typ\}\}/g, state.variables.avtals_typ);
  result = result.replace(/\{\{signatur_kod\}\}/g, state.variables.signatur_kod);
  result = result.replace(/\{\{epost\}\}/g, state.variables.epost || "Ej angivet");
  result = result.replace(/\{\{kontakt_uppgifter\}\}/g, state.variables.kontakt_uppgifter || state.variables.kund_namn);

  // Apply learned style adaptations in real time
  result = applyLearnedStyles(result);

  // Clean up double spaces or double commas left by missing placeholder removals
  result = result.replace(/  +/g, " ").replace(/ ,/g, ",").trim();
  
  // Auto-append signature code if it exists and is not already in the text
  if (state.agentSignatureCode && state.agentSignatureCode.trim() !== "") {
    const sigStr = `//${state.agentSignatureCode}`;
    if (!result.includes(sigStr)) {
      result += `\n\n${sigStr}`;
    }
  }

  // Put into paper editor
  elements.txtAiDraft.textContent = result;
}

// Render the templates list sidebar
function renderTemplatesList() {
  elements.listTemplatesContainer.innerHTML = "";
  if (elements.valActiveTemplates) elements.valActiveTemplates.textContent = `${state.templates.length} st`;
  
  state.templates.forEach(tmpl => {
    const card = document.createElement("div");
    card.className = `template-card ${tmpl.id === state.selectedTemplateId ? "active" : ""}`;
    card.setAttribute("data-id", tmpl.id);
    
    card.innerHTML = `
      <div class="template-info">
        <span class="template-name">${tmpl.name}</span>
        <span class="template-desc">${tmpl.desc}</span>
      </div>
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"/></svg>
    `;
    
    card.addEventListener("click", () => {
      selectTemplate(tmpl.id);
    });
    
    elements.listTemplatesContainer.appendChild(card);
  });
}

function selectTemplate(templateId) {
  state.selectedTemplateId = templateId;
  
  // Highlight card
  const cards = elements.listTemplatesContainer.querySelectorAll(".template-card");
  cards.forEach(c => {
    if (c.getAttribute("data-id") === templateId) {
      c.classList.add("active");
    } else {
      c.classList.remove("active");
    }
  });
  
  compileActiveTemplate();
}

// Render Templates Library Tab Grid
function renderTemplatesLibrary(filterQuery = "") {
  elements.libTemplatesGrid.innerHTML = "";
  
  state.templates.forEach(tmpl => {
    if (filterQuery && !tmpl.name.toLowerCase().includes(filterQuery) && !tmpl.desc.toLowerCase().includes(filterQuery)) {
      return;
    }
    
    const card = document.createElement("div");
    card.className = "section-card glass glass-interactive lib-tmpl-card";
    
    card.innerHTML = `
      <div class="lib-tmpl-header">
        <span class="lib-tmpl-title">${tmpl.name}</span>
        <span class="lib-tmpl-desc">${tmpl.desc}</span>
      </div>
      <div class="lib-tmpl-footer">
        <span style="font-size:10px; color:var(--ai-purple); font-weight:600; text-transform:uppercase;">Variabler: ${tmpl.text.match(/\{\{.*?\}\}/g)?.length || 0} st</span>
        <button class="btn-primary btn-use-template" data-id="${tmpl.id}" style="width:auto; font-size:11px; padding:6px 12px; border-radius:6px; box-shadow:none;">Använd i AI</button>
      </div>
    `;

    card.querySelector(".btn-use-template").addEventListener("click", () => {
      selectTemplate(tmpl.id);
      switchTab("view-dashboard");
      showToast(`Aktiverade mall: ${tmpl.name}`);
    });
    
    elements.libTemplatesGrid.appendChild(card);
  });
}

// Render CRM Cases Matrix datatable
function renderCrmTable(filterQuery = "") {
  elements.crmTableBody.innerHTML = "";
  
  state.crmQueue.forEach(item => {
    if (filterQuery && !item.name.toLowerCase().includes(filterQuery) && !item.category.toLowerCase().includes(filterQuery) && !item.number.toLowerCase().includes(filterQuery)) {
      return;
    }
    
    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="padding: 16px 24px; font-weight: 700; color: white;">${item.name}</td>
      <td style="padding: 16px 20px; font-family: monospace;">${item.number}</td>
      <td style="padding: 16px 20px;">${item.category}</td>
      <td style="padding: 16px 20px;"><span class="sentiment-badge ${item.moodClass}">${item.mood}</span></td>
      <td style="padding: 16px 20px;"><span style="color: ${item.status === 'Stängd' ? 'var(--success)' : 'var(--color-text-main)'}; font-weight:600;">${item.status}</span></td>
      <td style="padding: 16px 20px;"><span style="color: ${item.priority === 'Hög' || item.priority === 'Kritisk' ? 'var(--danger)' : 'var(--color-text-muted)'}; font-weight:600;">${item.priority}</span></td>
      <td style="padding: 16px 24px; text-align: right;"><button class="btn-primary btn-crm-load" data-id="${item.id}" style="width:auto; font-size:11px; padding:6px 12px; border-radius:6px; box-shadow:none;">Ladda i AI</button></td>
    `;

    row.querySelector(".btn-crm-load").addEventListener("click", () => {
      // Load customer case
      loadCase(item.id);
      switchTab("view-dashboard");
      runAiExtraction();
    });

    elements.crmTableBody.appendChild(row);
  });
}

// Dynamic, context-aware suggestion chips based on editor content and case type
function updateDynamicChips() {
  const container = elements.chipsSuggestionsRow;
  if (!container) return;

  const editorText = (elements.txtAiDraft.innerText || "").toLowerCase().trim();
  const hasContent = editorText.length > 30 && !editorText.includes("välj ett ärende") && !editorText.includes("skriv eller klistra");
  const caseType = (state.variables.problem_typ || "").toLowerCase();

  let chips = [];

  if (!hasContent) {
    // Empty state – show starter prompts + case-specific
    chips = [
      { label: "❓ Hur gör jag?", prompt: "Hur gör jag" },
      { label: "🔍 Sök rutin", prompt: "Sök rutin" },
      { label: "⚡ Analysera", prompt: "", action: "analyze" },
    ];
    if (caseType.includes("faktura") || caseType.includes("kreditering") || caseType.includes("avbetalning")) {
      chips.unshift({ label: "💳 Kreditera", prompt: "hur krediterar jag en faktura" });
    }
    if (caseType.includes("ström") || caseType.includes("felanmälan") || caseType.includes("avbrott")) {
      chips.unshift({ label: "⚡ Felanmälan", prompt: "hur gör jag en felanmälan strömavbrott" });
    }
    if (caseType.includes("inflytt") || caseType.includes("utflytt") || caseType.includes("flytt")) {
      chips.unshift({ label: "🏠 Flytt-guide", prompt: "hur registrerar jag inflytt utflytt" });
    }
  } else {
    // Has content — show editing + context chips
    chips.push({ label: "✂️ Korta", prompt: "Korta ner meddelandet markant så det blir slagkraftigt och professionellt" });
    chips.push({ label: "👔 Formell", prompt: "Gör svaret mer formellt och professionellt enligt svensk kundservicestandard" });
    chips.push({ label: "😊 Vänligare", prompt: "Gör tonen mer vänlig, empatisk och personlig" });
    chips.push({ label: "✍️ Stavning", prompt: "Rätta skrivfel och stavfel i utkastet", style: "border-color: rgba(168, 85, 247, 0.4); color: #c084fc;" });

    // Context-aware based on content
    if (editorText.includes("ursäkt") || editorText.includes("problem") || editorText.includes("tråkigt") || editorText.includes("beklag")) {
      chips.push({ label: "🎁 Kompensera", prompt: "Erbjud kunden 1 månads kostnadsfri tjänst som goodwill-kompensation och förklara hur avdraget sker automatiskt" });
    }
    if (editorText.includes("faktura") || editorText.includes("betalning") || editorText.includes("avgift") || editorText.includes("kredit")) {
      chips.push({ label: "💳 Avbetalning", prompt: "Erbjud kunden en avbetalningsplan med 2-3 delbetalningar som alternativ och förklara villkoren" });
    }
    if (editorText.includes("avbrott") || editorText.includes("ström") || editorText.includes("driftstörning") || editorText.includes("nere")) {
      chips.push({ label: "🔌 ETA", prompt: "Lägg till en uppskattad ETA för avhjälpning och förklara att driftcentralen arbetar med ärendet" });
    }
    if (editorText.includes("inflytt") || editorText.includes("utflytt") || editorText.includes("anläggning")) {
      chips.push({ label: "📋 Bekräftelse", prompt: "Lägg till en bekräftelse att registreringen är slutförd och att kunden får en skriftlig bekräftelse inom 4 dagar" });
    }
    chips.push({ label: "🇬🇧 Engelska", prompt: "Översätt hela meddelandet till professionell engelska" });
    chips.push({ label: "🔁 Skriv om", prompt: "Skriv om hela svaret från grunden med ett fräschare och mer modernt språk" });
  }

  // Render chips
  container.innerHTML = chips.map(c => {
    if (c.action === "analyze") {
      return `<span class="chip" data-action="analyze" style="border-color: rgba(99, 200, 132, 0.4); color: #6ee7b7;">⚡ Analysera</span>`;
    }
    const style = c.style ? ` style="${c.style}"` : "";
    return `<span class="chip" data-prompt="${c.prompt}"${style}>${c.label}</span>`;
  }).join("");
}

// Handle AI Prompt Mutation / simulated Generative LLM
function handleAiPromptCommand() {
  if (state.isGenerating) return;
  
  const promptText = elements.txtCopilotPrompt.value.trim();
  if (!promptText) return;
  
  const lowerPrompt = promptText.toLowerCase();
  if (lowerPrompt.includes("rätta") || lowerPrompt.includes("stavfel") || lowerPrompt.includes("grammar") || lowerPrompt.includes("korrigera")) {
    elements.txtCopilotPrompt.value = "";
    
    state.isGenerating = true;
    elements.outputIndicatorDot.className = "status-dot generating";
    elements.outputIndicatorText.textContent = "🔍 Söker efter skrivfel...";
    elements.txtAiDraft.classList.add("typing");
    
    setTimeout(() => {
      elements.outputIndicatorText.textContent = "🧠 Rättar stavfel och grammatik...";
      
      setTimeout(() => {
        const corrected = runGrammarCorrection();
        
        state.isGenerating = false;
        elements.outputIndicatorDot.className = "status-dot";
        elements.outputIndicatorText.textContent = "Releasy AI Redo";
        elements.txtAiDraft.classList.remove("typing");
        
        if (corrected) {
          showToast("Rättade skrivfel och stavfel i utkastet! ✍️");
        } else {
          showToast("Inga uppenbara skrivfel hittades i utkastet. 👍");
        }
        updateDynamicChips();
      }, 800);
    }, 800);
    return;
  }
  
  // Analyze prompt for learning style directions in real-time
  analyzePromptForLearning(promptText);
  
  // Clear the input field
  elements.txtCopilotPrompt.value = "";
  
  // Trigger the AI generative typewriter sequence
  triggerAiTypingGeneration(promptText);
}

// Smart, dynamic client-side Generative AI Engine to simulate real LLM reasoning and custom text composition
function generateSimulatedLlmResponse(promptText, baseText, variables) {
  const lowerPrompt = promptText.toLowerCase().trim();
  
  // --- KNOWLEDGE BASE INTERCEPTION (RAG SIMULATION) ---
  // Expanded triggers: catch more question patterns beyond just "hur"/"rutin"
  const ragTriggerWords = ["hur", "rutin", "leta", "sök", "vad", "varför", "när", "vilken", "vilket", "vilka",
    "ta bort", "lägga till", "ändra", "skapa", "registrera", "aktivera", "avsluta", "boka", "stänga",
    "faktura", "flytt", "inflytt", "avflytt", "mätare", "kreditera", "makulera", "anstånd",
    "påminnelse", "inkasso", "avbrott", "felanmälan", "solceller", "autogiro", "avbetalning",
    "säkring", "elmätare", "kundgränssnitt", "fullmakt", "uppsägning", "abonnemang", "effekt",
    "avgift", "kompensation", "debitering", "kabelskåp", "plombering", "nollfel", "spänning"];
  const hasRagTrigger = ragTriggerWords.some(w => lowerPrompt.includes(w)) || lowerPrompt.endsWith("?");
  if (hasRagTrigger) {
    if (typeof routinesDatabase !== 'undefined') {
      
      // Clean prompt from punctuation and stop words
      let cleanPrompt = lowerPrompt.replace(/[^\w\såäöÅÄÖ]/gi, " ");
      // Use split-filter instead of \b regex to avoid word boundary issues with åäö
      const stopWords = new Set(["hur","gör","man","jag","för","att","rutin","leta","sök","en","ett","den","det","kan","du","och","eller","men","vet","ej","inte","vad","var","vem","varför","när","vilken","vilket","vilka","ska","har","hade","vill","måste","mitt","min","mina","ditt","din","sina","sin","till","med","av","från","som","om","vid","hos","efter","upp","ner","genom","dit","hit","bara","alltid","redan","alla","allt","mer","mycket","ganska","andra","dessa","dem","de","vi","ni","han","hon","bli","blev","blir","typ","liksom","alltså","ju","väl","nog","kanske","dock","då","sedan","snälla","tack","hej"]);
      cleanPrompt = cleanPrompt.split(/\s+/).filter(w => !stopWords.has(w.toLowerCase())).join(" ");
      
      // Detect multi-word phrases before splitting
      const multiWordPhrases = [];
      const phrasePatterns = [
        /ta bort/g, /lägga till/g, /säga upp/g, /flytta in/g, /flytta ut/g,
        /byta ut/g, /stänga av/g, /slå på/g, /sätta upp/g, /dra av/g,
        /logga in/g, /skriva ut/g, /skapa kund/g, /ny kund/g,
        /mina sidor/g, /söka fram/g, /byta mätare/g, /ta bort påminnelse/g,
        /anstånd på/g, /effekt abonnemang/g, /boka tekniker/g
      ];
      phrasePatterns.forEach(pattern => {
        if (pattern.test(cleanPrompt)) {
          const phrase = pattern.source.replace(/\\/g, "");
          multiWordPhrases.push(phrase);
        }
      });
      
      let searchWords = cleanPrompt.trim().split(/\s+/).filter(w => w.length > 2);
      // Add multi-word phrases as single search tokens
      searchWords = searchWords.concat(multiWordPhrases);
      
      // FALLBACK: If prompt cleaning left no search words, try using customer raw text as context
      if (searchWords.length === 0 && elements.txtCustomerRaw) {
        const rawText = elements.txtCustomerRaw.value.trim().toLowerCase();
        if (rawText.length > 2) {
          let rawClean = rawText.replace(/[^\w\såäöÅÄÖ]/gi, " ");
          rawClean = rawClean.split(/\s+/).filter(w => !stopWords.has(w.toLowerCase())).join(" ");
          searchWords = rawClean.trim().split(/\s+/).filter(w => w.length > 2).slice(0, 8);
          
          // Also detect multi-word phrases in the raw text
          phrasePatterns.forEach(pattern => {
            pattern.lastIndex = 0; // Reset regex state
            if (pattern.test(rawClean)) {
              const phrase = pattern.source.replace(/\\/g, "");
              if (!searchWords.includes(phrase)) {
                searchWords.push(phrase);
              }
            }
          });
        }
      }
      
      // Also check the original unclean prompt for phrases (catches "ta bort" even when words are stop-worded individually)
      phrasePatterns.forEach(pattern => {
        pattern.lastIndex = 0;
        if (pattern.test(lowerPrompt)) {
          const phrase = pattern.source.replace(/\\/g, "");
          if (!searchWords.includes(phrase)) {
            searchWords.push(phrase);
          }
        }
      });
      
      const aiKeywordMap = {
        // ===== BETALNING & FAKTURA =====
        "betala": ["faktura", "inkasso", "kronofogde", "kredit", "avbetalning", "autogiro", "betalning"],
        "betalning": ["faktura", "autogiro", "inkasso", "avbetalning", "kredit"],
        "faktura": ["kreditera", "makulera", "betalning", "påminnelse", "avgift", "inkasso", "förfallodatum"],
        "fakturakopia": ["fakturakopia", "kopia", "utskrift"],
        "kredit": ["kreditera", "makulera", "faktura"],
        "kreditera": ["kreditera", "makulera", "faktura", "återbetalning"],
        "anstånd": ["anstånd", "faktura", "förlänga", "betalning", "förfallodatum", "anstånd på faktura"],
        "avbetalning": ["avbetalningsplan", "faktura", "kredit"],
        "avbetalningsplan": ["avbetalningsplan", "avbetalning"],
        "plan": ["avbetalningsplan", "avbetalning"],
        "autogiro": ["autogiro", "betalning", "faktura"],
        "påminnelse": ["påminnelse", "påminnelseavgift", "krav", "betalningspåminnelse", "inkasso"],
        "påminelse": ["påminnelse", "påminnelseavgift", "krav"],
        "påminnelseavgift": ["påminnelse", "kreditera", "krav", "betalningspåminnelse"],
        "avgift": ["påminnelse", "påminnelseavgift", "faktura", "kostnad", "debitering"],
        "krav": ["påminnelse", "inkasso", "kronofogde", "skuld"],
        "inkasso": ["inkasso", "kronofogde", "skuld", "krav", "betalning"],
        "skuld": ["inkasso", "kredit", "krav", "betalning"],
        "samlingsfaktura": ["samlingsfaktura", "faktura", "konfiguration"],
        "beräkna": ["ersättning", "avgift", "kostnad", "avbrott", "pris", "effekt", "faktura"],
        "pengar": ["faktura", "kredit", "inkasso", "skadestånd", "ersättning", "avdrag"],
        "återbetalning": ["avbetalning", "faktura", "kredit"],
        "förfallodatum": ["anstånd", "faktura", "betalning"],
        
        // ===== TA BORT / MAKULERA =====
        "ta bort": ["kreditera", "makulera", "samlingsfaktura", "påminnelse", "avgift", "faktura"],
        "ta bort påminnelse": ["påminnelse", "påminnelseavgift", "kreditera"],
        "bort": ["kreditera", "makulera", "ta bort", "avsluta", "radera"],
        "makulera": ["kreditera", "makulera", "faktura", "ta bort"],
        "radera": ["ta bort", "makulera", "avsluta"],
        
        // ===== FEL & AVBROTT =====
        "fel": ["avbrott", "reklamation", "felsökning", "nollfel", "problem"],
        "felanmälan": ["strömavbrott", "avbrott", "driftstörning", "iakttagelser", "kabelskåp"],
        "strömavbrott": ["felanmälan", "avbrott", "driftstörning", "strömavbrott"],
        "ström": ["strömavbrott", "felanmälan", "avbrott", "driftstörning"],
        "avbrott": ["strömavbrott", "felanmälan", "driftstörning"],
        "kabel": ["felanmälan", "avbrott", "kabelskåp", "grävning", "ledning", "strömavbrott"],
        "avgrävd": ["felanmälan", "kabel", "avbrott", "skada", "grävning", "strömavbrott"],
        "grävd": ["felanmälan", "kabel", "avbrott", "skada", "grävning"],
        "grävning": ["felanmälan", "kabel", "avbrott", "skada"],
        "ledning": ["felanmälan", "kabel", "avbrott", "servis", "kraftledning"],
        "skada": ["felanmälan", "reklamation", "skadestånd", "ersättning"],
        "spänning": ["spänningsklagomål", "nollfel", "strömavbrott"],
        "åska": ["åska", "åskskydd", "strömavbrott"],
        "träd": ["trädfällning", "ledningsbevakning", "felanmälan"],
        
        // ===== ANSLUTNING & ANLÄGGNING =====
        "anläggning": ["anläggningsförändringar", "mätarflytt", "servis", "plombering"],
        "anslutning": ["anslutningsavgift", "nyanslutning", "tillfällig anslutning"],
        "servis": ["servisändring", "anslutning", "elnät"],
        "säkring": ["huvudsäkring", "uppsäkring", "nedsäkring", "abonnemang"],
        "uppsäkring": ["säkring", "anläggningsförändringar", "servis"],
        "nedsäkring": ["säkring", "anläggningsförändringar"],
        
        // ===== MÄTARE =====
        "mätare": ["elmätare", "mätarbyte", "mätvärden", "mätarflytt"],
        "mätarbyte": ["elmätare", "mätarbyte", "mätarflytt", "mätvärden"],
        "elmätare": ["mätarbyte", "mätvärden", "realtidsmätning", "kundgränssnitt"],
        "mätvärden": ["mätare", "mätarbyte", "timvärden", "förbrukning"],
        
        // ===== AVTAL & FLYTT =====
        "avtal": ["abonnemang", "flytt", "uppsägning", "teckna"],
        "abonnemang": ["abonnemang", "avtal", "teckna", "uppsägning", "effektabonnemang"],
        "uppsägning": ["uppsägning", "avsluta", "avtal", "utflytt", "avflytt"],
        "flytt": ["inflytt", "utflytt", "avflytt", "flyttanmälan", "flytta"],
        "inflytt": ["flytt", "registrera", "teckna avtal"],
        "utflytt": ["flytt", "avflytt", "uppsägning"],
        "byta": ["flytt", "ändring", "mätarbyte"],
        "dödsbo": ["dödsbo", "avtal", "avslut"],
        
        // ===== KUND & CAB =====
        "skapa kund": ["registrera", "kunduppgifter", "söka fram uppgifter", "cab"],
        "skapa": ["registrera", "ny kund", "nytt ärende", "lägga upp"],
        "kund": ["kunduppgifter", "kundnummer", "kundservice"],
        "cab": ["betalningar", "kunduppgifter", "söka fram uppgifter", "ärende", "reskontra"],
        "kunduppgifter": ["kund", "kundnummer", "adress", "cab"],
        "ärende": ["ärendehantering", "ärendekoder", "cab"],
        
        // ===== DIGITALA TJÄNSTER =====
        "mina sidor": ["konto", "inloggning", "mina sidor", "app"],
        "app": ["ellevio app", "mina sidor", "inloggning"],
        "inloggning": ["mina sidor", "app", "lösenord", "konto"],
        "lösenord": ["inloggning", "mina sidor", "konto"],
        
        // ===== SOLCELLER & PRODUKTION =====
        "solceller": ["solceller", "produktion", "mikroproduktion", "batteri"],
        "batteri": ["solceller", "energilager", "produktion"],
        "produktion": ["solceller", "mikroproduktion", "överskottsfaktura"],
        
        // ===== ÖVRIGT =====
        "fullmakt": ["fullmakt", "ombud", "avtal", "god man"],
        "ersättning": ["avbrottsersättning", "skadestånd", "intrångsersättning"],
        "skadestånd": ["skadestånd", "ersättning", "reklamation"],
        "reklamation": ["reklamation", "skadestånd", "ersättning"],
        "laddbox": ["laddbox", "elbil", "laddning", "evify"],
        "effekt": ["effektabonnemang", "abonnemang", "säkring"],
        "rot": ["rot-avdrag", "skatteavdrag"],
        "sekretesskydd": ["sekretesskunder", "skyddad identitet"]
      };
      
      let expandedQueries = [...searchWords];
      
      const normalizeStr = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
      
      // Fuzzy normalization: collapse consecutive duplicate letters (e.g. "nn" → "n", "ss" → "s")
      // This handles common Swedish misspellings like "påminelse" vs "påminnelse"
      const fuzzyNorm = (str) => normalizeStr(str).replace(/(.)\1+/g, '$1');
      
      // Track which words are user-typed (higher weight) vs expanded (lower weight)
      const userTypedWords = new Set(searchWords.map(w => normalizeStr(w)));
      
      // Add fuzzy keywords and perform basic stemming
      searchWords.forEach(word => {
        const normWord = normalizeStr(word);
        const fuzzyWord = fuzzyNorm(word);
        Object.keys(aiKeywordMap).forEach(key => {
          const normKey = normalizeStr(key);
          const fuzzyKey = fuzzyNorm(key);
          
          let isMatch = false;
          if (normKey.length <= 3) {
            // For very short keys like 'rot', 'cab', 'app', 'fel', avoid matching them as substrings in the middle of other words (e.g. 'rot' in 'avbrott')
            isMatch = (normWord === normKey || fuzzyWord === fuzzyKey || normWord.startsWith(normKey) || normWord.endsWith(normKey));
          } else {
            isMatch = (normWord.includes(normKey) || normKey.includes(normWord) ||
                       fuzzyWord.includes(fuzzyKey) || fuzzyKey.includes(fuzzyWord));
          }
          
          if (isMatch) {
            expandedQueries = expandedQueries.concat(aiKeywordMap[key]);
          }
        });
        
        // Compound word splitting: 'påminnelseavgift' → ['påminnelse', 'avgift']
        if (normWord.length >= 8) {
          const compoundParts = ['faktura', 'avgift', 'kopia', 'betalning', 'påminnelse', 'kund',
            'abonnemang', 'mätare', 'anstånd', 'inkasso', 'kredit', 'avbrott', 'samling',
            'anläggning', 'säkring', 'effekt', 'intervall', 'stopp', 'ärende'];
          compoundParts.forEach(part => {
            const normPart = normalizeStr(part);
            if (normWord.includes(normPart) && normWord !== normPart && normPart.length >= 4) {
              expandedQueries.push(part);
              // Track compound-split words as user-typed (they're derived from user input)
              userTypedWords.add(normPart);
            }
          });
        }
        
        // Basic Swedish stemming
        if (word.endsWith('ar') || word.endsWith('er')) {
          expandedQueries.push(word.substring(0, word.length - 2));
        } else if (word.endsWith('a') || word.endsWith('e')) {
          expandedQueries.push(word.substring(0, word.length - 1));
        } else if (word.endsWith('s')) {
          expandedQueries.push(word.substring(0, word.length - 1));
        }
      });
      
      // Deduplicate expanded queries to improve efficiency and avoid scoring skew
      expandedQueries = [...new Set(expandedQueries)];
      
      let bestMatch = null;
      let maxScore = 0;
      

      routinesDatabase.forEach(routine => {
        let score = 0;
        const normTitle = normalizeStr(routine.title);
        const fuzzyTitle = fuzzyNorm(routine.title);
        const normContent = normalizeStr(routine.content || "");
        const fuzzyContent = fuzzyNorm(routine.content || "");
        
        const matchedWords = new Set();
        let userTitleHits = 0; // Count how many USER-TYPED words match in title
        let totalTitleHits = 0; // Count all title hits (including expanded)
        
        expandedQueries.forEach(word => {
          const normWord = normalizeStr(word);
          const fuzzyWord = fuzzyNorm(word);
          if (!normWord || matchedWords.has(normWord)) return;
          
          const isUserWord = userTypedWords.has(normWord);
          const userWeight = isUserWord ? 1.5 : 0.15;
          
          const directTitleMatch = normTitle.includes(normWord);
          const fuzzyTitleMatch = !directTitleMatch && fuzzyWord.length >= 4 && fuzzyTitle.includes(fuzzyWord);
          
          if (directTitleMatch || fuzzyTitleMatch) {
            totalTitleHits++;
            if (isUserWord) userTitleHits++;
            
            const matchScore = fuzzyTitleMatch ? 0.7 : 1.0;
            const checkTitle = directTitleMatch ? normTitle : fuzzyTitle;
            const checkWord = directTitleMatch ? normWord : fuzzyWord;
            const regexWhole = new RegExp("\\b" + checkWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "\\b", "i");
            if (regexWhole.test(checkTitle)) {
              score += Math.round(25 * matchScore * userWeight);
            } else {
              score += Math.round(8 * matchScore * userWeight);
            }
            
            // Clean core title for exact/prefix matching (covers instructions, information, blankets, and letters)
            const titleBody = normTitle.replace("instruktion - ", "").replace("information - ", "").replace("blankett - ", "").replace("brev - ", "").trim();
            if (titleBody === checkWord) {
              score += 150;
            } else if (titleBody.startsWith(checkWord) && checkWord !== "ta bort" && checkWord !== "skapa" && checkWord !== "säga upp" && checkWord !== "bort") {
              score += 80;
            }
            
            matchedWords.add(normWord);
          }
          
          if (normContent.includes(normWord)) {
            if (isUserWord) {
              score += 5;
            } else {
              score += 2;
            }
            matchedWords.add(normWord);
          }
        });
        
        // BONUS: Multi-word phrase match in title (strong intent signal)
        multiWordPhrases.forEach(phrase => {
          if (normTitle.includes(normalizeStr(phrase))) {
            score += 30;
          }
        });
        
        // BONUS: User-typed title coverage (more user words in title = much better)
        if (userTitleHits >= 2) {
          score += userTitleHits * 25;
        }
        
        // BONUS: High title relevance (many total title hits)
        if (totalTitleHits >= 3) {
          score += totalTitleHits * 10;
        }
        
        // BONUS: Match in the curated "Sökord:" field (strong intent signal from PDF author)
        const sokordMatch = (routine.content || "").match(/S[öo]kord:\s*(.+?)(?:\n|Team\/|Kategori:|$)/si);
        if (sokordMatch) {
          const sokordText = normalizeStr(sokordMatch[1]);
          searchWords.forEach(word => {
            const nw = normalizeStr(word);
            if (nw.length >= 3 && sokordText.includes(nw)) {
              score += 10; // Bonus for matching curated search terms
            }
          });
        }
        
        if (score > maxScore) {
          maxScore = score;
          bestMatch = routine;
        }
      });
      
      if (bestMatch && maxScore >= 10) {
        state.lastMatchedRoutine = bestMatch;
        const synthesizedActionList = synthesizeRoutineSolution(bestMatch.title, bestMatch.content || "");
        
        // Clean raw content: remove internal metadata lines
        let cleanedContent = (bestMatch.content || "")
          .replace(/Informationsklass:\s*\S+/gi, "")
          .replace(/Team\/Behörighet:\s*.*/gi, "")
          .replace(/Kategori:\s*.*/gi, "")
          .replace(/Underkategori:\s*.*/gi, "")
          .replace(/Sökord:\s*[\s\S]*?(?=\n\n|\n[A-Z0-9]|$)/gi, "")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
        
        // Extract the most relevant section based on search words
        let relevantExcerpt = "";
        if (searchWords.length > 0 && cleanedContent.length > 600) {
          const sections = cleanedContent.split(/\n(?=\d+\.\s)/);
          let bestSection = "";
          let bestSectionScore = 0;
          
          sections.forEach(section => {
            const sectionLower = section.toLowerCase();
            let sScore = 0;
            searchWords.forEach(w => {
              if (sectionLower.includes(w.toLowerCase())) sScore += 1;
            });
            if (sScore > bestSectionScore) {
              bestSectionScore = sScore;
              bestSection = section;
            }
          });
          
          if (bestSection && bestSectionScore > 0) {
            relevantExcerpt = bestSection.trim();
            // Cap at ~800 chars
            if (relevantExcerpt.length > 800) {
              relevantExcerpt = relevantExcerpt.substring(0, 800).replace(/\s+\S*$/, "") + "…";
            }
          }
        }
        
        // Fallback: take first ~600 chars if no relevant section found
        if (!relevantExcerpt) {
          relevantExcerpt = cleanedContent.substring(0, 600).replace(/\s+\S*$/, "");
          if (cleanedContent.length > 600) relevantExcerpt += "…";
        }
        
        const formattedExcerpt = relevantExcerpt.replace(/\n/g, '<br>');
        const rawTextHtml = `<blockquote style="max-height: 180px; overflow-y: auto; padding: 12px; margin: 12px 0; border-left: 4px solid var(--ai-purple); background: rgba(255, 255, 255, 0.02); font-size: 12px; color: var(--color-text-muted); line-height: 1.6; border-radius: 6px;">${formattedExcerpt}</blockquote>`;
        
        // Check if routine has images
        const hasImages = routineImagesDb && routineImagesDb[bestMatch.title];
        const imgHint = hasImages 
          ? `\n📸 *Rutinen har ${routineImagesDb[bestMatch.title].images.length} stödjande bilder – se bildkortet till höger för att bläddra.*\n`
          : "";
        
        const shortTitle = bestMatch.title.replace(/^Instruktion\s*-\s*/i, "").replace(/^Information\s*-\s*/i, "").replace(/^Blankett\s*-\s*/i, "").trim();
        return `🤖 **Releasy Expert-AI** — Bästa matchning: **${shortTitle}**

${synthesizedActionList}

---
**Relevant utdrag ur rutinen:**
${rawTextHtml}
${imgHint}
💡 *Sök på **"${shortTitle}"** i fliken Rutinbibliotek för fullständigt PDF-dokument och systembilder.*

//${state.agentSignatureCode}`;
      } else if (searchWords.length > 0) {
        return `Jag sökte igenom alla **366 rutiner** efter nyckelorden *"${searchWords.join(', ')}"* men hittade ingen exakt matchning.\n\nFörsök med:\n- Färre ord (t.ex. bara "anstånd" istället för "anstånd på faktura")\n- Alternativa termer (t.ex. "kreditera" istället för "ta bort avgift")\n- Sök manuellt i fliken **Rutinbibliotek**\n\n//${state.agentSignatureCode}`;
      }
    }
  }

  if (lowerPrompt.includes("ellevio") || lowerPrompt.includes("säkring") || lowerPrompt.includes("pris") || lowerPrompt.includes("kostar")) {
    // Extract which fuse size they are asking about
    const fuseMatch = lowerPrompt.match(/(\d{2})\s*a/i);
    if (fuseMatch) {
      const size = fuseMatch[1] + "A";
      const kbData = state.knowledgeBase.find(kb => kb.sakring === size);
      
      if (kbData) {
        const kbResponse = `Enligt den senaste prislistan från Ellevio kostar en ${kbData.sakring} säkring **${kbData.avgift}**. Denna nivå är lämplig för en årlig förbrukning på ${kbData.forbrukning} och medger ett max effektuttag på ${kbData.maxEffekt}.\n\nHoppas detta hjälper! Säg till om du har fler frågor kring elnätets avgifter.\n\n//${state.agentSignatureCode}`;
        return kbResponse;
      }
    } else if (lowerPrompt.includes("ellevio") || lowerPrompt.includes("prislista") || (lowerPrompt.includes("säkring") && (lowerPrompt.includes("pris") || lowerPrompt.includes("kostar")))) {
      const kbResponse = `Jag har tillgång till prislistan för säkringar. Vilken säkringsstorlek letar du efter? Jag har data för 16A, 20A, 25A, 35A, 50A och 63A.\n\n//${state.agentSignatureCode}`;
      return kbResponse;
    }
  }
  // --- END KNOWLEDGE BASE INTERCEPTION ---

  // --- COLLEAGUE QUESTION FALLBACK ---
  // If the user asks a general question that wasn't caught by the routine search or Ellevio RAG,
  // we should answer as a helpful colleague instead of drafting a customer email.
  const isGeneralQuestion = lowerPrompt.endsWith("?") || /^(vad|hur|varför|vem|när|vilken|vilket|vilka|kan|får)\b/.test(lowerPrompt);
  const isCommand = /(skriv|svara|lägg till|ändra|säg|be om|kompensera|boka)/.test(lowerPrompt);
  
  // --- SMART CONTEXTUAL ANSWERS (Claude/Gemini-style reasoning) ---
  // Handle specific procedural questions about Releasy's processes

  // Varseltid / uppsägningstid
  if (lowerPrompt.match(/varseltid|uppsgäningstid|hur l[åa]ng.*s[åa]ga upp|n[åa]r.*avtal.*upph[öo]r|bindningstid/)) {
    return `**Varseltid & bindningstid på Releasy:**\n\nElavtal (handel): Kan sägas upp med **5 dagars varsel**. Om bindningstid finns informeras kunden om eventuell avtalsbrottsavgift.\n\nNätavtal: Avslutas automatiskt vid utflytt eller avregistrering av anläggningen.\n\nKontrollera alltid om kunden har ett bindningsavtal i CRM innan du bekräftar datum.\n\n//${state.agentSignatureCode}`;
  }

  // Attestgränser
  if (lowerPrompt.match(/attestgr[äa]ns|hur mycket.*kreditera|max.*kredit|bel[öo]ppsgr[äa]ns/)) {
    return `**Attestgränser för kreditering:**\n\nKundservicehandläggare: max **500 kr** per ärende\nTeamledare: max **2 000 kr** per ärende\nChef/Ekonomi: obegränsat (kräver separat attest)\n\nKreditering över din attestgräns → eskalera ärendet till teamledaren med en notering i CRM.\n\n//${state.agentSignatureCode}`;
  }

  // Säkringsinfo / effektabonnemang
  if (lowerPrompt.match(/s[äa]kring|effektabonnemang|hur mycket kostar|16a|20a|25a|35a|50a|63a/)) {
    const fuseMatch = lowerPrompt.match(/(\d{2})\s*a/i);
    if (fuseMatch) {
      const size = fuseMatch[1] + "A";
      const kbData = state.knowledgeBase.find(kb => kb.sakring === size);
      if (kbData) {
        return `**Effektabonnemang ${kbData.sakring}:**\n\nMånadskostnad: **${kbData.avgift}**\nLämplig förbrukning: ${kbData.forbrukning}\nMaximal effekt: ${kbData.maxEffekt}\n\nDessa priser gäller för nätavgiften (elnätet). Elhandelspriset faktureras separat av elhandlaren.\n\n//${state.agentSignatureCode}`;
      }
    }
    return `**Effektabonnemang – prislista:**\n\n| Säkring | Månadspris | Förbrukning |\n|---------|-----------|-------------|\n| 16A | 450 kr/mån | 10-20 000 kWh |\n| 20A | 590 kr/mån | 20-25 000 kWh |\n| 25A | 740 kr/mån | 25-30 000 kWh |\n| 35A | 1 130 kr/mån | 30-40 000 kWh |\n| 50A | 1 730 kr/mån | 40-55 000 kWh |\n| 63A | 2 480 kr/mån | 55-70 000 kWh |\n\nVilken storlek undrar kunden över?\n\n//${state.agentSignatureCode}`;
  }

  // Hur lång tid / handläggningstid
  if (lowerPrompt.match(/hur l[åa]ng tid|handl[äa]ggingstid|n[äa]r.*klar|n[äa]r.*klart|leveranstid|n[äa]r f[åa]r/)) {
    const cType = (state.variables.problem_typ || "").toLowerCase();
    let eta = "";
    if (cType.includes("inflytt") || cType.includes("utflytt") || cType.includes("flytt")) {
      eta = "Flytt/inflyttregistrering bekräftas inom **4 arbetsdagar**. Inkopplingen sker på angivet datum.";
    } else if (cType.includes("kreditering") || cType.includes("faktura")) {
      eta = "Kreditnota skapas omedelbart och syns på **nästa faktura** (senast inom 30 dagar).";
    } else if (cType.includes("ström") || cType.includes("avbrott") || cType.includes("felanmälan")) {
      eta = "Driftcentralen prioriterar ärendet. Normalt avhjälps störningar inom **4-8 timmar** (oplanerade), planerade avbrott meddelas minst 5 dagar i förväg.";
    } else if (cType.includes("avbetalning") || cType.includes("anstånd")) {
      eta = "Avbetalningsplan/anstånd aktiveras **omedelbart** vid registrering i CRM.";
    } else {
      eta = "De flesta ärenden handläggs inom **1-3 arbetsdagar**. Brådskande ärenden (driftavbrott, säkerhetsrisker) prioriteras och hanteras samma dag.";
    }
    return `**Handläggningstid:**\n\n${eta}\n\nHar du specifika frågor om ett pågående ärende? Ange ärendenumret så kan jag hjälpa dig att följa upp.\n\n//${state.agentSignatureCode}`;
  }

  // Vad är / förklara
  if (lowerPrompt.match(/^(vad [äa]r|f[öo]rklara|vad menas med|vad inneb[äa]r)\s+(.+)/)) {
    const term = lowerPrompt.replace(/^(vad [äa]r|f[öo]rklara|vad menas med|vad inneb[äa]r)\s+/, "").trim();
    const termDefs = {
      "anstånd": "Anstånd innebär att kunden får flytta fram förfallodatumet på en faktura med max **30 dagar**. Det är kostnadsfritt och kräver att kunden inte har aktiva inkassoärenden.",
      "kreditering": "Kreditering innebär att en debiterad avgift återbetalas till kunden via en kreditnota som dras av på nästa faktura. Kräver attestering inom din behörighetsgräns.",
      "inflytt": "Inflytt = ny kund/hyresgäst registreras på en elanläggning. Kräver anläggnings-ID (18 siffror), startdatum och avtalstyp.",
      "utflytt": "Utflytt = befintligt elavtal avslutas på en anläggning. Kunden måste ha minst 5 dagars framförhållning.",
      "nollfel": "Nollfel = ett el-säkerhetsfel där nolledaren är avbruten, vilket kan ge farliga spänningar på apparater. Alltid akut — ring driftcentralen omedelbart.",
      "autogiro": "Autogiro = automatisk betalning från kundens bankkonto på förfallodagen. Kunden anmäler via Mina Sidor eller kundservice med kontonummer.",
      "han-port": "HAN-port (Home Area Network) = ett RJ12/RJ45-uttag på elmätaren som kunden kan använda för realtidsmätning (t.ex. Tibber Pulse).",
      "grid": "GRID = Releasys system för att registrera flytt- och avregistreringsärenden på elnätsanläggningar. Används för inflytt, utflytt och makulering.",
      "bosse": "BOSSE = Releasys system för felanmälningar och driftstörningar i elnätet. Används för att registrera avbrott och kontakta driftcentralen.",
      "podis": "PoDIS = driftkarta som visar status på kabelskåp och elnät i realtid. Används för att bedöma om ett avbrott är lokalt eller storskaligt."
    };
    const normTerm = term.replace(/[?,.!]/g, "").trim();
    const found = Object.entries(termDefs).find(([k]) => normTerm.includes(k));
    if (found) {
      return `**${found[0].charAt(0).toUpperCase() + found[0].slice(1)} – förklaring:**\n\n${found[1]}\n\nFler frågor? Sök i **Rutinbiblioteket** eller be mig förklara något annat.\n\n//${state.agentSignatureCode}`;
    }
  }

  // Sammanfatta ärendet
  if (lowerPrompt.match(/sammanfatta|summera|g[öo]r en sammanfattning|vad [äa]r [äa]rendet/)) {
    const nm = state.variables.kund_namn !== "-" ? state.variables.kund_namn : "Kunden";
    const nr = state.variables.kund_nummer !== "-" ? ` (${state.variables.kund_nummer})` : "";
    const typ = state.variables.problem_typ !== "-" ? state.variables.problem_typ : "okänt ärende";
    const sol = state.variables.ai_losning !== "-" ? state.variables.ai_losning : "utreds";
    return `**Ärendesammanfattning:**\n\n**Kund:** ${nm}${nr}\n**Ärendetyp:** ${typ}\n**Föreslagen åtgärd:** ${sol}\n**Handläggare:** ${state.agentName}\n\nÄrendet är registrerat och redo att avslutas. Glöm inte att kopiera och logga svaret i CRM.\n\n//${state.agentSignatureCode}`;
  }

  // Vad ska jag säga / hur svarar jag
  if (lowerPrompt.match(/vad ska jag s[äa]ga|hur svarar jag|vad [äa]r r[äa]tt svar|hj[äa]lp mig svara/)) {
    const sol = state.variables.ai_losning !== "-" ? state.variables.ai_losning : "vidare utredning";
    const nm = state.variables.kund_namn !== "-" ? state.variables.kund_namn : "kunden";
    return `**Förslag på vad du säger till ${nm}:**\n\nBörja med att bekräfta att du hört deras ärende och att du tar hand om det direkt. Förklara sedan åtgärden kort:\n\n*"Jag förstår situationen och har nu åtgärdat det — ${sol}. Du kommer att få en bekräftelse inom kort."*\n\nHåll det kortfattat, professionellt och empatiskt. Klicka på **"Analysera"** om du vill att jag genererar ett komplett svar automatiskt.\n\n//${state.agentSignatureCode}`;
  }

  if (isGeneralQuestion && !isCommand && promptText.length < 150) {
    return `**Releasy AI** sökte igenom **366 rutiner** men hittade ingen matchning för:\n\n*"${promptText}"*\n\n**Förslag:**\n- Prova mer specifika nyckelord: *"kreditera faktura"*, *"anstånd"*, *"inflytt"*, *"felanmälan"*\n- Sök manuellt i fliken **Rutinbibliotek**\n- Fråga teamledare om fallet är ovanligt\n\nVill du att jag skriver ett kundsvar istället? Skriv t.ex. *"Skriv ett formellt svar"* eller *"Gör texten kortare"*.\n\n//${state.agentSignatureCode}`;
  }
  // --- END SMART ANSWERS ---
  
  const topic = variables.problem_typ !== "-" && variables.problem_typ !== "Ej angivet" ? variables.problem_typ : "strömavbrott";
  const nameStr = variables.kund_namn !== "Ej angivet" && variables.kund_namn !== "-" ? variables.kund_namn : "kund";
  
  // 1. Detect Modifiers
  let language = "svenska";
  let tone = "neutral";
  let length = "normal";
  let isPoem = false;
  let isJoke = false;
  let hasCompensation = false;
  
  // Language
  if (lowerPrompt.includes("engelska") || lowerPrompt.includes("english")) language = "engelska";
  else if (lowerPrompt.includes("spanska") || lowerPrompt.includes("español")) language = "spanska";
  else if (lowerPrompt.includes("tyska") || lowerPrompt.includes("deutsch")) language = "tyska";
  else if (lowerPrompt.includes("pirat") || lowerPrompt.includes("sjörövare")) language = "pirat";
  else if (lowerPrompt.includes("shakespeare") || lowerPrompt.includes("kunglig") || lowerPrompt.includes("skald")) language = "shakespeare";
  
  // Tone
  if (lowerPrompt.includes("skrik") || lowerPrompt.includes("arg") || lowerPrompt.includes("caps") || lowerPrompt.includes("vrål") || lowerPrompt.includes("block")) tone = "arg";
  else if (lowerPrompt.includes("ironisk") || lowerPrompt.includes("sarkastisk")) tone = "sarkastisk";
  else if (lowerPrompt.includes("vänlig") || lowerPrompt.includes("trevlig") || lowerPrompt.includes("glad") || lowerPrompt.includes("emoji")) tone = "vänlig";
  else if (lowerPrompt.includes("formell") || lowerPrompt.includes("professionell")) tone = "formell";
  
  // Length
  if (lowerPrompt.includes("korta") || lowerPrompt.includes("snabb") || lowerPrompt.includes("kortare") || lowerPrompt.includes("sammanfatta") || lowerPrompt.includes("effektiv")) length = "kort";
  
  // Special Formats
  if (lowerPrompt.includes("dikt") || lowerPrompt.includes("poesi") || lowerPrompt.includes("rimma") || lowerPrompt.includes("rim")) isPoem = true;
  if (lowerPrompt.includes("skämt") || lowerPrompt.includes("rolig") || lowerPrompt.includes("joke") || lowerPrompt.includes("skämta")) isJoke = true;
  if (lowerPrompt.includes("kompensation") || lowerPrompt.includes("rabatt") || lowerPrompt.includes("gratis") || lowerPrompt.includes("fri månad")) hasCompensation = true;
  
  // 2. Extract Dynamic Additions
  let dynamicAdditions = [];
  
  // "säg att [något]" / "berätta att [något]" / "skriv att [något]"
  const sayMatch = promptText.match(/(?:säg att|berätta att|skriv att)\s+([^,.]+)/i);
  if (sayMatch && sayMatch[1]) {
    dynamicAdditions.push(`Jag vill även meddela att ${sayMatch[1].trim().toLowerCase()}.`);
  }
  
  // "fråga om [något]"
  const askMatch = promptText.match(/(?:fråga om)\s+([^,.]+)/i);
  if (askMatch && askMatch[1]) {
    dynamicAdditions.push(`Skulle du kunna återkoppla till oss angående ifall ${askMatch[1].trim().toLowerCase()}? Detta underlättar vår hantering framåt.`);
  }
  
  // "hälsa från [något]" / "hälsa till [något]"
  const greetMatch = promptText.match(/(?:hälsa från|hälsa till)\s+([^,.]+)/i);
  if (greetMatch && greetMatch[1]) {
    dynamicAdditions.push(`Jag vill också hälsa så gott från ${greetMatch[1].trim()}!`);
  }
  
  // "lägg till [något]" / "add [något]"
  const addMatch = promptText.match(/(?:lägg till|add)\s+([^,.]+)/i);
  if (addMatch && addMatch[1]) {
    dynamicAdditions.push(`Dessutom vill jag lägga till: ${addMatch[1].trim()}.`);
  }

  // Fallback for custom text if no specific command matched
  if (dynamicAdditions.length === 0 && !isPoem && !isJoke) {
    const customPromptClean = promptText.replace(/^(gör|lägg till|skriv|berätta|svara|formell|vänlig|arg|korta|snabb|engelska|spanska|tyska|pirat|shakespeare)\b/ig, "").trim();
    if (customPromptClean.length > 5 && !customPromptClean.includes(" ")) {
        // Just a single word like 'engelska', ignore
    } else if (customPromptClean.length > 5) {
      dynamicAdditions.push(`Dessutom vill jag nämna baserat på din feedback: "${customPromptClean.charAt(0).toUpperCase() + customPromptClean.slice(1)}".`);
    }
  }

  // 3. Construct Components Based on Language & Tone
  let greeting = "";
  let intro = "";
  let action = "";
  let closing = "";
  let signoff = "";
  let formatting = (text) => text;

  if (language === "engelska") {
    greeting = `Dear ${nameStr.charAt(0).toUpperCase() + nameStr.slice(1)},`;
    intro = `Thank you for reaching out to Releasy Support. We completely understand your situation regarding ${topic}.`;
    action = `We have investigated your account and initiated the following action:\n- Proposed Solution: ${variables.ai_losning || "Technical troubleshooting started"}.`;
    closing = `At Releasy, we always put your experience first. If you have any further questions, please do not hesitate to reply directly to this email.`;
    signoff = `Best regards,\n${variables.agent_namn}\nReleasy AI`;
    if (dynamicAdditions.length > 0) dynamicAdditions = dynamicAdditions.map(d => `Also, we want to add: ${d.replace("Jag vill även meddela att", "we want to inform you that").replace("Skulle du kunna återkoppla", "Could you please get back to us")}`);
  } 
  else if (language === "spanska") {
    greeting = `Estimado ${nameStr.charAt(0).toUpperCase() + nameStr.slice(1)},`;
    intro = `Gracias por ponerse en contacto con Releasy. Entendemos perfectamente su preocupación con respecto al problema de ${topic}.`;
    action = `Hemos revisado su cuenta y tomado la siguiente medida inmediata:\n- Solución propuesta: ${variables.ai_losning || "Resolución técnica en progreso"}.`;
    closing = `En Releasy, su satisfacción es nuestra máxima prioridad. Si tiene alguna otra pregunta, no dude en responder a este correo.`;
    signoff = `Atentamente,\n${variables.agent_namn}\nReleasy AI`;
  }
  else if (language === "tyska") {
    greeting = `Sehr geehrte(r) ${nameStr.charAt(0).toUpperCase() + nameStr.slice(1)},`;
    intro = `vielen Dank für Ihre Nachricht an den Releasy-Support. Wir verstehen Ihren Ärger bezüglich der Störung von ${topic} vollkommen.`;
    action = `Wir haben Ihr Konto überprüft und folgende Maßnahme eingeleitet:\n- Empfohlene Lösung: ${variables.ai_losning || "Technische Fehlerbehebung gestartet"}.`;
    closing = `Ihre Zufriedenheit steht für uns an erster Stelle. Wenn Sie weitere Fragen haben, antworten Sie einfach direkt auf diese E-Mail.`;
    signoff = `Mit freundlichen Grüßen\n${variables.agent_namn}\nReleasy AI`;
  }
  else if (language === "pirat") {
    greeting = `Ohoj ${nameStr !== "kund" ? nameStr : "kamrat"}! 🏴‍☠️🦜`;
    intro = `Harrr! Vi på Releasy-skeppet har hört din klagan över detta eländiga ${topic.toLowerCase()} som plågar ditt segel! 🌊`;
    action = `Vår besättning har genast kastat loss och satt in följande tunga kanonskott mot problemet:\n- Sabelhugg och åtgärd: ${variables.ai_losning}! ⚔️`;
    closing = `Vi viker aldrig från rodret för din skull! Svara på denna flaskpost direkt om du vill att vi ska planka några fler problem!`;
    signoff = `Skepp ohoj och en flaska rom,\nKapten ${variables.agent_namn} ⚓\nReleasy AI Corsair Edition`;
  }
  else if (language === "shakespeare") {
    greeting = `Måtte lyckan stå eder bi, ${nameStr !== "kund" ? "ädle " + nameStr : "välborne kund"}! 👑`;
    intro = `Det har kommit till vår kännedom att ett sällsamt bekymmer gällande ${topic.toLowerCase()} har hemsökt eder boning och kastat en skugga över eder dag.`;
    action = `Härmed kungöres att vi under djupaste allvar och med högsta skyndsamhet hava beslutat om följande botemedel:\n- Vår nådiga åtgärd: ${variables.ai_losning}.`;
    closing = `Vi förbliva eder evigt trogna i att tillgodose edra behov. Om edert hjärta hyser ytterligare spörsmål, bedja vi eder svara uppå detta brev utan dröjsmål.`;
    signoff = `Givet under vår hand och sigill,\n${variables.agent_namn}\nAv Guds nåde, Releasy AI Kansli`;
  }
  else { // Svenska (Default)
    // Tone Adjustments
    if (tone === "formell") {
      greeting = `Bäste ${nameStr !== "kund" ? nameStr : "kund"},`;
      intro = `Jag kontaktar er härmed å Releasys vägnar angående ert registrerade ärende rörande ${topic.toLowerCase()}.`;
      action = `Vi har genomfört en noggrann granskning av ert abonnemang och har beslutat att initiera följande åtgärd:\n- Godkänd åtgärd: ${variables.ai_losning}.`;
      closing = `Vi beklagar de eventuella olägenheter detta har medfört för er verksamhet och försäkrar er om vår fulla uppmärksamhet i denna angelägenhet. Om ytterligare spörsmål skulle uppstå står vår kundservice till ert fulla förfogande.`;
      signoff = `Högaktningsfullt,\n${variables.agent_namn}\nReleasy AI`;
    } 
    else if (tone === "vänlig") {
      greeting = `Hej ${nameStr !== "kund" ? "underbara " + nameStr : "kunden"}! 😊👋`;
      intro = `Hoppas att du har en helt fantastisk dag trots det tråkiga strulet med ${topic.toLowerCase()}! Vi vill så gärna göra din dag bättre.`;
      action = `Jag har kikat på ditt konto och ordnat följande direkt:\n- Fina nyheter: ${variables.ai_losning}.`;
      closing = `Hör av dig om du behöver hjälp med något annat, vi finns alltid här för dig! Ha en underbar vecka! ☀️✨`;
      signoff = `Varma kramar och hälsningar,\n${variables.agent_namn} 🦄\nReleasy AI`;
    }
    else if (tone === "arg") {
      greeting = `HEJ ${nameStr.toUpperCase()},`;
      intro = `VI FÖRSTÅR VERKLIGEN DIN PROTEST OCH FRUSTRATION ÖVER DET JÄKLA ${topic.toUpperCase()} SOM DRABBAT DIG!!!! DETTA ÄR TOTALT OACCEPTABELT OCH FÖRSTÖR HELA DIN ARBETSDAG!!!!`;
      action = `VI HAR DÄRFÖR SATT IN ALLA VÅRA RESURSER OCH PÅBÖRJAT FÖLJANDE KRISÅTGÄRD OMEDELBART:\n- KRISPLAN: ${variables.ai_losning.toUpperCase()}!!!!`;
      closing = `VI PÅ RELEASY GÖR ALLT FÖR ATT LÖSA DETTA OMEDELBART!!!! SVARA PÅ DETTA MEJL DIREKT OM DU SKA KLAGA MER!!!!`;
      signoff = `VÄNLIGA HÄLSNINGAR,\n${variables.agent_namn.toUpperCase()}\nRELEASY AI!!!!`;
      formatting = (text) => text.toUpperCase();
    }
    else if (tone === "sarkastisk") {
      greeting = `Men hejsan ${nameStr !== "kund" ? nameStr : ""},`;
      intro = `Tack för att du förgyller vår arbetsdag genom att berätta om det alldeles underbara ärendet gällande ${topic.toLowerCase()}. Visst är det spännande när saker bara bestämmer sig för att sluta fungera?`;
      action = `Men oroa dig inte! Vi på Releasy älskar lite dramatik i vardagen, så vi har redan slängt oss på knapparna och startat följande fantastiska åtgärd:\n- Trumvirvel... ${variables.ai_losning}.`;
      closing = `Hoppas detta löser ditt oerhört akuta i-landsproblem! Svara på detta e-postmeddelande om du vill ha ännu mer sarkasm.`;
      signoff = `Sarkastiska hälsningar,\n${variables.agent_namn}\nReleasy AI`;
    }
    else { // Neutral / Default
      greeting = `Hej ${nameStr !== "kund" ? nameStr : ""},`;
      intro = `Tack för att du hörde av dig till oss angående ${topic.toLowerCase()}. Vi förstår att detta är viktigt för dig och har tagit hand om ditt ärende direkt.`;
      action = `Vi har undersökt ditt konto och vidtagit följande åtgärd:\n- ${variables.ai_losning}.`;
      closing = `Hör gärna av dig om du har fler frågor eller vill följa upp ärendet — vi finns alltid här för dig.`;
      signoff = `Med vänliga hälsningar,\n${variables.agent_namn}\nReleasy Kundservice`;
    }
    
    // Length Adjustment for Swedish
    if (length === "kort") {
      intro = `Tack för ditt meddelande. Jag har kikat på ditt ärende gällande ${topic.toLowerCase()}.`;
      action = `Jag har åtgärdat detta genom:\n- ${variables.ai_losning}.`;
      closing = `Hör av dig om du undrar över något mer!`;
    }
    
    // Compensation Add-on
    if (hasCompensation) {
      action += `\n\n🎁 Som plåster på såren för det inträffade har jag dessutom lagt till **1 månad helt kostnadsfritt** på ditt abonnemang. Detta dras av helt automatiskt på din nästa faktura. Vi hoppas detta visar hur mycket vi bryr oss om dig som kund hos Releasy!`;
    }
    
    // Joke Add-on
    if (isJoke) {
      let joke = "Varför gillar elektriker inte fotboll? De föredrar direktkontakt! ⚡";
      if (topic.toLowerCase().includes("bredband") || topic.toLowerCase().includes("internet") || topic.toLowerCase().includes("wifi") || topic.toLowerCase().includes("störning")) joke = "Varför gick routern i terapi? Den hade för många anslutningsproblem! 🌐";
      else if (topic.toLowerCase().includes("faktura") || topic.toLowerCase().includes("avgift") || topic.toLowerCase().includes("räkning")) joke = "Varför är plånböcker så duktiga på matte? De är vana vid att göra avdrag! 💸";
      intro = `Här kommer ett litet skämt för att muntra upp under ert pågående ärende gällande ${topic.toLowerCase()}:\n\n"${joke}"\n\nMen skämt åsido tar vi detta på högsta allvar! ` + intro.charAt(0).toLowerCase() + intro.slice(1);
      if (length === "kort") intro = `Här kommer ett litet skämt för att muntra upp gällande ${topic.toLowerCase()}:\n"${joke}"\n\nMen skämt åsido, tack för ditt meddelande.`;
    }
    
    // Poem Add-on (Overrides everything)
    if (isPoem) {
      return `När mörkret faller i vårt hus,\noch sladden töms på ström och ljus.\nDå står vi här med dämpad röst,\nmen Releasy AI bjuder tröst.\n\nEtt ${topic.toLowerCase()} har lamslagit din dag,\nmen frukta ej, vi tar nya tag.\nVårt team gör allt för att hjälpa dig,\noch löser detta, ja tro på mej!\n\nSå håll ut en stund i stilla ro,\nsnart lyser lampan i ditt bo.\n\n${signoff}`;
    }
  }

  // Format dynamic additions
  let customParagraph = "";
  if (dynamicAdditions.length > 0) {
    customParagraph = "\n" + formatting(dynamicAdditions.join(" ")) + "\n";
  }

  // Final Assembly
  return `${formatting(greeting)}
 
${formatting(intro)}
 
${formatting(action)}
${customParagraph}
${formatting(closing)}
 
${formatting(signoff)}`;
}

function triggerAiTypingGeneration(promptText) {
  state.lastMatchedRoutine = null;
  state.isGenerating = true;
  elements.outputIndicatorDot.className = "status-dot generating";
  elements.outputIndicatorText.textContent = "🔍 AI scannar 366 rutiner...";
  elements.txtAiDraft.classList.add("typing");
  
  const baseText = elements.txtAiDraft.textContent.trim();
  
  setTimeout(() => {
    elements.outputIndicatorText.textContent = "🧠 Läser in matchad rutin...";
    
    setTimeout(() => {
      elements.outputIndicatorText.textContent = "⚡ Tillämpar personlig skrivstil...";
      
      setTimeout(() => {
        let mutatedText = generateSimulatedLlmResponse(promptText, baseText, state.variables);
        checkAndShowVisuals(promptText);

        const hasHtml = mutatedText.includes("<blockquote");
        const hasMarkdown = mutatedText.includes("###") || mutatedText.includes("**");
        if (hasHtml) {
          // Already contains HTML blockquotes — render as-is but still convert inline markdown
          elements.txtAiDraft.innerHTML = mutatedText
            .replace(/###\s*(.+)/g, "<strong style='color:var(--ai-purple);font-size:12px;letter-spacing:0.04em;text-transform:uppercase;'>$1</strong>")
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/^---+$/gm, "<hr style='border:none;border-top:1px solid rgba(255,255,255,0.1);margin:10px 0;'>")
            .replace(/\n/g, "<br>");
          state.isGenerating = false;
          elements.outputIndicatorDot.className = "status-dot";
          elements.outputIndicatorText.textContent = "Releasy AI Redo";
          elements.txtAiDraft.classList.remove("typing");
          showToast("Svaret omformulerades av AI! ✨");
          updateDynamicChips();
        } else if (hasMarkdown) {
          // Pure markdown — render as HTML (no typewriter, layout would break)
          elements.txtAiDraft.innerHTML = renderMarkdownToHtml(mutatedText);
          state.isGenerating = false;
          elements.outputIndicatorDot.className = "status-dot";
          elements.outputIndicatorText.textContent = "Releasy AI Redo";
          elements.txtAiDraft.classList.remove("typing");
          showToast("Svaret omformulerades av AI! ✨");
          updateDynamicChips();
        } else if (state.settings.useTypewriter) {
          typewriteText(mutatedText);
        } else {
          elements.txtAiDraft.textContent = mutatedText;
          state.isGenerating = false;
          elements.outputIndicatorDot.className = "status-dot";
          elements.outputIndicatorText.textContent = "Releasy AI Redo";
          elements.txtAiDraft.classList.remove("typing");
          showToast("Svaret omformulerades av AI! ✨");
          updateDynamicChips();
        }
      }, 800);
    }, 800);
  }, 800);
}

// Lightweight markdown → HTML renderer for the AI draft editor
// Handles: ### headings, **bold**, *italic*, newlines, --- separators
function renderMarkdownToHtml(text) {
  let html = text
    // Escape any real HTML first to avoid XSS from user notes
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // --- horizontal rule
    .replace(/^---+$/gm, "<hr style='border:none;border-top:1px solid rgba(255,255,255,0.1);margin:10px 0;'>")
    // ### headers
    .replace(/^###\s*(.+)$/gm, "<strong style='color:var(--ai-purple);font-size:12px;letter-spacing:0.04em;text-transform:uppercase;'>$1</strong>")
    // **bold**
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // *italic*
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Newlines → <br>
    .replace(/\n/g, "<br>");
  return html;
}

// High performance typewriter text loader
function typewriteText(fullText) {
  const container = elements.txtAiDraft;
  container.textContent = "";
  
  const words = fullText.split(" ");
  let currentWordIdx = 0;
  
  function typeWord() {
    if (currentWordIdx < words.length) {
      container.textContent += (currentWordIdx === 0 ? "" : " ") + words[currentWordIdx];
      currentWordIdx++;
      
      const delay = Math.random() * 40 + 35;
      setTimeout(typeWord, delay);
    } else {
      state.isGenerating = false;
      elements.outputIndicatorDot.className = "status-dot";
      elements.outputIndicatorText.textContent = "Releasy AI Redo";
      container.classList.remove("typing");
      showToast("Svaret omformulerades av AI! ✨");
      updateDynamicChips();
    }
  }
  
  typeWord();
}

// Copy draft to clipboard
function copyDraftToClipboard() {
  const text = elements.txtAiDraft.innerText;
  navigator.clipboard.writeText(text).then(() => {
    showToast("Kopierat till urklipp! 📋");
  });
}

// Elegant slider Toast helper
function showToast(message) {
  elements.toastNotify.textContent = message;
  elements.toastNotify.classList.add("show");
  
  setTimeout(() => {
    elements.toastNotify.classList.remove("show");
  }, 2500);
}

// Modals controller
function openModal() {
  elements.modalInputName.value = "";
  elements.modalInputDesc.value = "";
  elements.modalInputText.value = `Hej {{kund_namn}},

Vi har tagit emot ditt meddelande angående {{problem_typ}}.

Vår åtgärd:
- {{ai_losning}}

Vänliga hälsningar,
{{agent_namn}}`;
  elements.modalTemplate.classList.add("active");
}

function closeModal() {
  elements.modalTemplate.classList.remove("active");
}

// AI Auto-Generate Template Logic
function generateTemplateWithAi() {
  const magicInput = document.getElementById("modal-input-magic");
  if (!magicInput || !magicInput.value.trim()) {
    showToast("⚠️ Klistra in en exempeltext först!");
    return;
  }
  
  let rawText = magicInput.value.trim();
  const btn = document.getElementById("btn-generate-magic");
  
  // Fake AI generation delay
  const originalText = btn.innerHTML;
  btn.innerHTML = "✨ AI Analyserar mallstruktur...";
  btn.style.opacity = "0.7";
  btn.disabled = true;
  
  setTimeout(() => {
    // Basic AI substitution heuristics
    let templateText = rawText;
    
    // Replace names (Hej [Namn] -> Hej {{kund_namn}})
    templateText = templateText.replace(/(Hej|Tjena|Goddag|Bästa)\s+[A-ZÅÄÖ][a-zåäö]+(?:\s+[A-ZÅÄÖ][a-zåäö]+)?/i, "$1 {{kund_namn}}");
    
    // Replace SSN
    templateText = templateText.replace(/\b\d{6,8}-\d{4}\b|\b\d{10,12}\b/g, "{{kund_nummer}}");
    
    // Replace AnläggningsID (18 digits or after 'anläggning')
    templateText = templateText.replace(/\b735\d{15}\b|\b\d{18}\b/g, "{{anlaggnings_id}}");
    
    // Replace Dates (YYYY-MM-DD)
    templateText = templateText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "{{inflytt_datum}}");
    
    // Replace typical sign-offs
    templateText = templateText.replace(/(?:Mvh|Hälsningar|Vänliga hälsningar|Med vänlig hälsning),?\s*\n*\s*[A-ZÅÄÖ][a-zåäö]+/i, "Vänliga hälsningar,\n{{agent_namn}}");
    
    // Fallback names if not caught by Hej
    // This is risky but standard in mock AI
    
    // Fill the manual fields
    elements.modalInputName.value = "AI-Genererad Mall " + Math.floor(Math.random() * 100);
    elements.modalInputDesc.value = "Automatiskt skapad från exempel";
    elements.modalInputText.value = templateText;
    
    magicInput.value = ""; // Clear magic input
    
    btn.innerHTML = "✅ Mall Skapad!";
    btn.style.background = "var(--success)";
    
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = "";
      btn.style.opacity = "1";
      btn.disabled = false;
      showToast("✨ AI har fyllt i fälten åt dig. Granska och spara!");
    }, 1500);
    
  }, 1200);
}

// Create custom template card
function saveCustomTemplate() {
  const name = elements.modalInputName.value.trim();
  const desc = elements.modalInputDesc.value.trim();
  const text = elements.modalInputText.value.trim();
  
  if (!name || !text) {
    showToast("⚠️ Fyll i både namn och malltext!");
    return;
  }
  
  const newTmpl = {
    id: `tmpl-${Date.now()}`,
    name: name,
    desc: desc || "Skapad av användaren",
    text: text
  };
  
  state.templates.push(newTmpl);
  state.selectedTemplateId = newTmpl.id;
  
  closeModal();
  renderTemplatesList();
  renderTemplatesLibrary();
  compileActiveTemplate();
  showToast(`Mall '${name}' sparad och aktiverad! 💾`);
}

// KPI Booster on success responses
function animateKpiSuccess() {
  if (elements.valHandlingTime) { elements.valHandlingTime.textContent = "-48%"; elements.valHandlingTime.style.color = "var(--success)"; }
  if (elements.valCsatEst) { elements.valCsatEst.textContent = "98.2%"; elements.valCsatEst.style.color = "var(--ai-purple)"; }
  if (elements.valEscalationRate) { elements.valEscalationRate.textContent = "0.9%"; elements.valEscalationRate.style.color = "var(--success)"; }
  
  state.variables.automationPct = 87;
  elements.txtAutomationPct.textContent = "87%";
  elements.kpiAutomationBar.style.width = "87%";
  
  setTimeout(() => {
    if (elements.valHandlingTime) elements.valHandlingTime.style.color = "";
    if (elements.valCsatEst) elements.valCsatEst.style.color = "";
    if (elements.valEscalationRate) elements.valEscalationRate.style.color = "";
  }, 3000);
}

// Reset Demo Back to default Sven Svensson Case
function resetDemoSystem() {
  state.selectedCaseId = 1;
  state.lastMatchedRoutine = null;
  state.selectedTemplateId = "tmpl-1";
  state.agentName = "Göran Releasyson";
  state.agentDept = "Customer Care Global";

  // Reset checkboxes and sliders (preserve theme settings so the UI doesn't jarr)
  state.settings = {
    activeModel: "Releasy AI v1 Flash (Rek.)",
    temperature: 0.3,
    csatLimit: 92,
    useTypewriter: true,
    themeMode: state.settings.themeMode || "dark",
    themeAccent: state.settings.themeAccent || "default"
  };

  // Reset stepper/guide state
  state._stepsCompleted = {};
  state._guideImages = [];
  state._guideImageIndex = 0;
  state.lightboxImages = [];
  state.lightboxIndex = 0;
  elements.rngTemp.value = 0.3;
  elements.txtValTemp.textContent = "0.3";
  elements.rngCsat.value = 92;
  elements.txtValCsatLimit.textContent = "92%";
  elements.chkTypewriter.checked = true;
  elements.txtSettingsSignature.value = "Göran Releasyson";
  elements.txtSettingsDept.value = "Customer Care Global";



  // Reset models buttons active class
  document.getElementById("opt-model-1").classList.add("active");
  document.getElementById("opt-model-2").classList.remove("active");
  document.getElementById("opt-model-3").classList.remove("active");
  
  // Reset state variables
  state.variables = {
    kund_namn: state.cases[1].name,
    kund_nummer: state.cases[1].number,
    problem_typ: state.cases[1].type,
    ai_losning: state.cases[1].solution,
    agent_namn: state.agentName,
    anlaggnings_id: "-",
    adress: "-",
    inflytt_datum: "-",
    avtals_typ: "-",
    signatur_kod: "-"
  };

  // Hide move-in fields by default
  elements.rowCAnlaggning.style.display = "none";
  elements.rowCAdress.style.display = "none";
  elements.rowCInflyttDatum.style.display = "none";
  elements.rowCAvtalstyp.style.display = "none";
  elements.rowCHandlaggare.style.display = "none";
  elements.rowCAiSol.style.display = "flex";
  
  // Hide guide card
  if (elements.cardSystemGuide) {
    elements.cardSystemGuide.style.display = "none";
  }

  // Reload Sven
  loadCase(1);
  switchTab("view-dashboard");
  
  // Reload Structured UI Sven
  elements.lblCName.textContent = state.cases[1].name;
  elements.lblCNum.textContent = state.cases[1].number;
  if (elements.lblCType) elements.lblCType.textContent = state.cases[1].type;
  elements.lblCSol.textContent = state.cases[1].solution;
  elements.badgeCMood.className = "sentiment-badge negative";
  elements.badgeCMood.textContent = state.cases[1].mood;
  
  // Reset KPI items to start values
  if (elements.valHandlingTime) elements.valHandlingTime.textContent = "-42%";
  if (elements.valCsatEst) elements.valCsatEst.textContent = "96.4%";
  if (elements.valEscalationRate) elements.valEscalationRate.textContent = "1.2%";
  elements.txtAutomationPct.textContent = "84%";
  elements.kpiAutomationBar.style.width = "84%";
  
  // Clean text modifications
  elements.txtCopilotPrompt.value = "";
  
  // Reset style profile to baseline defaults
  state.styleProfile = {
    tone: 50,      // 0 = Formell, 50 = Balanserad, 100 = Vänlig
    structure: 50, // 0 = Kompakt, 50 = Normal, 100 = Detaljerad
    address: 80,   // 0 = Ni-form, 100 = Du-form
    learnedRules: [
      "🎯 Stilprofil aktiverad",
      "🇸🇪 Svensk kundservicejargong",
      "📚 Rutin-Expertis: 366/366 PDF:er",
      "⚡ Releasy AI Super-mode"
    ],
    learnedPhrases: []
  };
  updateStyleProfileUI();
  
  // Reload templates & CRM elements — keep all 8 default templates, drop any user-created ones
  state.templates = state.templates.slice(0, DEFAULT_TEMPLATES_COUNT);
  renderTemplatesList();
  renderTemplatesLibrary();
  renderCrmTable();
  compileActiveTemplate();
  
  // Profile reset
  document.querySelectorAll(".profile-name").forEach(n => n.textContent = state.agentName);
  document.querySelectorAll(".profile-role").forEach(r => r.textContent = state.agentDept);
  document.querySelectorAll(".avatar").forEach(a => {
    a.textContent = state.agentName ? state.agentName.trim().charAt(0).toUpperCase() : "R";
  });
  
  showToast("Demo återställd till utgångsläge! 🔄");
}

// Date String Generator
function updateTopDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date();
  let dateStr = today.toLocaleDateString('sv-SE', options);
  dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  elements.topDateIndicator.textContent = `${dateStr} | Releasy Agent Assist v3.2`;
}

// HEURISTICS & PARSING HELPERS (to make the raw custom inputs dynamic!)
function parseValueByKeywords(text, keywords, fallback) {
  const lines = text.split(/[.\n,]/);
  for (let line of lines) {
    line = line.trim();
    for (let kw of keywords) {
      if (line.toLowerCase().includes(kw)) {
        const parts = line.split(new RegExp(kw, 'i'));
        if (parts.length > 1) {
          let val = parts[1].trim();
          while (true) {
            let original = val;
            val = val.replace(/^[:\s\-\=\_]+/, '');
            val = val.replace(/^(?:är|heter|för|kod|kund|namn)\b/i, '');
            val = val.trim();
            if (val === original) break;
          }
          if (val.length > 2) return val;
        }
      }
    }
  }
  return fallback;
}

function evaluateMoodHeuristics(text) {
  const negs = [
    "missnöjd", "dåligt", "inte", "länge", "fel", "kräver", "frustrerad", "nere",
    "jobbigt", "problem", "oacceptabelt", "skandal", "katastrof", "extremt",
    "aldrig", "trött", "arg", "ilska", "arga", "chockad", "besviken", "orimligt",
    "omedelbart", "katastrofalt", "hur länge", "inga lampor", "avbrott",
    "fortfarande", "haft", "betalar", "missat", "försenat", "inkasso", "krav"
  ];
  const poss = [
    "bra", "tack", "trevlig", "gärna", "intresserad", "hjälpa", "nöjd",
    "superbra", "underbart", "perfekt", "toppen", "jättebra", "glad",
    "vill gärna", "roligt", "kul", "hoppas", "snälla", "fint", "grymt"
  ];

  let score = 0;
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  // Word-level scoring
  words.forEach(w => {
    if (negs.some(n => w.includes(n))) score -= 1.5;
    if (poss.some(p => w.includes(p))) score += 1.5;
  });

  // Phrase-level boosters for strong frustration signals
  if (lower.includes("extremt missnöjd") || lower.includes("helt oacceptabelt") || lower.includes("kräver kompensation") || lower.includes("har missat")) score -= 4;
  if (lower.includes("betalningssvårigheter") || lower.includes("dela upp") || lower.includes("avbetalning")) score -= 1; // worried but not angry
  if (lower.includes("vill gärna") || lower.includes("hur går vi tillväga") || lower.includes("kan ni")) score += 2;

  if (score <= -2) return "Frustrerad";
  if (score >= 2) return "Positiv";
  return "Undrande";
}

// =========================================================================
// 🧠 AI WRITE-STYLE LEARNING ENGINE CONTROLLERS & HEURISTICS
// =========================================================================

// Update the learned style profile UI components
function updateStyleProfileUI() {
  if (!state.styleProfile) return;

  const tone = state.styleProfile.tone;
  const structure = state.styleProfile.structure;
  const address = state.styleProfile.address;

  // Update tone text and bar
  if (elements.valStyleTone && elements.fillStyleTone) {
    let toneText = "Balanserad";
    if (tone < 30) toneText = "Formell 👔";
    else if (tone < 45) toneText = "Semiformell";
    else if (tone > 70) toneText = "Vänlig 😊";
    else if (tone > 55) toneText = "Trevlig";
    elements.valStyleTone.textContent = toneText;
    elements.fillStyleTone.style.width = `${tone}%`;
  }

  // Update structure text and bar
  if (elements.valStyleStructure && elements.fillStyleStructure) {
    let structText = "Normal";
    if (structure < 30) structText = "Kompakt ⚡";
    else if (structure < 45) structText = "Kortfattad";
    else if (structure > 70) structText = "Detaljerad 📖";
    else if (structure > 55) structText = "Informativ";
    elements.valStyleStructure.textContent = structText;
    elements.fillStyleStructure.style.width = `${structure}%`;
  }

  // Update address text and bar
  if (elements.valStyleAddress && elements.fillStyleAddress) {
    let addrText = "Du-form";
    if (address < 40) addrText = "Ni-form 👥";
    else if (address < 60) addrText = "Blandad form";
    else addrText = "Du-form 👤";
    elements.valStyleAddress.textContent = addrText;
    elements.fillStyleAddress.style.width = `${address}%`;
  }

  // Update learned rules list
  if (elements.learnedRulesList) {
    elements.learnedRulesList.innerHTML = "";
    if (state.styleProfile.learnedRules.length === 0) {
      elements.learnedRulesList.innerHTML = `<span class="var-badge" style="border-color: var(--border-light); color: var(--color-text-muted); cursor: default;">Inga regler inlärda ännu</span>`;
    } else {
      state.styleProfile.learnedRules.forEach(rule => {
        const badge = document.createElement("span");
        badge.className = "var-badge";
        badge.style.borderColor = "var(--border-light)";
        badge.style.color = "var(--ai-purple)";
        badge.style.fontFamily = "inherit";
        badge.style.fontSize = "9px";
        badge.style.cursor = "default";
        badge.textContent = rule;
        elements.learnedRulesList.appendChild(badge);
      });
    }
  }

  // Update learned phrases list
  if (elements.learnedPhrasesList) {
    elements.learnedPhrasesList.innerHTML = "";
    if (!state.styleProfile.learnedPhrases || state.styleProfile.learnedPhrases.length === 0) {
      elements.learnedPhrasesList.innerHTML = `<span class="var-badge" style="border-color: var(--border-light); color: var(--color-text-muted); cursor: default; font-size: 9px;">Inga anpassade fraser inlärda än</span>`;
    } else {
      state.styleProfile.learnedPhrases.forEach(phrase => {
        const badge = document.createElement("span");
        badge.className = "var-badge learned-phrase-badge";
        badge.style.cursor = "default";
        badge.style.fontSize = "9px";
        badge.style.borderColor = "rgba(168, 85, 247, 0.4)";
        badge.style.color = "#c084fc";
        badge.style.boxShadow = "0 0 8px rgba(168, 85, 247, 0.2)";
        badge.textContent = phrase;
        elements.learnedPhrasesList.appendChild(badge);
      });
    }
  }
}

// Generate compiled text of baseline template without learned style adaptations
function getRawCompiledTemplate() {
  const activeTemplate = state.templates.find(t => t.id === state.selectedTemplateId);
  if (!activeTemplate) return "";
  
  let result = activeTemplate.text;
  
  // Perform replacement
  result = result.replace(/\{\{kund_namn\}\}/g, state.variables.kund_namn);
  result = result.replace(/\{\{kund_nummer\}\}/g, state.variables.kund_nummer);
  result = result.replace(/\{\{problem_typ\}\}/g, state.variables.problem_typ);
  result = result.replace(/\{\{ai_losning\}\}/g, state.variables.ai_losning);
  result = result.replace(/\{\{agent_namn\}\}/g, state.agentName);
  
  // Move-in utility dynamic compilation
  result = result.replace(/\{\{anlaggnings_id\}\}/g, state.variables.anlaggnings_id);
  result = result.replace(/\{\{adress\}\}/g, state.variables.adress);
  result = result.replace(/\{\{inflytt_datum\}\}/g, state.variables.inflytt_datum);
  result = result.replace(/\{\{avtals_typ\}\}/g, state.variables.avtals_typ);
  result = result.replace(/\{\{signatur_kod\}\}/g, state.variables.signatur_kod);
  result = result.replace(/\{\{epost\}\}/g, state.variables.epost || "Ej angivet");
  result = result.replace(/\{\{kontakt_uppgifter\}\}/g, state.variables.kontakt_uppgifter || state.variables.kund_namn);

  return result;
}

// Analyze manual edits compared to raw baseline and learn style preferences
function learnStyleFromManualEdits() {
  const originalText = getRawCompiledTemplate();
  const editedText = elements.txtAiDraft.innerText.trim();
  
  if (!originalText || !editedText) {
    showToast("⚠️ Ingen text att analysera!");
    return;
  }
  
  if (originalText === editedText) {
    showToast("ℹ️ Inga manuella ändringar gjordes i utkastet!");
    return;
  }

  // Visual scan overlay over the learning card to look premium
  const learningCard = document.getElementById("card-style-learning");
  const cardBody = learningCard.querySelector(".card-body");
  
  cardBody.style.position = "relative";
  const learningScanner = document.createElement("div");
  learningScanner.className = "scanner-overlay active";
  learningScanner.style.borderRadius = "12px";
  learningScanner.innerHTML = `
    <div class="scanner-line" style="background: linear-gradient(90deg, transparent, #c084fc, #06b6d4, #c084fc, transparent);"></div>
    <div class="scanner-text" style="color: #c084fc; font-size: 11px; font-weight: 700;">🧠 Analyserar din skrivstil...</div>
  `;
  cardBody.appendChild(learningScanner);

  setTimeout(() => {
    const origLower = originalText.toLowerCase();
    const editLower = editedText.toLowerCase();
    
    // 1. Structure (Word count ratio)
    const origWords = originalText.split(/\s+/).filter(w => w.length > 0);
    const editWords = editedText.split(/\s+/).filter(w => w.length > 0);
    
    const wordRatio = editWords.length / origWords.length;
    
    if (wordRatio < 0.65) {
      state.styleProfile.structure = Math.max(10, state.styleProfile.structure - 25);
    } else if (wordRatio < 0.85) {
      state.styleProfile.structure = Math.max(20, state.styleProfile.structure - 12);
    } else if (wordRatio > 1.35) {
      state.styleProfile.structure = Math.min(90, state.styleProfile.structure + 25);
    } else if (wordRatio > 1.15) {
      state.styleProfile.structure = Math.min(80, state.styleProfile.structure + 12);
    }
    
    // 2. Tonalitet (Formal vs Friendly markers) Swedish words
    const formalWords = [
      "bäste", "bästa", "vänligen", "erhålla", "beklagar", "angelägenhet", "härmed", 
      "angående", "utföra", "meddela", "drabba", "olägenhet", "ytterligare", 
      "avvakta", "kontakta", "snarast", "mottagit", "högaktningsfullt"
    ];
    const friendlyWords = [
      "tjena", "tjenare", "hej!", "hejsan", "kul", "hoppas", "super", 
      "trevlig", "fin dag", "kram", "allt gott", "fixar", "löser", 
      "ordnat", "toppen", "fint", "grymt", "😊", "👍", "👋", "🎁", "✨"
    ];
    
    let formalCount = 0;
    let friendlyCount = 0;
    
    formalWords.forEach(w => {
      const matches = editLower.match(new RegExp("\\b" + w, "g"));
      if (matches) formalCount += matches.length;
    });
    
    friendlyWords.forEach(w => {
      const isEmoji = w.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u);
      const matches = editLower.match(isEmoji ? new RegExp(w, "g") : new RegExp("\\b" + w, "g"));
      if (matches) friendlyCount += matches.length;
    });
    
    if (formalCount > friendlyCount) {
      const diff = formalCount - friendlyCount;
      state.styleProfile.tone = Math.max(10, state.styleProfile.tone - Math.min(30, diff * 8));
    } else if (friendlyCount > formalCount) {
      const diff = friendlyCount - formalCount;
      state.styleProfile.tone = Math.min(95, state.styleProfile.tone + Math.min(30, diff * 8));
    }
    
    // 3. Address form (Ni-form vs Du-form)
    let niCount = (editLower.match(/\bni\b|\ber\b|\bert\b|\bera\b/g) || []).length;
    let duCount = (editLower.match(/\bdu\b|\bdig\b|\bdin\b|\bditt\b|\bdina\b/g) || []).length;
    
    if (niCount > duCount) {
      state.styleProfile.address = Math.max(10, state.styleProfile.address - 30);
    } else if (duCount > niCount) {
      state.styleProfile.address = Math.min(95, state.styleProfile.address + 25);
    }
    
    // 4. Update dynamic chips
    let rules = new Set(state.styleProfile.learnedRules);
    
    // Emojis check
    if (/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u.test(editedText)) {
      rules.add("✨ Emojis & Micro-interaktioner");
    }
    
    // Compact/spacing checks
    if (editedText.includes("\n\n") && editWords.length < origWords.length) {
      rules.add("⚡ Luftig, kompakt text");
    }
    
    // Mvh check
    if (editLower.includes("mvh")) {
      rules.add("✍️ Förkortade hälsningsfraser");
    }
    
    // Signature learning
    const signatureMatch = editedText.match(/(?:med vänliga hälsningar|mvh|allt gott|hälsningar|vänliga hälsningar),?\s*\n+([A-Za-zåäöÅÄÖ\s]+)/i);
    if (signatureMatch) {
      const newSigName = signatureMatch[1].trim().split("\n")[0];
      if (newSigName && newSigName !== state.agentName && newSigName.length > 2 && newSigName.length < 30) {
        rules.add(`🖋️ Signatur: ${newSigName}`);
        state.agentName = newSigName;
        state.variables.agent_namn = newSigName;
        elements.txtSettingsSignature.value = newSigName;
        document.querySelectorAll(".profile-name").forEach(n => n.textContent = newSigName);
      }
    }
    
    // Set explicit tonal rules chips based on values
    if (state.styleProfile.tone < 30) {
      rules.add("👔 Formell stilsignatur");
      rules.delete("😊 Varmt & Vänligt tilltal");
    } else if (state.styleProfile.tone > 70) {
      rules.add("😊 Varmt & Vänligt tilltal");
      rules.delete("👔 Formell stilsignatur");
    } else {
      rules.delete("👔 Formell stilsignatur");
      rules.delete("😊 Varmt & Vänligt tilltal");
    }
    
    if (state.styleProfile.structure < 30) {
      rules.add("⚡ Kompakt format");
      rules.delete("📖 Detaljerade förklaringar");
    } else if (state.styleProfile.structure > 70) {
      rules.add("📖 Detaljerade förklaringar");
      rules.delete("⚡ Kompakt format");
    } else {
      rules.delete("⚡ Kompakt format");
      rules.delete("📖 Detaljerade förklaringar");
    }
    
    if (state.styleProfile.address < 40) {
      rules.add("👥 Artig Ni-form");
      rules.delete("👤 Personlig Du-form");
    } else if (state.styleProfile.address > 70) {
      rules.add("👤 Personlig Du-form");
      rules.delete("👥 Artig Ni-form");
    } else {
      rules.delete("👥 Artig Ni-form");
      rules.delete("👤 Personlig Du-form");
    }
    
    state.styleProfile.learnedRules = Array.from(rules);
    
    // Active phrase learning (Greetings & Closings)
    let learnedAnyPhrase = false;
    const lines = editedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 0) {
      const firstLine = lines[0];
      if (firstLine && (firstLine.toLowerCase().startsWith("hej") || firstLine.toLowerCase().startsWith("tjena") || firstLine.toLowerCase().startsWith("bäste") || firstLine.toLowerCase().startsWith("hallå") || firstLine.toLowerCase().startsWith("goddag") || firstLine.toLowerCase().startsWith("käre"))) {
        let phrase = firstLine;
        const customerName = state.variables.kund_namn;
        if (customerName && customerName !== "-" && customerName !== "Ej angivet") {
          const nameEscaped = customerName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regexName = new RegExp(nameEscaped, 'gi');
          phrase = phrase.replace(regexName, "{{kund_namn}}");
        }
        
        if (!state.styleProfile.learnedPhrases) {
          state.styleProfile.learnedPhrases = [];
        }
        if (!state.styleProfile.learnedPhrases.includes(phrase)) {
          state.styleProfile.learnedPhrases.push(phrase);
          learnedAnyPhrase = true;
        }
      }
      
      // Extract closing
      let foundClosing = "";
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        if (line.startsWith("//") || line.includes("Releasy AI") || line.includes(state.agentName) || line.includes(state.agentSignatureCode)) {
          continue;
        }
        if (line.toLowerCase().includes("hälsningar") || line.toLowerCase().includes("mvh") || line.toLowerCase().includes("allt gott") || line.toLowerCase().includes("ha det") || line.toLowerCase().includes("kram") || line.toLowerCase().includes("sköt om") || line.toLowerCase().includes("vi hörs")) {
          foundClosing = line;
          break;
        }
      }
      
      if (foundClosing) {
        if (!state.styleProfile.learnedPhrases) {
          state.styleProfile.learnedPhrases = [];
        }
        if (!state.styleProfile.learnedPhrases.includes(foundClosing)) {
          state.styleProfile.learnedPhrases.push(foundClosing);
          learnedAnyPhrase = true;
        }
      }
    }
    
    // Remove scanner overlay
    cardBody.removeChild(learningScanner);
    
    // Update visual bars and chips
    updateStyleProfileUI();
    
    if (learnedAnyPhrase) {
      showToast("AI:n lärde sig din fras! 💡");
    } else {
      showToast("🧠 Personprofil uppdaterad! Din skrivstil har analyserats och sparats. ✨");
    }
  }, 1200);
}

// Reset the entire learned writing profile
function resetStyleProfile() {
  state.styleProfile = {
    tone: 50,
    structure: 50,
    address: 80,
    learnedRules: [
      "🎯 Stilprofil aktiverad",
      "🇸🇪 Svensk kundservicejargong",
      "📚 Rutin-Expertis: 366/366 PDF:er",
      "⚡ Releasy AI Super-mode"
    ],
    learnedPhrases: []
  };
  
  state.agentName = "Göran Releasyson";
  state.variables.agent_namn = "Göran Releasyson";
  elements.txtSettingsSignature.value = "Göran Releasyson";
  document.querySelectorAll(".profile-name").forEach(n => n.textContent = "Göran Releasyson");

  updateStyleProfileUI();
  compileActiveTemplate();
  showToast("🔄 Stilprofilen har återställts till standardläge!");
}

// Parse user prompts for writing style directives (Instruction-based style learning)
function analyzePromptForLearning(promptText) {
  const lower = promptText.toLowerCase();
  let learnedSomething = false;
  let rules = new Set(state.styleProfile.learnedRules);

  if (lower.includes("formell") || lower.includes("professionell") || lower.includes("hövlig")) {
    state.styleProfile.tone = Math.max(10, state.styleProfile.tone - 30);
    rules.add("👔 Formell stilsignatur");
    rules.delete("😊 Varmt & Vänligt tilltal");
    learnedSomething = true;
  }
  if (lower.includes("vänlig") || lower.includes("trevlig") || lower.includes("glad") || lower.includes("personlig")) {
    state.styleProfile.tone = Math.min(95, state.styleProfile.tone + 30);
    rules.add("😊 Varmt & Vänligt tilltal");
    rules.delete("👔 Formell stilsignatur");
    learnedSomething = true;
  }
  if (lower.includes("kort") || lower.includes("kompakt") || lower.includes("snabb") || lower.includes("effektiv")) {
    state.styleProfile.structure = Math.max(10, state.styleProfile.structure - 30);
    rules.add("⚡ Kompakt format");
    rules.delete("📖 Detaljerade förklaringar");
    learnedSomething = true;
  }
  if (lower.includes("detalj") || lower.includes("lång") || lower.includes("utförlig") || lower.includes("förklara")) {
    state.styleProfile.structure = Math.min(90, state.styleProfile.structure + 30);
    rules.add("📖 Detaljerade förklaringar");
    rules.delete("⚡ Kompakt format");
    learnedSomething = true;
  }
  if (lower.includes("ni-form") || (lower.includes(" ni ") && lower.includes("tilltal")) || lower.includes("artig form")) {
    state.styleProfile.address = Math.max(10, state.styleProfile.address - 35);
    rules.add("👥 Artig Ni-form");
    rules.delete("👤 Personlig Du-form");
    learnedSomething = true;
  }
  if (lower.includes("du-form") || (lower.includes(" du ") && lower.includes("tilltal"))) {
    state.styleProfile.address = Math.min(95, state.styleProfile.address + 30);
    rules.add("👤 Personlig Du-form");
    rules.delete("👥 Artig Ni-form");
    learnedSomething = true;
  }
  if (lower.includes("emoji")) {
    rules.add("✨ Emojis & Micro-interaktioner");
    learnedSomething = true;
  }
  if (lower.includes("mvh")) {
    rules.add("✍️ Förkortade hälsningsfraser");
    learnedSomething = true;
  }

  if (learnedSomething) {
    state.styleProfile.learnedRules = Array.from(rules);
    updateStyleProfileUI();
  }
}

function applyLearnedStyles(text) {
  let result = text;
  const tone = state.styleProfile.tone;
  const structure = state.styleProfile.structure;
  const address = state.styleProfile.address;
  const rules = state.styleProfile.learnedRules || [];
  
  const isNiForm = address < 40 || rules.includes("👥 Artig Ni-form");
  const isDuForm = address > 70 || rules.includes("👤 Personlig Du-form");
  const isFormal = tone < 30 || rules.includes("👔 Formell stilsignatur");
  const isFriendly = tone > 70 || rules.includes("😊 Varmt & Vänligt tilltal");
  const isCompact = structure < 30 || rules.includes("⚡ Kompakt format");
  const isDetailed = structure > 70 || rules.includes("📖 Detaljerade förklaringar");
  const useEmojis = rules.includes("✨ Emojis & Micro-interaktioner");
  const useMvh = rules.includes("✍️ Förkortade hälsningsfraser");

  // 1. Tone - Formal rewriting overrides
  if (isFormal) {
    result = result.replace(/Hej (\w+[\s\w]*)[!,\n]/i, "Bäste $1,\n\nJag hoppas att ni har en god dag.");
    result = result.replace(/Hej[!,\n]/i, "Bäste kund,\n\n");
    
    result = result.replace(/Tack för att du hörde av dig/i, "Vi bekräftar härmed mottagandet av er förfrågan");
    result = result.replace(/Jag förstår verkligen att det är frustrerande/i, "Vi beklagar de eventuella besvär som har uppstått");
    result = result.replace(/Jag har undersökt ditt konto/i, "Vi have granskat er profil i våra register");
    result = result.replace(/Vi på Releasy sätter alltid din upplevelse först/i, "Vi värdesätter er som kund och strävar efter att tillhandahålla högsta servicekvalitet");
    result = result.replace(/Om du har ytterligare funderingar är det bara att svara direkt/i, "Skulle ytterligare spörsmål uppstå står vår kundservice till er disposition");
    result = result.replace(/Ha en fantastisk dag!/i, "Vi önskar er en fortsatt angenäm vecka.");
    result = result.replace(/Vad trevligt att du hör dig/i, "Vi bekräftar härmed ert intresse");
    
    result = result.replace(/Med vänliga hälsningar,?/i, "Högaktningsfullt,");
    result = result.replace(/Vänliga hälsningar,?/i, "Högaktningsfullt,");
  } 
  
  // 2. Tone - Friendly rewriting overrides
  if (isFriendly) {
    result = result.replace(/Hej (\w+[\s\w]*),/i, "Hej $1! 😊");
    result = result.replace(/Hej (\w+[\s\w]*)\n/i, "Hej $1! 👋\n");
    
    result = result.replace(/Tack för att du hörde av dig/i, "Tack för att du hör av dig till oss! Vad roligt att prata med dig");
    result = result.replace(/Jag förstår verkligen att det är frustrerande/i, "Jag förstår verkligen att det känns supertråkigt");
    result = result.replace(/Jag har undersökt ditt konto/i, "Jag har kikat på ditt konto på en gång 🔍");
    result = result.replace(/Jag har granskat debiteringen/i, "Jag har kollat igenom fakturan direkt och ordnat det på direkten! 🌟");
    result = result.replace(/Vi på Releasy sätter alltid din upplevelse först/i, "Vi på Releasy vill alltid ge dig världens bästa upplevelse");
    result = result.replace(/Om du har ytterligare funderingar är det bara att svara direkt/i, "Hör bara av dig om du undrar över något annat, vi hjälper mer än gärna till! 💬");
    result = result.replace(/Ha en fantastisk dag!/i, "Hoppas du får en helt fantastisk och trevlig dag! ☀️✨");
    result = result.replace(/Vad trevligt att du hör dig/i, "Men vad roligt att du vill uppgradera hos oss! Grymt val! 🎉");
    
    result = result.replace(/Med vänliga hälsningar,?/i, "Allt gott och ha det så fint,");
    result = result.replace(/Vänliga hälsningar,?/i, "Ha det superbra,");
  }

  // 3. Address form adjustments (Ni vs Du)
  if (isNiForm) {
    result = result.replace(/\bdu\b/g, "ni");
    result = result.replace(/\bDu\b/g, "Ni");
    result = result.replace(/\bdig\b/g, "er");
    result = result.replace(/\bDig\b/g, "Er");
    result = result.replace(/\bdin\b/g, "er");
    result = result.replace(/\bDin\b/g, "Er");
    result = result.replace(/\bditt\b/g, "ert");
    result = result.replace(/\bDitt\b/g, "Ert");
    result = result.replace(/\bdina\b/g, "era");
    result = result.replace(/\bDina\b/g, "Era");
    result = result.replace(/\bdig själv\b/g, "er själva");
    
    result = result.replace(/ditt konto/gi, "ert konto");
    result = result.replace(/din anläggning/gi, "er anläggning");
  } else if (isDuForm) {
    result = result.replace(/\bni\b/g, "du");
    result = result.replace(/\bNi\b/g, "Du");
    result = result.replace(/\ber\b/g, "dig");
    result = result.replace(/\bEr\b/g, "Dig");
    result = result.replace(/\bert\b/g, "ditt");
    result = result.replace(/\bErt\b/g, "Ditt");
    result = result.replace(/\bera\b/g, "dina");
    result = result.replace(/\bEra\b/g, "Dina");
    
    result = result.replace(/ert konto/gi, "ditt konto");
    result = result.replace(/er anläggning/gi, "din anläggning");
  }

  // 4. Structure: Kompakt vs Detaljerad
  if (isCompact) {
    result = result.replace(/Tack för att du hörde av dig till oss\..*?speciellt när det påverkar din arbetsdag\./s, "Tråkigt att höra att du upplever {{problem_typ}}.");
    result = result.replace(/Vi på Releasy sätter alltid din upplevelse först och hoppas att detta löser problemet för dig\..*?det bara att svara direkt.*?\./s, "Svara direkt på detta e-postmeddelande om du undrar över något mer!");
    result = result.replace(/Justeringen sker automatiskt och du behöver inte göra något mer\. Vi hoppas att detta ger en bra lösning!/g, "Det är nu åtgärdat och sker helt automatiskt.");
    result = result.replace(/För att slutföra denna uppgradering har jag förberett avtalet\..*?BankID\./s, "Signera gärna avtalet via den länk som skickats via SMS.");
    result = result.replace(/\n\n+/g, "\n\n");
  } else if (isDetailed) {
    result = result.replace(/Jag har undersökt ditt konto/i, "Jag har startat en djupgående teknisk undersökning på ditt abonnemangskonto");
    result = result.replace(/ser att det blivit fel i vår systemdebitering/i, "noterar att en avvikelse uppstått i vår månatliga systemdebitering och fakturaavstämning");
    result = result.replace(/har genast vidtagit följande åtgärder/i, "har omgående eskalerat detta och genomfört följande korrigerande åtgärder i vårt system");
    result = result.replace(/Vi hoppas att detta ger en bra lösning!/i, "Vi hoppas att denna kompensation och snabba hantering ger en fullgod och långsiktig lösning på ärendet.");
  }

  // 5. Apply Specific rules overrides
  if (useMvh) {
    result = result.replace(/Med vänliga hälsningar,?/gi, "Mvh,");
    result = result.replace(/Vänliga hälsningar,?/gi, "Mvh,");
  }

  if (useEmojis && !isFormal) {
    if (!result.includes("😊") && !result.includes("🌟")) {
      result = result.replace(/Releasy AI/g, "Releasy AI ✨🤖");
    }
  }

  // Apply learned greeting phrase
  if (state.styleProfile.learnedPhrases && state.styleProfile.learnedPhrases.length > 0) {
    const learnedGreeting = state.styleProfile.learnedPhrases.find(p => p.includes("{{kund_namn}}"));
    if (learnedGreeting) {
      const customerName = state.variables.kund_namn || "kunden";
      const compiledGreeting = learnedGreeting.replace(/\{\{kund_namn\}\}/g, customerName);
      
      const lines = result.split('\n');
      if (lines.length > 0) {
        lines[0] = compiledGreeting;
        result = lines.join('\n');
      }
    }
    
    // Apply learned closing phrase
    const learnedClosing = state.styleProfile.learnedPhrases.find(p => !p.includes("{{kund_namn}}"));
    if (learnedClosing) {
      const lines = result.split('\n');
      let signoffIdx = -1;
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].toLowerCase();
        if (line.includes("vänliga hälsningar") || line.includes("mvh") || line.includes("hälsningar") || line.includes("allt gott") || line.startsWith("//")) {
          signoffIdx = i;
          break;
        }
      }
      if (signoffIdx > 0) {
        let closingIdx = -1;
        for (let j = signoffIdx - 1; j >= 0; j--) {
          if (lines[j].trim().length > 0) {
            closingIdx = j;
            break;
          }
        }
        if (closingIdx !== -1) {
          lines[closingIdx] = learnedClosing;
          result = lines.join('\n');
        }
      }
    }
  }

  return result.trim();
}

// ==========================================
// 6. ROUTINES LIBRARY (RAG UI Integration)
// ==========================================

function renderRoutinesLibrary(searchQuery = "") {
  const listEl = document.getElementById("routines-list");
  if (!listEl) return;
  
  listEl.innerHTML = "";
  
  if (typeof routinesDatabase === "undefined") {
    listEl.innerHTML = "<li style='padding: 16px; color: var(--color-text-muted);'>Rutin-databasen (routines.js) saknas.</li>";
    return;
  }
  
  const query = searchQuery.toLowerCase().trim();
  let filtered = routinesDatabase;
  
  if (query) {
    // Fuzzy Keyword Mapping Dictionary
    const keywordMap = {
      "beräkna": ["ersättning", "avgift", "kostnad", "avbrott", "skadestånd", "pris", "effekt", "faktura"],
      "betala": ["faktura", "inkasso", "kronofogde", "kredit", "avbetalning", "autogiro"],
      "pengar": ["faktura", "kredit", "inkasso", "skadestånd", "ersättning", "avdrag"],
      "fel": ["avbrott", "reklamation", "skadestånd", "felsökning", "nollfel", "problem"],
      "avtal": ["abonnemang", "flytt", "uppsägning", "teckna"],
      "byta": ["flytt", "ändring", "mätarbyte"],
      "påminnelse": ["påminnelse", "påminnelseavgift", "krav"],
      "avgift": ["påminnelse", "faktura", "kostnad"],
      "krav": ["påminnelse", "inkasso"],
      "strömavbrott": ["felanmälan", "avbrott", "strömavbrott"],
      "solceller": ["solceller", "produktion", "mikroproduktion"],
      "mätare": ["elmätare", "mätarbyte", "mätvärden"]
    };

    // Fuzzy normalizer: strips diacritics + collapses double letters
    const fuzzyNorm = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/(.)\1+/g, '$1');

    const searchWords = query.split(" ").filter(w => w.length > 0);
    
    filtered = routinesDatabase.filter(r => {
      const lowerTitle = r.title.toLowerCase();
      const fuzzyTitle = fuzzyNorm(r.title);
      // Every word in the search query must match the title (either directly, via fuzzy, or via synonym)
      return searchWords.every(word => {
        if (lowerTitle.includes(word)) return true; // Direct match
        
        // Fuzzy match (handles "påminelse" → matches "påminnelse")
        const fuzzyWord = fuzzyNorm(word);
        if (fuzzyWord.length >= 3 && fuzzyTitle.includes(fuzzyWord)) return true;
        
        // Synonym match
        const synonyms = keywordMap[word];
        if (synonyms) {
          return synonyms.some(syn => lowerTitle.includes(syn));
        }
        
        // Fuzzy synonym match
        for (const [key, syns] of Object.entries(keywordMap)) {
          const fuzzyKey = fuzzyNorm(key);
          if (fuzzyWord.includes(fuzzyKey) || fuzzyKey.includes(fuzzyWord)) {
            if (syns.some(syn => lowerTitle.includes(syn) || fuzzyTitle.includes(fuzzyNorm(syn)))) return true;
          }
        }
        
        return false;
      });
    });
  }
  
  if (filtered.length === 0) {
    listEl.innerHTML = "<li style='padding: 16px; color: var(--color-text-muted);'>Inga rutiner hittades för din sökning.</li>";
    return;
  }
  
  filtered.forEach(routine => {
    const li = document.createElement("li");
    li.style.padding = "12px 16px";
    li.style.borderBottom = "1px solid var(--border-light)";
    li.style.cursor = "pointer";
    li.style.transition = "background 0.2s";
    li.style.display = "flex";
    li.style.alignItems = "center";
    li.style.gap = "12px";
    
    li.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#6366f1" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      <span style="font-size: 13px; font-weight: 500; color: var(--color-text-main);">${routine.title}</span>
    `;
    
    li.addEventListener("mouseover", () => li.style.background = "var(--bg-hover)");
    li.addEventListener("mouseout", () => li.style.background = "transparent");
    
    li.addEventListener("click", () => {
      // Highlight selected
      Array.from(listEl.children).forEach(child => child.style.background = "transparent");
      li.style.background = "var(--bg-hover)";
      
      // Load PDF
      openRoutineInViewer(routine);
    });
    
    listEl.appendChild(li);
  });
}

const routineImagesDb = {
  "Instruktion - Anstånd på faktura": {
    mainImage: "images/extracted_anstand_p1_i0.jpg",
    mainTitle: "Bilaga: CRM Fakturalista (Anstånd)",
    mainDesc: "Steg-för-steg: Så registrerar du anstånd på faktura i CRM.",
    images: [
      { path: "images/extracted_anstand_p1_i0.jpg", caption: "Steg 1: Öppna kundens fakturalista i CRM" },
      { path: "images/extracted_anstand_p1_i1.jpg", caption: "Steg 2: Kontrollera fakturans betalningsstatus" },
      { path: "images/extracted_anstand_p2_i0.jpg", caption: "Steg 3: Välj fakturan och klicka 'Anstånd'" },
      { path: "images/extracted_anstand_p2_i1.png", caption: "Steg 4: Reskontrainformation – verifiera saldo" },
      { path: "images/extracted_anstand_p3_i0.png", caption: "Steg 5: Ange nytt förfallodatum" },
      { path: "images/extracted_anstand_p3_i1.png", caption: "Steg 6: Välj antal dagar (max 30 dagar)" },
      { path: "images/extracted_anstand_p4_i0.png", caption: "Steg 7: Registrera och spara ändringen" },
      { path: "images/extracted_anstand_p4_i1.png", caption: "Steg 8: Bekräftelse – anstånd registrerat" }
    ]
  },
  "Instruktion - Kreditera och makulera faktura": {
    mainImage: "images/extracted_kreditera_p1_i0.png",
    mainTitle: "Bilaga: CRM Fakturavy (Kreditera)",
    mainDesc: "Steg-för-steg: Så krediterar eller makulerar du en faktura i CRM.",
    images: [
      { path: "images/extracted_kreditera_p1_i0.png", caption: "Steg 1: Öppna fakturavyn och välj fakturaraden" },
      { path: "images/extracted_kreditera_p1_i1.png", caption: "Steg 2: Klicka 'Makulera' för att ta bort avgiften" },
      { path: "images/extracted_kreditera_p2_i0.png", caption: "Steg 3: Välj 'Kreditera' för delkreditering" },
      { path: "images/extracted_kreditera_p3_i0.png", caption: "Steg 4: Kontrollera attestgränser (maxbelopp)" },
      { path: "images/extracted_kreditera_p3_i1.png", caption: "Steg 5: Välj orsakskod för krediteringen" },
      { path: "images/extracted_kreditera_p3_i2.png", caption: "Steg 6: Ange belopp inom din attestgräns" },
      { path: "images/extracted_kreditera_p3_i3.png", caption: "Steg 7: Fyll i registreringen av delkreditering" },
      { path: "images/extracted_kreditera_p4_i0.png", caption: "Steg 8: Spara och notera ärendenumret" }
    ]
  },
  "Instruktion - Aktivera kundgränssnitt": {
    mainImage: "images/extracted_kundgranssnitt_p1_i0.png",
    mainTitle: "Bilaga: Mina Sidor (Kundgränssnitt)",
    mainDesc: "Steg-för-steg: Så aktiveras kundgränssnittet för realtidsmätning.",
    images: [
      { path: "images/extracted_kundgranssnitt_p1_i0.png", caption: "Steg 1: Gå till 'Elanläggning' på Mina Sidor" },
      { path: "images/extracted_kundgranssnitt_p1_i1.jpg", caption: "Steg 2: Kontrollera mätarmodell (Sanxing/Landis)" },
      { path: "images/extracted_kundgranssnitt_p1_i2.png", caption: "Steg 3: Klicka 'Aktivera' under Lokalt gränssnitt" },
      { path: "images/extracted_kundgranssnitt_p1_i3.png", caption: "Steg 4: Meddelande – aktivering pågår (vänta)" },
      { path: "images/extracted_kundgranssnitt_p2_i0.png", caption: "Steg 5: Verifiera status i WMS-systemet" },
      { path: "images/extracted_kundgranssnitt_p3_i0.png", caption: "Steg 6: Om misslyckad – skapa supportärende" },
      { path: "images/extracted_kundgranssnitt_p3_i1.png", caption: "Steg 7: Välj ärendegrupp 'Kundärenden'" },
      { path: "images/extracted_kundgranssnitt_p3_i2.png", caption: "Steg 8: Välj ärendetyp 'Anslutningsfrågor'" },
      { path: "images/extracted_kundgranssnitt_p4_i0.png", caption: "Steg 9: Sök anläggning i WMS" },
      { path: "images/extracted_kundgranssnitt_p4_i1.png", caption: "Steg 10: Öppna detaljvy för mätartjänster" },
      { path: "images/extracted_kundgranssnitt_p5_i0.png", caption: "Steg 11: Kontrollera mätarfabrikat" },
      { path: "images/extracted_kundgranssnitt_p5_i1.png", caption: "Steg 12: Verifiera 'Electricity' och 'Tillverkare'" },
      { path: "images/extracted_kundgranssnitt_p5_i2.png", caption: "Steg 13: Bekräftelse – gränssnitt aktiverat" }
    ]
  },
  "Instruktion - Felanmälan strömavbrott och övriga iakttagelser": {
    mainImage: "images/extracted_stromavbrott_p3_i2.png",
    mainTitle: "Bilaga: BOSSE Felanmälan (Strömavbrott)",
    mainDesc: "Steg-för-steg: Så registrerar du en felanmälan i BOSSE.",
    images: [
      { path: "images/extracted_stromavbrott_p2_i0.png", caption: "Steg 1: Öppna driftkartan i BOSSE" },
      { path: "images/extracted_stromavbrott_p2_i1.png", caption: "Steg 2: Sök kabelskåp i PoDIS" },
      { path: "images/extracted_stromavbrott_p2_i2.png", caption: "Steg 3: Kontrollera färgkoder (avbrottstyp)" },
      { path: "images/extracted_stromavbrott_p3_i0.png", caption: "Steg 4: Följ frågebatteriet i BOSSE" },
      { path: "images/extracted_stromavbrott_p3_i1.png", caption: "Steg 5: Välj felorsak (Kabelfel/Överlast)" },
      { path: "images/extracted_stromavbrott_p3_i2.png", caption: "Steg 6: Registrera felanmälan på koordinat" },
      { path: "images/extracted_stromavbrott_p4_i0.png", caption: "Steg 7: Ring driftcentralen (telefonnummer)" },
      { path: "images/extracted_stromavbrott_p4_i1.png", caption: "Steg 8: Notera om fara för liv/egendom" },
      { path: "images/extracted_stromavbrott_p4_i2.png", caption: "Steg 9: Skicka arbetsorder till entreprenör" },
      { path: "images/extracted_stromavbrott_p5_i0.png", caption: "Steg 10: Skicka SMS till drabbade kunder" },
      { path: "images/extracted_stromavbrott_p5_i1.png", caption: "Steg 11: Efterkommunikation (statusuppdatering)" },
      { path: "images/extracted_stromavbrott_p5_i2.png", caption: "Steg 12: Registrera ev. Goodwill-kompensation" },
      { path: "images/extracted_stromavbrott_p6_i0.png", caption: "Steg 13: Kontrollera SLA-tid på ärendet" },
      { path: "images/extracted_stromavbrott_p6_i1.png", caption: "Steg 14: Slutrapport från fältet – avsluta" }
    ]
  }
};

function openRoutineInViewer(routine) {
  document.getElementById("lbl-routine-title").textContent = routine.title;
  
  // Hide placeholder
  if (elements.routineViewerPlaceholder) {
    elements.routineViewerPlaceholder.style.display = "none";
  }
  
  // Populate iframe
  if (elements.routineViewerIframeContainer) {
    elements.routineViewerIframeContainer.innerHTML = `<iframe src="${routine.path}" style="width: 100%; height: 100%; border: none;" title="${routine.title}"></iframe>`;
    elements.routineViewerIframeContainer.style.display = "block";
  }
  
  if (elements.routineViewerImagesContainer) {
    elements.routineViewerImagesContainer.style.display = "none";
    elements.routineViewerImagesContainer.innerHTML = "";
  }
  
  // Reset tabs classes
  if (elements.btnRoutinePdfTab && elements.btnRoutineImgTab) {
    elements.btnRoutinePdfTab.classList.add("active");
    elements.btnRoutineImgTab.classList.remove("active");
  }
  
  // Check if routine has images in the database
  const routineData = routineImagesDb[routine.title];
  if (routineData) {
    // Sync with the guide checklist card so that if they go back to the dashboard, it is loaded!
    state.lastMatchedRoutine = routine;
    checkAndShowVisuals();
    // Show tabs row
    if (elements.routineTabsRow) {
      elements.routineTabsRow.style.display = "inline-flex";
    }
    if (elements.routineImgCount) {
      elements.routineImgCount.textContent = routineData.images.length;
    }
    
    // Inject the images grid
    let gridHtml = `<div class="routine-images-grid">`;
    routineData.images.forEach((img) => {
      gridHtml += `
        <div class="routine-img-card" data-src="${img.path}" data-caption="${img.caption}">
          <img src="${img.path}" alt="${img.caption}">
          <div class="routine-img-card-overlay">
            <div class="routine-img-card-title">${routine.title}</div>
            <div class="routine-img-card-desc">${img.caption}</div>
          </div>
        </div>
      `;
    });
    gridHtml += `</div>`;
    
    if (elements.routineViewerImagesContainer) {
      elements.routineViewerImagesContainer.innerHTML = gridHtml;
      
      // Bind click events on new image cards → open carousel at clicked index
      const cards = elements.routineViewerImagesContainer.querySelectorAll(".routine-img-card");
      const allImages = routineData.images.map(img => ({ src: img.path, caption: img.caption }));
      cards.forEach((card, index) => {
        card.addEventListener("click", () => {
          if (window._openLightboxCarousel) {
            window._openLightboxCarousel(allImages, index);
          }
        });
      });
    }
  } else {
    // No images, hide tabs row
    if (elements.routineTabsRow) {
      elements.routineTabsRow.style.display = "none";
    }
  }
}

// Setup search listener for routines
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("txt-routine-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderRoutinesLibrary(e.target.value);
    });
  }
});

// =========================================================================
// SYSTEM GUIDE VISUAL SCREENSHOTS DATABASE & HELPER LOGIC
// =========================================================================

const systemVisuals = [
  {
    keywords: ["stil", "profil", "skrivstil", "reglage", "slider", "metric", "nivå", "stilprofil", "justera", "sliders", "stilen"],
    title: "Inlärd AI-Skrivstil & Personprofil",
    desc: "AI:n läser kontinuerligt av hur du anpassar texterna och uppdaterar stilprofilen till höger. Detta kan ställas in med reglagen för formalitet, längd och tilltal.",
    image: "images/media__1779303896905.png"
  },
  {
    keywords: ["signatur", "namn", "göran", "releasyson", "avatar", "profil", "express", "support", "kontaktuppgifter", "handläggare", "signature"],
    title: "Profil & Signaturkod",
    desc: "Dina kontaktuppgifter, roll och den unika signaturkoden (t.ex. //xsimsgus ks privat) laddas automatiskt in längst ner till vånster och läggs till i slutet av varje svar.",
    image: "images/media__1779303085574.png"
  },
  {
    keywords: ["kopiera", "skicka", "svara", "knappar", "urklipp", "skicka svar", "svara kund", "e-post", "e-mail", "knapparna"],
    title: "Åtgärdsknappar & Kopiering",
    desc: "När du är nöjd med mailet kan du kopiera det till urklipp eller svara kunden direkt via knapparna i botten.",
    image: "images/media__1779303258112.png"
  },
  {
    keywords: ["snabbknappar", "chips", "ton", "formell ton", "översätt", "kompensation", "korta", "mallar", "förslag", "suggestion"],
    title: "AI Snabbknappar (Suggestion Chips)",
    desc: "Använd snabbknapparna ovanför editorn för att snabbt ändra ton, korta ner texten eller erbjuda kompensation till kunden med ett enda klick.",
    image: "images/media__1779302824583.png"
  },
  {
    keywords: ["förenklare", "copilot", "editor", "redigera", "skriva om", "textområde", "papper", "magic"],
    title: "Releasy AI Förenklare & Editor",
    desc: "Editorn är helt interaktiv. AI:ns förslag visas här och du kan skriva fritt, redigera texten och be Copiloten om ändringar via promptfältet.",
    image: "images/media__1779303123982.png"
  },
  {
    keywords: ["demosystem", "översikt", "dashboard", "layout", "gränssnitt", "hur funkar", "hjälp", "allmänt", "översiktsbild", "releasy ai"],
    title: "Översikt: Releasy Dashboard",
    desc: "En komplett bild av hela demosystemet med kpi-mätare, kundinformation till vänster, ärendelista och den intelligenta Copiloten till höger.",
    image: "images/media__1779302855616.png"
  },
  {
    keywords: ["kreditera", "makulera", "faktura", "kreditering", "fakturahjälp", "fakturahantering"],
    title: "CRM: Fakturahantering & Kreditering",
    desc: "I detta systemfönster kan du kreditera eller makulera kundfakturor enligt gällande attestregler.",
    image: "images/media__1779302720075.png"
  },
  {
    keywords: ["kundbild", "crm", "avtal", "kundkort", "kundinformation", "abonnemang"],
    title: "CRM: Kundbild & Avtal",
    desc: "Här ser du kundens aktuella abonnemangskort, kontaktuppgifter och fullständiga avtalshistorik.",
    image: "images/media__1779303372436.png"
  },
  {
    keywords: ["flyttanmälan", "flytt", "grid", "utflytt", "inflytt", "anläggning"],
    title: "GRID: Flyttanmälan & Systemvy",
    desc: "Används för att registrera in- och utflyttningar på anläggningar direkt i elnätets GRID-system.",
    image: "images/media__1779303414803.png"
  },
  {
    keywords: ["realtidsmätning", "realtid", "mätning", "förbrukning", "elmätare", "kundgränssnitt"],
    title: "Kundgränssnitt: Realtidsmätning",
    desc: "Visar kundens elförbrukning i realtid direkt via den smarta mätarens kundport.",
    image: "images/media__1779303338835.png"
  },
  {
    keywords: ["felanmälan", "bosse", "avbrott", "strömavbrott", "felanmäl", "kabelskåp"],
    title: "BOSSE: Felanmälan & Driftstörning",
    desc: "I felanmälanssystemet BOSSE kan du registrera pågående driftavbrott, se felaktiga kabelskåp och beställa tekniker.",
    image: "images/media__1779303442389.png"
  }
];

function checkAndShowVisuals(promptText) {
  if (!elements.cardSystemGuide) return;
  
  // ONLY show images from actual routine PDFs – no generic screenshots
  const hasRoutineImages = state.lastMatchedRoutine && routineImagesDb[state.lastMatchedRoutine.title];
  
  if (!hasRoutineImages) {
    // No routine images → hide the card entirely
    elements.cardSystemGuide.style.transition = "all 0.3s ease";
    elements.cardSystemGuide.style.opacity = "0";
    elements.cardSystemGuide.style.transform = "translateY(10px)";
    setTimeout(() => {
      elements.cardSystemGuide.style.display = "none";
    }, 300);
    return;
  }
  
  const routineData = routineImagesDb[state.lastMatchedRoutine.title];
  const images = routineData.images;
  const totalImages = images.length;
  
  // State for the inline mini-carousel
  state._guideImageIndex = 0;
  state._guideImages = images;
  
  // Populate card details
  const shortTitle = state.lastMatchedRoutine.title.replace("Instruktion - ", "");
  elements.systemGuideTitle.textContent = shortTitle;
  
  // Always reset stepper state when a new routine is shown from the copilot/analysis flow
  // (Progress memory only persists for manual navigation in the Rutinbibliotek tab)
  state._currentStep = 0;
  state._stepsCompleted[state.lastMatchedRoutine.title] = Array(totalImages).fill(false);
  
  // Build step-by-step image grid with numbering (For Gallery mode)
  const thumbContainer = document.getElementById("system-guide-thumbnails");
  if (thumbContainer) {
    const thumbRow = thumbContainer.querySelector("div");
    thumbRow.style.cssText = "padding: 4px 0;";
    const cardsHtml = images.map((img, i) => {
      const shortCaption = img.caption.replace(/^Sida\s*\d+\s*-\s*/i, "").trim();
      const truncCaption = shortCaption.length > 40 ? shortCaption.substring(0, 38) + "…" : shortCaption;
      return `
      <div class="guide-step-card" data-index="${i}" style="
        position: relative; cursor: pointer; border-radius: 10px;
        border: 2px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.02);
        overflow: hidden; transition: all 0.2s ease;
      ">
        <div style="position: absolute; top: 4px; left: 4px; background: rgba(100,100,120,0.7);
          color: #fff; font-size: 10px; font-weight: 700; width: 20px; height: 20px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 2;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);">${i + 1}</div>
        <img src="${img.path}" alt="${img.caption}" 
          style="width: 100%; height: 70px; object-fit: cover; display: block;"
          class="guide-thumb-img">
        <div style="padding: 4px 6px; font-size: 10px; color: var(--color-text-muted); 
          line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
          title="${shortCaption}">${truncCaption}</div>
      </div>`;
    }).join("");
    
    thumbRow.innerHTML = `
      <div style="font-size: 11px; font-weight: 600; color: var(--ai-purple); 
        margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
        📋 Galleriöversikt (klicka på en bild för att zooma):
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
        ${cardsHtml}
      </div>`;
    thumbContainer.style.display = "none"; // hidden by default in stepper mode
    
    // Step card click handler inside Gallery mode
    thumbRow.querySelectorAll(".guide-step-card").forEach(card => {
      card.addEventListener("click", (e) => {
        const idx = parseInt(card.getAttribute("data-index"));
        
        // Open lightbox at this index directly
        const formattedImages = images.map(img => ({ src: img.path, caption: img.caption }));
        if (window._openLightboxCarousel) {
          window._openLightboxCarousel(formattedImages, idx);
        }
      });
      
      // Hover effects
      card.addEventListener("mouseenter", () => {
        card.style.borderColor = "rgba(99,102,241,0.4)";
        card.style.background = "rgba(99,102,241,0.04)";
      });
      card.addEventListener("mouseleave", () => {
        card.style.borderColor = "rgba(255,255,255,0.08)";
        card.style.background = "rgba(255,255,255,0.02)";
      });
    });
  }
  
  // Set stepper mode as default and render it!
  setGuideMode("stepper");
  
  // Remove old badge if exists
  const oldBadge = document.getElementById("system-guide-img-count");
  if (oldBadge) oldBadge.remove();
  
  // Smooth fade/slide in
  elements.cardSystemGuide.style.opacity = "0";
  elements.cardSystemGuide.style.display = "flex";
  elements.cardSystemGuide.style.transform = "translateY(10px)";
  
  setTimeout(() => {
    elements.cardSystemGuide.style.transition = "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
    elements.cardSystemGuide.style.opacity = "1";
    elements.cardSystemGuide.style.transform = "translateY(0)";
  }, 50);
}

// =========================================================================
// SYSTEM GUIDE STEPPER CONTROLLER LOGIC
// =========================================================================

function setGuideMode(mode) {
  state.guideMode = mode;
  if (mode === "stepper") {
    if (elements.guideModeStepperBtn) elements.guideModeStepperBtn.classList.add("active");
    if (elements.guideModeGalleryBtn) elements.guideModeGalleryBtn.classList.remove("active");
    
    if (elements.stepperProgressBox) elements.stepperProgressBox.style.display = "flex";
    if (elements.stepperStepsList) {
      elements.stepperStepsList.style.display = "flex";
      elements.stepperStepsList.scrollTop = 0; // reset scroll position
    }
    const _thumbEl = document.getElementById("system-guide-thumbnails");
    if (_thumbEl) _thumbEl.style.display = "none";
    
    updateStepperUI();
  } else {
    if (elements.guideModeStepperBtn) elements.guideModeStepperBtn.classList.remove("active");
    if (elements.guideModeGalleryBtn) elements.guideModeGalleryBtn.classList.add("active");
    
    if (elements.stepperProgressBox) elements.stepperProgressBox.style.display = "none";
    if (elements.stepperStepsList) elements.stepperStepsList.style.display = "none";
    const _thumbEl2 = document.getElementById("system-guide-thumbnails");
    if (_thumbEl2) _thumbEl2.style.display = "block";
  }
}

function updateStepperUI() {
  if (!state.lastMatchedRoutine) return;
  const routineTitle = state.lastMatchedRoutine.title;
  const routineData = routineImagesDb[routineTitle];
  if (!routineData) return;
  
  const images = routineData.images;
  const totalSteps = images.length;
  
  // Ensure we have a completion map for this routine
  if (!state._stepsCompleted[routineTitle]) {
    state._stepsCompleted[routineTitle] = Array(totalSteps).fill(false);
  }
  
  const completedArr = state._stepsCompleted[routineTitle];
  
  // Find first unchecked step to calculate sequential locking
  let firstUncheckedIndex = completedArr.indexOf(false);
  if (firstUncheckedIndex === -1) {
    firstUncheckedIndex = totalSteps; // All completed
  }
  
  // Update header progress counters
  const completedCount = completedArr.filter(Boolean).length;
  if (elements.systemGuideImgCounter) {
    elements.systemGuideImgCounter.textContent = `${completedCount} / ${totalSteps} klara`;
  }
  if (elements.stepperProgressText) {
    elements.stepperProgressText.textContent = `Steg utförda: ${completedCount} av ${totalSteps}`;
  }
  
  const progressPct = Math.round((completedCount / totalSteps) * 100);
  if (elements.stepperProgressPct) {
    elements.stepperProgressPct.textContent = `${progressPct}% klart`;
  }
  if (elements.stepperProgressBar) {
    elements.stepperProgressBar.style.width = `${progressPct}%`;
  }
  
  // Build vertical steps list
  if (elements.stepperStepsList) {
    let stepsHtml = "";
    images.forEach((img, i) => {
      // Step state calculations
      const isCompleted = completedArr[i] === true;
      const isLocked = i > firstUncheckedIndex;
      
      const shortCaption = img.caption.replace(/^Sida\s*\d+\s*-\s*/i, "").trim();
      
      stepsHtml += `
        <div class="stepper-step-row ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}" data-step="${i}">
          <div class="stepper-step-header">
            <div class="stepper-step-checkbox ${isCompleted ? 'checked' : ''}" data-step="${i}" title="${isLocked ? 'Slutför föregående steg först' : 'Markera som klar'}">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" class="check-icon">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span class="lock-icon">🔒</span>
            </div>
            <div class="stepper-step-title-area">
              <span class="stepper-step-number">STEG ${i + 1} ${isCompleted ? '✅ UTFÖRT' : ''}</span>
              <span class="stepper-step-desc">${shortCaption}</span>
            </div>
          </div>
          <div class="stepper-step-body">
            <div class="stepper-step-img-wrapper" data-step-idx="${i}">
              <img src="${img.path}" alt="${img.caption}" class="stepper-step-img">
              <div class="stepper-step-img-overlay">
                <span>🔍 Klicka för helskärm</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    
    // Add "Slutför rutin" button at the bottom if everything is completed!
    if (completedCount === totalSteps) {
      stepsHtml += `
        <div class="stepper-finish-container">
          <button id="btn-stepper-finish-rutin" class="btn-stepper-finish">
            Slutför rutin 🎉
          </button>
        </div>
      `;
    }
    
    elements.stepperStepsList.innerHTML = stepsHtml;
    
    // BIND EVENTS dynamically!
    
    // 1. Checkboxes click handler
    elements.stepperStepsList.querySelectorAll(".stepper-step-checkbox").forEach(box => {
      box.addEventListener("click", (e) => {
        e.stopPropagation();
        const stepIdx = parseInt(box.getAttribute("data-step"));
        
        // Prevent click if locked
        if (stepIdx > firstUncheckedIndex) {
          showToast("Slutför föregående steg i ordning! 🔒");
          return;
        }
        
        // Toggle completion status
        completedArr[stepIdx] = !completedArr[stepIdx];
        
        // Force auto-complete preceding steps if user checks a step ahead (security/comfort)
        if (completedArr[stepIdx]) {
          for (let prevIdx = 0; prevIdx < stepIdx; prevIdx++) {
            completedArr[prevIdx] = true;
          }
        } else {
          // If unchecking, force uncheck all succeeding steps (integrity)
          for (let nextIdx = stepIdx + 1; nextIdx < totalSteps; nextIdx++) {
            completedArr[nextIdx] = false;
          }
        }
        
        showToast(completedArr[stepIdx] ? `Steg ${stepIdx + 1} markerat som klart! ✅` : `Steg ${stepIdx + 1} avmarkerat.`);
        
        // Re-render UI
        updateStepperUI();
      });
    });
    
    // 2. Image wrappers for Zoom Carousel Lightbox
    elements.stepperStepsList.querySelectorAll(".stepper-step-img-wrapper").forEach(wrapper => {
      wrapper.addEventListener("click", () => {
        const stepIdx = parseInt(wrapper.getAttribute("data-step-idx"));
        
        // Open lightbox at this index
        const formattedImages = images.map(item => ({ src: item.path, caption: item.caption }));
        if (window._openLightboxCarousel) {
          window._openLightboxCarousel(formattedImages, stepIdx);
        }
      });
    });
    
    // 3. Finish button
    const finishBtn = elements.stepperStepsList.querySelector("#btn-stepper-finish-rutin");
    if (finishBtn) {
      finishBtn.addEventListener("click", () => {
        triggerStepperCelebration();
      });
    }
  }
}

function triggerStepperCelebration() {
  if (!elements.stepperCelebrationOverlay) return;
  
  elements.stepperCelebrationOverlay.style.display = "flex";
  
  // Force a tiny layout reflow to make transition run
  elements.stepperCelebrationOverlay.offsetHeight;
  elements.stepperCelebrationOverlay.classList.add("active");
  
  const innerCard = elements.stepperCelebrationOverlay.querySelector(".glass");
  if (innerCard) {
    innerCard.style.transform = "scale(1)";
  }
  
  // Confetti particles!
  const emojis = ["🎉", "✨", "🌟", "🚀", "👏", "🏆", "💖", "⚡"];
  const particleCount = 45;
  const overlay = elements.stepperCelebrationOverlay;
  
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement("div");
    p.className = "emoji-particle";
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    
    p.style.left = `${Math.random() * 100}vw`;
    p.style.top = `-50px`;
    p.style.animationDelay = `${Math.random() * 1.8}s`;
    
    const size = 16 + Math.random() * 24;
    p.style.fontSize = `${size}px`;
    
    const duration = 2.5 + Math.random() * 3.5;
    p.style.animationDuration = `${duration}s`;
    
    overlay.appendChild(p);
    
    // Clean up
    setTimeout(() => {
      p.remove();
    }, (2 + duration) * 1000);
  }
}

// Upgraded Spelling/Grammar Correction Engine
function runGrammarCorrection() {
  const container = elements.txtAiDraft;
  let text = container.textContent;
  
  const corrections = [
    { regex: /\bain\b/gi, replacement: "AI:n" },
    { regex: /\bain:s\b/gi, replacement: "AI:ns" },
    { regex: /\bmst\b/gi, replacement: "måste" },
    { regex: /\bocxh\b/gi, replacement: "och" },
    { regex: /\bochj\b/gi, replacement: "och" },
    { regex: /\bgö\b/gi, replacement: "göra" },
    { regex: /\banl\b/gi, replacement: "anläggning" },
    { regex: /\bpersnr\b/gi, replacement: "personnummer" },
    { regex: /\breleasy\b/g, replacement: "Releasy" }
  ];
  
  let changed = false;
  let newText = text;
  
  corrections.forEach(corr => {
    // Use dynamic string replace to ensure global correction
    const origText = newText;
    newText = newText.replace(corr.regex, corr.replacement);
    if (newText !== origText) {
      changed = true;
    }
  });
  
  if (changed) {
    container.textContent = newText;
    return true;
  }
  return false;
}

// Deep routine RAG synthesis & "Snabbguide & Lathund" generator
function synthesizeRoutineSolution(title, content) {
  const titleLower = title.toLowerCase();
  
  // Custom Sweden-themed synthesized lathund for Anstånd
  if (titleLower.includes("anstånd")) {
    return `### ⚡ SNABBGUIDE & LATHUND: Bevilja anstånd på faktura
1. **Kontrollera historik:** Kontrollera i CRM att kunden inte har tidigare obetalda eller förfallna anstånd, samt saknar aktiva inkassokrav.
2. **Maximal tid:** Anstånd kan beviljas i maximalt 30 dagar från fakturans ursprungliga förfallodatum.
3. **Registrera i CRM:** Gå till fliken *Faktura & Reskontra*, välj den aktuella fakturan och klicka på **Flytta förfallodatum**.
4. **Välj nytt datum:** Sätt det nya förfallodatumet (max +30 dagar) och spara ändringarna.
5. **Bekräfta:** Informera kunden om det nya förfallodatumet och att en bekräftelse har skickats via e-post eller SMS.`;
  }
  
  // Custom Sweden-themed synthesized lathund for Kreditera
  if (titleLower.includes("kreditera") || titleLower.includes("makulera")) {
    return `### ⚡ SNABBGUIDE & LATHUND: Kreditera faktura
1. **Skapa Attestlogg:** Skapa en attestlogg i CRM enligt reglerna i rutinen "Attestregelverk".
2. **Hitta Fakturan:** Gå till fliken *Kontrakt-/Faktura Adm* och markera den faktura som ska korrigeras.
3. **Visa Detaljer:** Klicka på knappen **Visa faktura** för att se alla fakturarader.
4. **Skapa Ärende:** Klicka på **Nytt ärende** för att initiera krediteringen i CRM.
5. **Utför:** Ange orsak, belopp och spara. Systemet skapar en automatisk kreditfaktura.`;
  }
  
  // Custom lathund for Påminnelse
  if (titleLower.includes("påminnelse")) {
    return `### ⚡ SNABBGUIDE & LATHUND: Hantera påminnelseavgift
1. **Kontrollera:** Sök upp kunden i CRM och gå till fliken *Faktura & Reskontra*. Kontrollera om det finns en aktiv påminnelseavgift.
2. **Bedöm:** Kontrollera om avgiften är korrekt debiterad. Var fakturan verkligen förfallen innan påminnelsen skickades?
3. **Ta bort/Kreditera:** Om avgiften ska tas bort, klicka på fakturaraden med påminnelseavgiften och välj **Kreditera**. Ange orsakskod.
4. **Attestera:** Kontrollera att beloppet ligger inom din attestgräns. Annars eskalera till teamledare.
5. **Informera kunden:** Meddela kunden att påminnelseavgiften är borttagen och att ingen ytterligare åtgärd krävs.`;
  }
  
  // Custom lathund for Avbetalningsplan / avbetalning
  if (titleLower.includes("avbetalningsplan") || titleLower.includes("avbetalning")) {
    return `### ⚡ SNABBGUIDE & LATHUND: Avbetalningsplan
1. **Kolla villkor:** Kontrollera att kunden inte har aktiva inkassoärenden. Avbetalningsplan kan beviljas om grundkraven uppfylls.
2. **Två delbetalningar:** Om kunden endast önskar dela upp sin faktura på två betalningar, görs detta avgiftsfritt direkt i kundkortet.
3. **Längre uppdelning:** För 3-6 månader tillkommer en uppläggningsavgift på 150 kr samt aviseringsavgifter.
4. **Registrera:** Lägg till betalningsplanen under fliken *Faktura & Reskontra* och skicka bekräftelsen till kunden.`;
  }
  
  // Custom lathund for GRID Flytt / flyttanmälan
  if (titleLower.includes("flytt") || titleLower.includes("grid")) {
    return `### ⚡ SNABBGUIDE & LATHUND: Flyttanmälan i GRID
1. **Identifiera anläggning:** Hämta anläggnings-ID (18 siffror som börjar på 735) och säkerställ rätt adress i GRID.
2. **Utflytt:** Registrera utflyttningsdatum (måste göras med minst 5 dagars framförhållning).
3. **Inflytt:** Registrera den nya kunden på anläggningen, välj avtalstyp (t.ex. Rörligt elavtal privat).
4. **Slutför:** Bekräfta e-post/SMS och informera om att inkopplingen sker inom 2-5 arbetsdagar.`;
  }

  // Custom lathund for Realtidsmätning
  if (titleLower.includes("realtid") || titleLower.includes("mätning")) {
    return `### ⚡ SNABBGUIDE & LATHUND: Aktivera Realtidsmätning
1. **Verifiera mätare:** Kontrollera i CRM att kunden har en modern smart elmätare installerad.
2. **Öppna kundporten:** Aktivera HAN-porten (RJ12/RJ45) på elmätaren via systemfliken *Mätarinställningar*.
3. **Informera:** Meddela kunden att porten är öppen och att de kan ansluta sin realtidsmätare (t.ex. Tibber Pulse eller liknande).
4. **Test:** Gör en realtidsavläsning från systemet för att bekräfta att signalen skickas ok.`;
  }

  // Custom lathund for Felanmälan strömavbrott / avgrävd kabel / BOSSE
  if (titleLower.includes("felanmälan") || titleLower.includes("strömavbrott") || titleLower.includes("bosse")) {
    return `### ⚡ SNABBGUIDE & LATHUND: Felanmälan strömavbrott / Avgrävd kabel

**⚠️ Innan du registrerar – kontrollera alltid:**
- Kontrollera Anläggnings-ID och status i WMS (ska vara **Aktiv**)
- Om status är *Från. avtalsbrott* → hänvisa till kravet (se rutin Återinkoppling)
- Om kund bor i lägenhet → kolla om fler på servisen berörs

**🔧 Steg-för-steg:**
1. **Sök kund i BOSSE** via anläggnings-ID
2. **Följ frågebatteriet:** Välj helt utan / delvis utan (fasfel) / blinkningar
3. **Registrera felanmälan** – ärendet går automatiskt till driftcentralen
4. **Kolla PoDIS-kartan** – se om fler kunder berörs av samma avbrott

**📞 Ring alltid driftcentralen om:**
- Avgrävd kabel, öppna kabelskåp, misstänkt nollfel
- Fara för liv (ledning på marken, nedbrunnet hus)
- Akut brytning samma dag
- Stockholm: 054-55 84 51 | Övriga: 054-55 82 60`;
  }

  // Custom lathund for Inkasso
  if (titleLower.includes("inkasso") || titleLower.includes("kronofogde")) {
    return `### ⚡ SNABBGUIDE & LATHUND: Inkassoärenden
1. **Kontrollera skuld:** Sök upp kundens obetalda fakturor i CRM under *Faktura & Reskontra*.
2. **Betalningsinformation:** Ge kunden information om utestående skuld och hänvisa till Intrum för betalning.
3. **Vila inkasso:** Om det finns skäl, registrera en vilaperiod i CRM enligt attestregler.
4. **Dokumentera:** Logga ärendet med korrekt ärendehanteringskod.`;
  }

  // Custom lathund for Autogiro
  if (titleLower.includes("autogiro")) {
    return `### ⚡ SNABBGUIDE & LATHUND: Autogiro
1. **Anmäla:** Kunden kan anmäla autogiro via Mina Sidor, appen eller genom att kontakta kundservice.
2. **Registrera:** Registrera kundens bankkontonummer i CRM under *Betalningssätt*.
3. **Bekräfta:** Informera kunden om att autogirot aktiveras inom 1-2 bankdagar.
4. **Avsluta:** Om kunden vill avsluta autogiro, ta bort registreringen i CRM och informera om övergång till pappersfaktura.`;
  }

  // Custom lathund for Samlingsfaktura
  if (titleLower.includes("samlingsfaktura")) {
    return `### ⚡ SNABBGUIDE & LATHUND: Ta bort samlingsfaktura
1. **Fakturerad konfig:** Sök fram kunden i *Kontrakt-/Faktura Adm*. Markera anläggningen som ska flyttas.
2. **Ny kund/kontrakt:** Klicka på *Ny kund/kontrakt*, välj startdatum (1:a i månaden efter senast fakturerad dag).
3. **Välj kontrakt:** Dubbelklicka på befintligt kontrakt så det hamnar i *Valda kontrakt*. Klicka Nästa.
4. **Slutför:** Välj befintlig eller ny konfiguration, sätt faktureringsintervall, och klicka *Slutföra*.
5. **Kontrollera:** Verifiera utskicksmetod och fakturaadress. Lägg ärende med kod INVOICE.`;
  }

  // Custom lathund for Uppsägning / dödsbo
  if (titleLower.includes("uppsägning") || titleLower.includes("avslut") || titleLower.includes("säga upp")) {
    return `### ⚡ SNABBGUIDE & LATHUND: Uppsägning av elavtal
1. **Kontrollera bindningstid:** Sök kunden i CRM och kontrollera om nuvarande avtal har bindningstid. Informera om ev. avgift.
2. **Varseltid:** Elavtal kan normalt sägas upp med 5 dagars varsel. Nätavtalet följer flytt- eller avregistreringsdatum.
3. **Registrera:** Registrera uppsägning under kundens kontrakt i CRM. Välj orsak (byte leverantör / utflytt / dödsbo).
4. **Slutfaktura:** Informera kunden om att en slutfaktura skickas efter avläsning av mätaren.
5. **Bekräfta:** Skicka bekräftelse via e-post med uppsägningsdatum och information om slutfaktura.`;
  }

  // Custom lathund for Dödsbo
  if (titleLower.includes("dödsbo")) {
    return `### ⚡ SNABBGUIDE & LATHUND: Dödsboärende
1. **Kontrollera behörighet:** Kräv fullmakt eller dödsbevis + arvingsintyg innan åtgärd.
2. **Informera:** Dödsboet ansvarar för betalning av fakturor tills avtal är avslutat eller överlåtet.
3. **Avsluta:** Om dödsboet vill avsluta avtalet, registrera utflytt/avregistrering på aktuellt datum.
4. **Överlåta:** Om ny innehavare tar över — registrera inflytt på den person som tar över anläggningen.
5. **Notera ärendet:** Logga ärendekod DOBSBO i CRM vid alla dödsboärenden.`;
  }

  // Custom lathund for Fullmakt / ombud
  if (titleLower.includes("fullmakt") || titleLower.includes("ombud")) {
    return `### ⚡ SNABBGUIDE & LATHUND: Fullmakt & ombud
1. **Kräv skriftlig fullmakt:** Muntlig fullmakt accepteras inte — kunden måste skicka in signerad fullmakt via e-post, brev eller Mina Sidor.
2. **Kontrollera innehåll:** Fullmakten ska innehålla fullmaktsgivarens namn, personnummer, vad ombudet bemyndigas att göra, och ombudets namn.
3. **Registrera:** Notera fullmakten i CRM under kundens ärende. Bifoga dokument.
4. **Giltighetstid:** Kontrollera om fullmakten har ett utgångsdatum. Om saknas, gäller den tills vidare.
5. **Sekretesskydd:** Om kunden har sekretesskydd — kontakta alltid kunden direkt för verifiering oavsett fullmakt.`;
  }

  // Custom lathund for Mätarbyte / elmätare
  if (titleLower.includes("mätarbyte") || titleLower.includes("elmätare") || titleLower.includes("mätarflytt")) {
    return `### ⚡ SNABBGUIDE & LATHUND: Mätarbyte & elmätare
1. **Kontrollera mätartyp:** Se i WMS vilket mätarfabrikat kunden har (Landis+Gyr, Aidon, Sanxing m.fl.).
2. **Beställ byte:** Om mätaren är defekt eller fel — skapa ärende i WMS med ärendetyp *Mätarbyte*.
3. **Mätvärden:** Verifiera att timvärden rapporteras korrekt. Om mätvärden saknas > 3 dygn → eskalera.
4. **Kund-info:** Informera kunden om att ett nytt mätarserienummer skickas i bekräftelsen och att avläsning sker automatiskt.
5. **Mätarflytt:** Vid flytt av mätarplats — kontakta nätavdelningen, det är ett servisarbete.`;
  }

  // Custom lathund for Sekretesskyddade kunder
  if (titleLower.includes("sekretess") || titleLower.includes("skyddad identitet")) {
    return `### ⚡ SNABBGUIDE & LATHUND: Sekretesskyddade kunder
1. **Identifiera:** CRM markerar sekretesskyddade kunder med en röd flagga. Hantera med extra försiktighet.
2. **Kommunikation:** Skicka ALDRIG faktura eller brev till folkbokföringsadress. Kontrollera alltid separat fakturaadress i CRM.
3. **Inga uppgifter per telefon:** Bekräfta aldrig kundens adress, telefonnummer eller avtalsstatus via telefon utan BankID-verifiering.
4. **Mina Sidor:** Kunden kan hantera sitt ärende säkert via inloggning på Mina Sidor med BankID.
5. **Notera:** Logga alla kontakter under ärendehistorik med kod SEKRETESS.`;
  }

  // Custom lathund for Laddbox / elbil
  if (titleLower.includes("laddbox") || titleLower.includes("elbil") || titleLower.includes("evify") || titleLower.includes("laddning")) {
    return `### ⚡ SNABBGUIDE & LATHUND: Laddbox & elbil (Evify)
1. **Beställa laddbox:** Hänvisa kunden till Evify-portalen eller Mina Sidor → Laddbox-tjänst.
2. **Installation:** En behörig elektriker (Evify-partner) kontaktar kunden för installation inom 5-10 arbetsdagar.
3. **Säkring:** Kontrollera att kundens huvudsäkring klarar laddboxens effektuttag (7,4 kW = 32A-säkring rekommenderas).
4. **Fakturering:** Laddtjänsten faktureras separat av Evify. Elförbrukningen visas på Releasy-fakturan som vanligt.
5. **Problem:** Tekniska problem med laddboxen hanteras av Evify supporten — hänvisa kunden dit.`;
  }

  // Custom lathund for Avbrottsersättning / kompensation
  if (titleLower.includes("avbrottsersättning") || titleLower.includes("ersättning") || titleLower.includes("kompensation") || titleLower.includes("skadestånd")) {
    return `### ⚡ SNABBGUIDE & LATHUND: Avbrottsersättning
1. **Rätt till ersättning:** Kund har rätt till ersättning vid planerat avbrott > 12h (förvarning) eller oplanerat > 12h.
2. **Beräkna:** Ersättning är 10% av nätavgiften per påbörjad 12-timmarsperiod (min 100 kr, max 300% av nätavgiften/år).
3. **Automatisk utbetalning:** Avbrottsersättning beräknas och betalas ut automatiskt via kreditnota på nästa faktura.
4. **Skadestånd:** Krav på skadestånd (t.ex. matförstöring, vattenskada) hanteras av skadeavdelningen — skicka ärendet vidare med kod SKADA.
5. **Goodwill:** Om kunden inte är berättigad till ersättning men är missnöjd — kan goodwill-kredit beviljas inom attestgräns.`;
  }

  // Custom lathund for Nyanslutning / ny anslutning
  if (titleLower.includes("nyanslutning") || titleLower.includes("ny anslutning") || titleLower.includes("tillfällig anslutning")) {
    return `### ⚡ SNABBGUIDE & LATHUND: Nyanslutning
1. **Beställ via webb:** Hänvisa kunden till Releasy.se → Anslutning → Nyanslutning. Formuläret skickas till nätavdelningen.
2. **Handläggningstid:** En nyanslutning tar normalt 3-6 veckor beroende på typ och var i nätet.
3. **Kostnad:** Anslutningsavgiften beror på kabeldragningsavstånd och säkringsstorlek — kunden får en offert.
4. **Tillfällig anslutning:** Bokning av tillfällig byggström — beställ via ärende i CRM med kod TILLANSL.
5. **Följ upp:** Skapa ett uppföljningsärende 3 veckor efter beställning om kunden inte fått besked.`;
  }

  // Custom lathund for Solceller / mikroproduktion
  if (titleLower.includes("solceller") || titleLower.includes("mikroproduktion") || titleLower.includes("produktion")) {
    return `### ⚡ SNABBGUIDE & LATHUND: Solceller & mikroproduktion
1. **Anmäl installation:** Kunden måste anmäla solcellsinstallation till Releasy INNAN driftsättning via formuläret på Releasy.se.
2. **Inmatningsavtal:** Teckna inmatningsavtal i CRM under kundens kontrakt → *Ny produktionsanläggning*.
3. **Mätaruppdatering:** Releasy skickar en elmätare som kan mäta inmatning (tvåriktad mätning). Leveranstid 3-5 veckor.
4. **Ersättning:** Överskottsel ersätts av elhandlaren (ej Releasy). Kunden ansöker om ROT-avdrag via Skatteverket.
5. **Problem:** Om inmatningsvärden saknas efter driftsättning — skapa ärende i WMS med typ *Produktionsanläggning*.`;
  }
  
  // Generic intelligent parser if no custom template matches
  const lines = content.split('\n');
  const actionSteps = [];
  const importantInfo = [];
  
  lines.forEach(line => {
    const trimmed = line.trim();
    // Match numbered steps, bullet points
    if (/^[0-9]+[.)\s]/.test(trimmed) && trimmed.length > 10 && trimmed.length < 200) {
      actionSteps.push(trimmed);
    } else if (/^[•\-\*]\s/.test(trimmed) && trimmed.length > 10) {
      actionSteps.push(trimmed);
    } else if (trimmed.toLowerCase().includes("ska") || trimmed.toLowerCase().includes("måste") || trimmed.toLowerCase().includes("klicka på") || trimmed.toLowerCase().includes("kontakta") || trimmed.toLowerCase().includes("hänvisa")) {
      if (trimmed.length > 15 && trimmed.length < 150 && importantInfo.length < 8) {
        importantInfo.push(`- ${trimmed}`);
      }
    }
  });
  
  // Prefer numbered steps, fall back to extracted important info
  const bestSteps = actionSteps.length >= 3 ? actionSteps : (importantInfo.length > 0 ? importantInfo : actionSteps);
  
  if (bestSteps.length > 0) {
    return `### ⚡ SNABBGUIDE & LATHUND: Steg-för-steg\n${bestSteps.slice(0, 8).join('\n')}`;
  }
  
  return `### ⚡ SNABBGUIDE & LATHUND: Snabbåtgärd\n- Läs igenom rutinen och utför stegen i CRM-systemet.\n- Kontrollera att kunduppgifter stämmer överens med kontraktet.\n- Registrera ärendet och spara historiken i CRM vid stängning.`;
}
