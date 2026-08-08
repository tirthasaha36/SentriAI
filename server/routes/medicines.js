const express = require('express');
const { chatJSON } = require('../services/llm');
const { resolveDrug, fetchLabelInteractions, findDuplicateTherapy } = require('../services/drugData');

const router = express.Router();

const INTERACTION_PROMPT = `You are a clinical pharmacist assistant reviewing one patient's complete medication list for safety problems.

You will be given the patient's medications and, for each, excerpts from its official FDA drug label.

CRITICAL RULES:
1. Only report an interaction if the SUPPLIED LABEL TEXT supports it. Do not rely on your own recall. If the label text does not mention the other drug or its class, do not report the pair.
2. Every interaction MUST include "evidence_quote": a short verbatim phrase copied from the supplied label text that names the other drug or its drug class. If you cannot produce such a quote, omit that interaction entirely.
2b. Generic boilerplate is NOT evidence. Phrases like "consult the labeling of all concurrently used drugs", "tell your doctor about all medicines you take", or "see Table 3" do not establish an interaction. If the only thing you can quote is boilerplate, that pair has no reportable interaction — leave it out.
2c. Never report a pair in order to say there is no interaction. Silence is the correct output for a safe pair.
3. Only consider pairs among the drugs listed. Ignore drugs the patient is not taking.
4. Write "what_to_do" for a patient with no medical training, at roughly an 8th-grade reading level. Never tell them to stop or change a dose on their own — direct them to a doctor or pharmacist.
5. Severity must be exactly one of: major, moderate, minor.
   - major: risk of serious harm; needs prompt professional review
   - moderate: real interaction; should be discussed at the next visit
   - minor: worth knowing, low risk

Return ONLY JSON in this shape:
{
  "interactions": [
    {
      "drug_a": "string",
      "drug_b": "string",
      "severity": "major|moderate|minor",
      "mechanism": "one sentence, plain language, why these two clash",
      "what_to_do": "concrete next step for the patient",
      "evidence_quote": "verbatim phrase from the supplied label text"
    }
  ],
  "general_cautions": ["short strings about the list as a whole, may be empty"]
}

If you find no supported interactions, return an empty interactions array. An empty result is a valid and useful answer — do not invent findings to seem helpful.`;

// POST /api/medicines/resolve  { names: ["warfarn sodum", ...] }
router.post('/resolve', async (req, res, next) => {
  try {
    const names = Array.isArray(req.body?.names) ? req.body.names : [];
    if (!names.length) return res.status(400).json({ error: 'Provide a non-empty "names" array.' });
    if (names.length > 25) return res.status(400).json({ error: 'Too many medications (max 25).' });

    const settled = await Promise.all(names.map((n) => resolveDrug(n)));
    const resolved = [];
    const unresolved = [];

    settled.forEach((r, i) => {
      if (r) resolved.push(r);
      else unresolved.push(String(names[i]));
    });

    res.json({ resolved, unresolved });
  } catch (err) {
    next(err);
  }
});

// POST /api/medicines/interactions  { drugs: [{ name, rxcui, ingredients }] }
router.post('/interactions', async (req, res, next) => {
  try {
    const drugs = Array.isArray(req.body?.drugs) ? req.body.drugs : [];
    if (drugs.length < 1) return res.status(400).json({ error: 'Provide a "drugs" array.' });

    // Deterministic check first — never delegate exact matching to a model.
    const duplicates = findDuplicateTherapy(drugs);

    if (drugs.length < 2) {
      return res.json({
        interactions: [],
        duplicates,
        general_cautions: [],
        sources: [],
        note: 'Only one medication provided — there are no pairs to compare.',
      });
    }

    // Brand names often have no label of their own under that name — fall back
    // to the RxNorm ingredient ("Tylenol" -> "acetaminophen").
    const labels = (
      await Promise.all(
        drugs.map(async (d) => {
          const direct = await fetchLabelInteractions(d.name);
          if (direct) return direct;
          const ingredient = (d.ingredients || [])[0];
          return ingredient && ingredient.toLowerCase() !== String(d.name).toLowerCase()
            ? fetchLabelInteractions(ingredient)
            : null;
        })
      )
    ).filter(Boolean);

    if (!labels.length) {
      return res.json({
        interactions: [],
        duplicates,
        general_cautions: [],
        sources: [],
        note: 'No FDA label text was found for these medications, so no interaction check could be performed.',
      });
    }

    const userContent = [
      `PATIENT MEDICATION LIST:\n${drugs.map((d) => `- ${d.name}`).join('\n')}`,
      '',
      'FDA LABEL EXCERPTS:',
      ...labels.map((l) => `\n### ${l.label_name}\n${l.text}`),
    ].join('\n');

    const result = await chatJSON(INTERACTION_PROMPT, userContent);

    // Drop anything the model failed to ground in a real quote. The prompt asks
    // for this too, but a filter in code is what actually guarantees it.
    const BOILERPLATE = [
      /consult (the )?labeling/i,
      /tell your (doctor|healthcare)/i,
      /inform your (doctor|physician)/i,
      /see (table|section)/i,
      /are presented in table/i,
      /all concurrently used drugs/i,
      /no (direct )?interaction/i,
    ];

    const labelCorpus = labels.map((l) => l.text).join(' ').toLowerCase();

    const grounded = (result.interactions || []).filter((i) => {
      const quote = typeof i?.evidence_quote === 'string' ? i.evidence_quote.trim() : '';
      if (quote.length < 15) return false;
      if (BOILERPLATE.some((re) => re.test(quote))) return false;
      // The quote must actually appear in the source we supplied.
      const probe = quote.toLowerCase().replace(/\s+/g, ' ').slice(0, 40);
      return labelCorpus.includes(probe);
    });

    res.json({
      interactions: grounded,
      duplicates,
      general_cautions: result.general_cautions || [],
      sources: labels.map((l) => ({
        drug: l.label_name,
        source: 'openFDA drug label',
        url: `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(l.drug)}"`,
      })),
      dropped_ungrounded: (result.interactions || []).length - grounded.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
