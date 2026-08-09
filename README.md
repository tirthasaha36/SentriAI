# Sentri — Health Records, Decoded

**The healthcare system already has the data. Sentri makes that data usable.**

Four tools for the parts of healthcare that actually block people: understanding the paperwork, catching medication conflicts, seeing where your numbers are heading, and getting the consultation written down.

**Sentri does not diagnose.** Every feature takes information that already exists — a drug label, a discharge summary, your own lab history, or what your doctor just said — and makes it usable.

That is a deliberate design choice: diagnosis is the most regulated, hardest-to-validate, least differentiated thing software can attempt, and it is not where people are actually stuck.

> **Sentri doesn't try to make AI the doctor. It makes the information around the doctor understandable, verifiable and actionable.**

---

## The Four Features

### 1. Medicine Safety Check

A patient seeing a cardiologist, a diabetologist and a GP can receive three prescriptions from three people who never compare notes. Sentri catches what falls through.

* **Drug interactions** — grounded in the manufacturer's own FDA label text.
* **Duplicate therapy** — the same molecule taken twice under different names.
  `Tylenol` and `acetaminophen` resolve to the same ingredient and get flagged.
* **Messy/OCR-damaged names still resolve.** RxNorm's approximate matching can turn `warfarn sodum` into **warfarin sodium**.
* **Evidence-first results** — every interaction shown carries a source quote from the supplied label text.

Every interaction must contain a **verbatim quote that is verified to exist in the retrieved label text** and is not boilerplate.

Anything the model asserts without supporting evidence is discarded before it reaches the screen.

**Evidence before explanation.**

Sentri follows an evidence-first pipeline:

**Normalize → Retrieve → Verify → Explain → Discard unsupported claims**

The model explains the evidence. It does not invent it.

---

### 2. Decode a Prescription or Discharge Summary

`Tab Furosemide 40mg PO BD x 14 days` is not something every patient can immediately act on.

Paste or photograph the document and Sentri converts it into plain language in:

**English · Hindi · Bengali · Marathi · Tamil · Telugu · Spanish**

Drug names remain in **Latin script**, so patients can still match them with the names printed on their medicine boxes.

The output leads with **warning signs** — what should send the patient back to a doctor immediately.

That is the most consequential part of a discharge summary and often the easiest part for a patient to miss.

> **Healthcare information is only useful if the person receiving it can understand what to do with it.**

---

### 3. Lab Report Trends

One report is a snapshot.

**The signal is the direction of travel.**

Add reports over time and Sentri:

* Normalises units across laboratories (`mmol/L → mg/dL`, and similar).
* Matches the same markers across reports.
* Computes the trajectory of each marker.
* Calculates percentage change.
* Projects when a trend could cross a reference-range boundary.
* Flags values that are **still inside the normal range but drifting toward a bound**.

Example:

> Fasting glucose: **88 → 97 → 105 mg/dL**

Each individual report may still appear "normal".

Sentri identifies the trajectory and reports that the value has risen **19.3%**, with a projected range crossing in approximately **222 days** based on the observed trend.

The important distinction:

> **The LLM does not calculate the trend. Code does.**

This makes the result reproducible, testable and auditable.

**From snapshots to trajectories.**

Traditional lab portals tell patients *where they are*. Sentri also shows *where they are heading*.

---

### 4. Consultation Scribe

Clinicians spend roughly two hours documenting for every hour of care.

Record the consultation and Sentri produces:

* Structured **Subjective / Objective / Assessment / Plan** notes.
* Medications mentioned.
* Follow-up instructions.
* A plain-language summary for the patient.
* An explicit **uncertainties list**.

Transcription errors disproportionately matter around **drug names, dosages and numbers**.

Instead of silently guessing, Sentri is designed to surface uncertainty so a clinician can review it.

> **Uncertainty is a feature, not a failure.**

The generated note is a draft — not an automatically trusted medical record.

---

# Why Sentri Is Different

Sentri is not another chatbot placed on top of healthcare data.

It is designed around a separation between **what can be deterministically computed, what can be verified from a source, and what genuinely requires language generation.**

### 1. Evidence-Grounded AI

Clinically relevant interaction claims are tied back to their underlying source.

### 2. Deterministic Where It Matters

Drug matching, duplicate detection, unit conversion, trend calculations and quote verification happen in code rather than being delegated to an LLM.

### 3. Human-in-the-Loop

Uncertain, generated or extracted information remains reviewable and editable.

### 4. Auditable AI

Sentri can distinguish between:

**Source Evidence → Computed Result → Model-Generated Explanation**

This makes the system easier to inspect, debug and validate.

### 5. Multilingual by Design

Patients can understand the same underlying medical information in their preferred language while preserving medical drug names in Latin script.

### 6. Privacy-First Architecture

There are no accounts, no database and no permanent storage of audio or uploaded documents.

### 7. Responsible by Design

Sentri intentionally avoids pretending to diagnose, prescribe or replace clinicians.

> **The model reads and explains. It does not make the medical decision.**

---

# Architecture Philosophy

Sentri follows a simple pipeline:

