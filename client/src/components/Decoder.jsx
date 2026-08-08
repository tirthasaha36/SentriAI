import React, { useEffect, useState } from 'react';
import { FileText, Upload, Languages, AlertOctagon, CalendarClock, HelpCircle, Clock } from 'lucide-react';
import { PageHeader, Card, Spinner, ErrorNote, Disclaimer } from './ui';
import { decodeDocument, getLanguages } from '../api';
import { readImageText } from '../utils/ocr';

const SAMPLE = `DISCHARGE SUMMARY - City General Hospital
Patient: M, 58y. Admitted 02/08 with acute decompensated CHF. EF 35%.
Dx: CHF NYHA III, T2DM, HTN
Rx on discharge:
1. Tab Furosemide 40mg PO BD x 14 days
2. Tab Metoprolol succinate 25mg PO OD
3. Tab Ramipril 2.5mg PO OD
4. Tab Metformin 500mg PO BD with meals
Advice: Salt restriction <2g/day. Daily weight monitoring. Fluid restriction 1.5L/day.
Review in cardiology OPD after 10 days with repeat RFT, serum electrolytes.
Return immediately if: increasing breathlessness, orthopnea, weight gain >2kg in 3 days, syncope.`;

const Section = ({ icon: Icon, title, tone = 'default', children }) => {
  const tones = {
    default: 'border-slate-700',
    danger: 'border-emergency/50 bg-emergency/5',
    warn: 'border-urgent/40 bg-urgent/5',
  };
  return (
    <Card className={tones[tone]}>
      <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
        <Icon className={`w-4 h-4 ${tone === 'danger' ? 'text-emergency' : 'text-mint'}`} />
        {title}
      </h3>
      {children}
    </Card>
  );
};

const Decoder = () => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');
  const [languages, setLanguages] = useState([{ code: 'en', name: 'English' }]);
  const [ocrProgress, setOcrProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLanguages().then(setLanguages).catch(() => {});
  }, []);

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setOcrProgress(0);
    try {
      const read = await readImageText(file, setOcrProgress);
      setText((prev) => (prev ? `${prev}\n${read}` : read));
      if (!read) setError('No text could be read from that image. Handwriting rarely works — try typing it instead.');
    } catch (err) {
      setError(`Could not read that image: ${err.message}`);
    } finally {
      setOcrProgress(null);
      e.target.value = '';
    }
  };

  const run = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await decodeDocument(text, language));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Decode a Prescription or Discharge Summary"
        subtitle="Hospital paperwork is written for other clinicians, not for you. Paste or photograph it and get it back in plain language — in your own language."
      />

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-mint" /> The document
            </h3>
            <button onClick={() => setText(SAMPLE)} className="text-xs text-mint hover:underline">
              Use sample
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            placeholder="Paste the text of your prescription or discharge summary here…"
            className="w-full bg-navy-900 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-mint font-mono"
          />

          <label className="flex items-center justify-center gap-2 border border-dashed border-slate-700 rounded-xl py-3 mt-3 text-sm text-slate-400 cursor-pointer hover:border-mint/50 hover:text-slate-200 transition-colors">
            <Upload className="w-4 h-4" />
            {ocrProgress === null ? 'Or photograph the document' : `Reading… ${ocrProgress}%`}
            <input type="file" accept="image/*" capture="environment" onChange={handleImage} className="hidden" />
          </label>

          <div className="flex items-center gap-3 mt-4">
            <Languages className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="flex-1 bg-navy-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-mint"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          <button onClick={run} disabled={busy || text.trim().length < 15} className="btn-primary w-full mt-4 disabled:opacity-40">
            {busy ? 'Explaining…' : 'Explain this to me'}
          </button>
        </Card>

        <div className="space-y-4">
          {busy && <Card><Spinner label="Reading the document…" /></Card>}
          <ErrorNote error={error} />

          {result?.readable === false && (
            <Card className="border-urgent/50">
              <p className="text-amber-200 text-sm font-semibold mb-2">This document could not be read reliably.</p>
              <ul className="text-sm text-slate-400 list-disc pl-5 space-y-1">
                {(result.unclear_items || []).map((u, i) => <li key={i}>{u}</li>)}
              </ul>
            </Card>
          )}

          {result?.readable !== false && result && (
            <>
              <Section icon={FileText} title={`What this says (${result.document_type})`}>
                <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
              </Section>

              {result.warning_signs?.length > 0 && (
                <Section icon={AlertOctagon} title="Go back to a doctor immediately if" tone="danger">
                  <ul className="text-sm text-red-200 space-y-1.5 list-disc pl-5">
                    {result.warning_signs.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </Section>
              )}

              {result.medications?.length > 0 && (
                <Section icon={Clock} title="Your medicines">
                  <div className="space-y-3">
                    {result.medications.map((m, i) => (
                      <div key={i} className="border-b border-slate-800 last:border-0 pb-3 last:pb-0">
                        <div className="text-white font-semibold text-sm">{m.name}</div>
                        <div className="text-slate-400 text-sm mt-1">{m.purpose}</div>
                        <div className="text-mint text-sm mt-1">{m.how_to_take}</div>
                        {m.cautions && <div className="text-amber-300/80 text-xs mt-1">{m.cautions}</div>}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {result.schedule?.length > 0 && (
                <Section icon={Clock} title="Daily schedule">
                  <div className="grid gap-2">
                    {result.schedule.map((s, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <span className="text-mint font-semibold w-24 flex-shrink-0">{s.time}</span>
                        <span className="text-slate-300">{(s.items || []).join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {result.follow_up?.length > 0 && (
                <Section icon={CalendarClock} title="What happens next">
                  <ul className="text-sm text-slate-300 space-y-1.5 list-disc pl-5">
                    {result.follow_up.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </Section>
              )}

              {result.questions_to_ask?.length > 0 && (
                <Section icon={HelpCircle} title="Worth asking at your next visit">
                  <ul className="text-sm text-slate-300 space-y-1.5 list-disc pl-5">
                    {result.questions_to_ask.map((q, i) => <li key={i}>{q}</li>)}
                  </ul>
                </Section>
              )}

              {result.unclear_items?.length > 0 && (
                <Section icon={HelpCircle} title="Could not be read" tone="warn">
                  <ul className="text-sm text-amber-100/80 space-y-1 list-disc pl-5">
                    {result.unclear_items.map((u, i) => <li key={i}>{u}</li>)}
                  </ul>
                </Section>
              )}
            </>
          )}
        </div>
      </div>

      <Disclaimer>
        This explains what your document says — it does not check whether the treatment is right, and
        it cannot see anything your doctor did not write down. If the explanation disagrees with what
        you were told in person, trust the person who examined you and ask them.
      </Disclaimer>
    </div>
  );
};

export default Decoder;
