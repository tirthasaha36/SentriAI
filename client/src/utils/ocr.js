import Tesseract from 'tesseract.js';

/**
 * Read text out of an image entirely in the browser. Nothing is uploaded.
 *
 * Tesseract handles printed text (pill strips, typed reports) well and
 * handwriting badly, so every caller is expected to show the result in an
 * editable field rather than trusting it.
 */
export const readImageText = async (file, onProgress) => {
  const result = await Tesseract.recognize(file, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round((m.progress || 0) * 100));
      }
    },
  });
  return result?.data?.text?.trim() || '';
};

/**
 * Pull plausible medication names out of OCR'd text.
 *
 * Deliberately permissive — RxNorm's approximate matching is what actually
 * decides whether a token is a real drug, so this only needs to avoid
 * obvious noise like dosages, dates and instructions.
 */
const NOISE = /^(tablet|tablets|capsule|capsules|mg|ml|mcg|daily|twice|once|take|oral|by|mouth|day|days|night|morning|evening|before|after|food|rx|qty|refill|refills|dose|dosage|sig|no|patient|dr|doctor)$/i;

export const extractDrugCandidates = (text) => {
  const lines = String(text || '')
    .split(/[\n;]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const candidates = [];

  lines.forEach((line) => {
    // Drop leading list markers, then cut the line at the first dosage token —
    // "Warfarin Sodium 5mg once daily" should yield "Warfarin Sodium".
    const cleaned = line
      .replace(/^[\s\-•*\d.)(]+/, '')
      .split(/\b\d+\s*(?:mg|mcg|ml|g|iu|units?)\b/i)[0]
      .replace(/[^A-Za-z\s/-]/g, ' ')
      .trim();

    if (!cleaned) return;

    const words = cleaned.split(/\s+/).filter((w) => w.length > 2 && !NOISE.test(w));
    if (!words.length) return;

    // Keep at most the first three words; drug names are rarely longer.
    const name = words.slice(0, 3).join(' ');
    if (name.length >= 3) candidates.push(name);
  });

  return [...new Set(candidates)];
};