```text
                    ┌──────────────────┐
                    │   Patient Input  │
                    │                  │
                    │ Rx / PDF / Image │
                    │ Lab Reports      │
                    │ Audio            │
                    └────────┬─────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │ Extraction & Normalize │
                 │                       │
                 │ OCR / RxNorm / Parser │
                 └───────────┬───────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
     ┌─────────────────┐          ┌─────────────────┐
     │ Deterministic   │          │ Source Evidence │
     │ Computation     │          │                 │
     │                 │          │ openFDA labels  │
     │ Trends / Units  │          │ RxNorm identity  │
     │ Matching / Math │          │                 │
     └────────┬────────┘          └────────┬────────┘
              │                            │
              └──────────────┬─────────────┘
                             ▼
                    ┌──────────────────┐
                    │       LLM        │
                    │                  │
                    │ Explain / Parse  │
                    │ Translate / Note │
                    └────────┬─────────┘
                             ▼
                    ┌──────────────────┐
                    │ Verification &   │
                    │ Uncertainty Layer│
                    └────────┬─────────┘
                             ▼
                    ┌──────────────────┐
                    │ Patient / Doctor │
                    │     Output       │
                    └──────────────────┘
```

The architecture deliberately prevents the LLM from becoming the single source of truth.

---

# Where the Data Comes From

| Source                                        | Used for                                          | Key needed |
| --------------------------------------------- | ------------------------------------------------- | ---------- |
| [RxNorm](https://rxnav.nlm.nih.gov/) (US NLM) | Drug-name normalisation and ingredient resolution | No         |
| [openFDA](https://open.fda.gov/) drug labels  | Interaction evidence                              | No         |
| Groq `llama-3.3-70b-versatile`                | Parsing, explanation and translation              | Yes        |
| Groq `whisper-large-v3`                       | Consultation transcription                        | Yes        |
| Tesseract.js                                  | Browser-based OCR                                 | No         |

RxNav's own drug-interaction API was retired in 2024 and now returns 404s, which is why interaction evidence is retrieved from **openFDA drug-label records** instead.

---

# What Is Model Output — And What Is Not

This separation is fundamental to Sentri.

| Computed in Code / Verified Deterministically | Generated by a Model          |
| --------------------------------------------- | ----------------------------- |
| Duplicate therapy                             | Plain-language explanations   |
| Exact ingredient matching                     | Parsing messy text            |
| Quote verification against source text        | Translation                   |
| Unit conversion                               | Narrative summaries           |
| Trend slope                                   | Structured extraction         |
| Percentage change                             | Consultation note generation  |
| Range-crossing projection                     | Patient-friendly explanations |

**Anything where a wrong answer could become dangerous is kept as deterministic or source-verifiable as possible.**

The model reads, structures and explains.

**It does not make the medical decision.**

---

# Running It

Requires **Node 18+** (uses global `fetch`). Tested on **Node 22**.

### 1. Backend

```bash
cd server
npm install
cp ../.env.example .env
# Add your GROQ_API_KEY
npm start
```

Backend:

```text
http://localhost:3001
```

### 2. Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Get a free Groq API key from [console.groq.com](https://console.groq.com).

---

# Environment Variables

All environment variables are server-side.

| Variable           | Default                   | Purpose                                       |
| ------------------ | ------------------------- | --------------------------------------------- |
| `PORT`             | `3001`                    | API port                                      |
| `GROQ_API_KEY`     | —                         | Required. AI endpoints return 503 without it. |
| `GROQ_TEXT_MODEL`  | `llama-3.3-70b-versatile` | Text model                                    |
| `GROQ_AUDIO_MODEL` | `whisper-large-v3`        | Transcription model                           |

The client reads `VITE_API_BASE` if you need to point it somewhere other than:

```text
http://localhost:3001/api
```

---

# API

| Endpoint                           | Purpose                                |
| ---------------------------------- | -------------------------------------- |
| `GET /api/health`                  | Status and configured models           |
| `POST /api/medicines/resolve`      | Messy names → RxNorm identities        |
| `POST /api/medicines/interactions` | Grounded interaction + duplicate check |
| `POST /api/decode`                 | Document → plain language              |
| `GET /api/decode/languages`        | Supported languages                    |
| `POST /api/labs/parse`             | Report text → structured markers       |
| `POST /api/labs/trends`            | Markers over time → computed trends    |
| `POST /api/scribe/transcribe`      | Audio → transcript                     |
| `POST /api/scribe/note`            | Transcript → structured note           |

---

# Privacy

Sentri is intentionally built without a database or user accounts.

* **Images are OCR'd in the browser** and are never uploaded.
* **Audio exists only in memory** for the duration of transcription.
* Audio is never written to disk.
* **Lab reports persist only in browser `localStorage`.**
* There is no server-side patient database.
* Clearing site data removes locally stored information.

> **Privacy is not a feature added later. It is part of the architecture.**

---

# The Core Idea

Healthcare already generates enormous amounts of information.

The problem is that the information is often:

**fragmented → technical → multilingual → difficult to compare → difficult to act on**

Sentri turns it into:

**understandable → evidence-backed → structured → traceable → actionable**

Without pretending that AI should replace the people responsible for making medical decisions.

---

# Sentri — Health Records, Decoded

> **The data already exists.
> We make it understandable.**
