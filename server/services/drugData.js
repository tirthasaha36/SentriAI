/**
 * Real drug data lookups. Two public sources, no API key required:
 *
 *  - RxNorm (US National Library of Medicine) for normalising a messy string
 *    into a real drug identity. `approximateTerm` is the important one: it
 *    tolerates OCR damage, so "warfarn sodum" still resolves to warfarin.
 *  - openFDA drug labels for interaction text. This is the manufacturer's own
 *    published labelling, which is what makes the output defensible — we are
 *    quoting a source, not asking a model to recall pharmacology.
 *
 * Note: RxNav's own drug-interaction API was retired in 2024 and now returns
 * 404, which is why interaction text comes from openFDA labels instead.
 */

const RXNAV = 'https://rxnav.nlm.nih.gov/REST';
const OPENFDA = 'https://api.fda.gov/drug/label.json';

const TIMEOUT_MS = 12000;

const fetchJSON = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

/** Cheap in-process cache — these sources are static and rate-limited. */
const cache = new Map();
const cached = async (key, fn) => {
  if (cache.has(key)) return cache.get(key);
  const value = await fn();
  cache.set(key, value);
  return value;
};

/**
 * Resolve a possibly-misspelled drug string to a real RxNorm concept.
 * Returns null when nothing plausible matches.
 */
const resolveDrug = async (rawName) => {
  const input = String(rawName || '').trim();
  if (!input) return null;

  return cached(`resolve:${input.toLowerCase()}`, async () => {
    // Exact match first — cheaper and unambiguous.
    const exact = await fetchJSON(`${RXNAV}/rxcui.json?name=${encodeURIComponent(input)}&search=2`);
    let rxcui = exact?.idGroup?.rxnormId?.[0] || null;
    let matchedVia = 'exact';
    let score = 100;

    if (!rxcui) {
      const approx = await fetchJSON(
        `${RXNAV}/approximateTerm.json?term=${encodeURIComponent(input)}&maxEntries=4`
      );
      const candidate = (approx?.approximateGroup?.candidate || []).find((c) => c.rxcui);
      if (!candidate) return null;
      rxcui = candidate.rxcui;
      matchedVia = 'approximate';
      score = Math.round(Number(candidate.score) || 0);
    }

    const props = await fetchJSON(`${RXNAV}/rxcui/${rxcui}/properties.json`);
    const name = props?.properties?.name || input;

    // Base ingredient is what duplicate-therapy detection needs: two different
    // brand names can be the same molecule.
    const related = await fetchJSON(`${RXNAV}/rxcui/${rxcui}/related.json?tty=IN`);
    const ingredientConcepts =
      related?.relatedGroup?.conceptGroup?.flatMap((g) => g.conceptProperties || []) || [];
    const ingredients = ingredientConcepts.map((c) => c.name).filter(Boolean);

    return {
      input,
      rxcui,
      name,
      ingredients: ingredients.length ? ingredients : [name],
      matched_via: matchedVia,
      score,
      corrected: matchedVia === 'approximate' && name.toLowerCase() !== input.toLowerCase(),
    };
  });
};

const stripHtml = (html) =>
  String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ');

/**
 * Prefer a single-ingredient label over a combination product. Searching
 * "aspirin" otherwise happily returns "BUTALBITAL, ASPIRIN, AND CAFFEINE",
 * whose interaction text is dominated by the other two ingredients.
 */
const pickBestLabel = (results, term) => {
  const wanted = term.toLowerCase();
  const score = (r) => {
    const generic = (r.openfda?.generic_name || []).join(', ').toLowerCase();
    if (!generic) return 0;
    if (generic === wanted) return 3;
    // Fewer comma-separated ingredients is a closer match to a single drug.
    const parts = generic.split(/,| and /).map((s) => s.trim()).filter(Boolean);
    if (parts.length === 1 && parts[0].includes(wanted)) return 2;
    if (generic.includes(wanted)) return 1 / parts.length;
    return 0;
  };
  return [...results].sort((a, b) => score(b) - score(a))[0] || null;
};

/** Pull the DRUG INTERACTIONS section of the openFDA label for a drug. */
const fetchLabelInteractions = async (drugName) => {
  const term = String(drugName || '').split(/[\s/]/)[0];
  if (!term) return null;

  return cached(`label:${term.toLowerCase()}`, async () => {
    // `_exists_:drug_interactions` matters a lot: most label records omit the
    // section entirely, so an unfiltered search happily returns a top hit with
    // no interaction text at all (aspirin was returning 0 characters).
    const queries = [
      `openfda.generic_name:"${term}"`,
      `openfda.substance_name:"${term}"`,
      `openfda.brand_name:"${term}"`,
    ];

    for (const q of queries) {
      const search = `${encodeURIComponent(q)}+AND+_exists_:drug_interactions`;
      const data = await fetchJSON(`${OPENFDA}?search=${search}&limit=20`);
      const results = data?.results || [];
      if (!results.length) continue;

      const result = pickBestLabel(results, term);
      if (!result) continue;

      // drug_interactions_table matters: warfarin's prose says "drugs known to
      // increase bleeding risk are presented in Table 3" and the actual drug
      // names live only in that table. Without it the model can only quote the
      // pointer, not the evidence.
      const text = []
        .concat(result.drug_interactions || [])
        .concat((result.drug_interactions_table || []).map(stripHtml))
        .concat(result.contraindications || [])
        .join('\n')
        .replace(/\s+/g, ' ')
        .trim();

      if (text) {
        return {
          drug: term,
          label_name: result.openfda?.generic_name?.[0] || term,
          // Labels run to many thousands of characters; keep the prompt sane.
          text: text.slice(0, 9000),
        };
      }
    }
    return null;
  });
};

/**
 * Same molecule prescribed twice under different names. Pure code, no model —
 * this is exact matching and should never be probabilistic.
 */
const findDuplicateTherapy = (drugs) => {
  const byIngredient = new Map();
  drugs.forEach((d) => {
    (d.ingredients || []).forEach((ing) => {
      const key = ing.toLowerCase();
      if (!byIngredient.has(key)) byIngredient.set(key, []);
      byIngredient.get(key).push(d.name);
    });
  });

  return [...byIngredient.entries()]
    .filter(([, names]) => new Set(names).size > 1)
    .map(([ingredient, names]) => ({
      ingredient,
      drugs: [...new Set(names)],
    }));
};

module.exports = { resolveDrug, fetchLabelInteractions, findDuplicateTherapy };
