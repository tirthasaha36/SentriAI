import React, { useState } from 'react';
import { Pill, Upload, Plus, X, ShieldAlert, Copy, CheckCircle2, Quote } from 'lucide-react';
import { PageHeader, Card, Spinner, ErrorNote, SeverityBadge, Disclaimer } from './ui';
import { resolveDrugs, checkInteractions } from '../api';
import { readImageText, extractDrugCandidates } from '../utils/ocr';

const SEVERITY_ORDER = { major: 0, moderate: 1, minor: 2 };

const MedicineSafety = () => {
  const [input, setInput] = useState('');
  const [names, setNames] = useState([]);
  const [ocrText, setOcrText] = useState('');
  const [ocrProgress, setOcrProgress] = useState(null);
  const [resolved, setResolved] = useState(null);
  const [unresolved, setUnresolved] = useState([]);
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const addName = (raw) => {
    const value = String(raw || input).trim();
    if (!value) return;
    setNames((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setInput('');
  };

  const removeName = (n) => setNames((prev) => prev.filter((x) => x !== n));

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setOcrProgress(0);
    try {
      const text = await readImageText(file, setOcrProgress);
      setOcrText(text);
      if (!text) setError('No text could be read from that image. Try better lighting, or type the names in.');
    } catch (err) {
      setError(`Could not read that image: ${err.message}`);
    } finally {
      setOcrProgress(null);
      e.target.value = '';
    }
  };

  const useOcrText = () => {
    const found = extractDrugCandidates(ocrText);
    if (!found.length) {
      setError('No medication names found in that text. You can edit it above or type names in directly.');
      return;
    }
    setNames((prev) => [...new Set([...prev, ...found])]);
  };

  const runCheck = async () => {
    setBusy(true);
    setError(null);
    setReport(null);
    setResolved(null);
    try {
      const r = await resolveDrugs(names);
      setResolved(r.resolved);
      setUnresolved(r.unresolved);
      if (!r.resolved.length) {
        setError('None of those matched a known medication. Check the spelling.');
        return;
      }
      setReport(await checkInteractions(r.resolved));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const sortedInteractions = [...(report?.interactions || [])].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  );

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Medicine Safety Check"
        subtitle="Different doctors prescribe without seeing each other's notes. Put the whole list in one place to spot clashing drugs and the same medicine taken twice under different names."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Pill className="w-4 h-4 text-mint" /> Your medications
          </h3>

          <div className="flex gap-2 mb-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addName()}
              placeholder="Type a medicine name and press Enter"
              className="flex-1 bg-navy-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-mint"
            />
            <button onClick={() => addName()} className="px-4 rounded-xl bg-mint/10 border border-mint/40 text-mint hover:bg-mint/20 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <label className="flex items-center justify-center gap-2 border border-dashed border-slate-700 rounded-xl py-4 text-sm text-slate-400 cursor-pointer hover:border-mint/50 hover:text-slate-200 transition-colors">
            <Upload className="w-4 h-4" />
            {ocrProgress === null ? 'Or photograph your pill strips' : `Reading image… ${ocrProgress}%`}
            <input type="file" accept="image/*" capture="environment" onChange={handleImage} className="hidden" />
          </label>

          {ocrText && (
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-2">
                Text read from your photo — correct anything wrong before adding it.
              </p>
              <textarea
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                rows={4}
                className="w-full bg-navy-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-mint"
              />
              <button onClick={useOcrText} className="mt-2 text-xs font-semibold text-mint hover:underline">
                Add medicines from this text →
              </button>
            </div>
          )}

          {names.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {names.map((n) => (
                <span key={n} className="flex items-center gap-2 bg-navy-900 border border-slate-700 rounded-full pl-4 pr-2 py-1.5 text-sm text-slate-200">
                  {n}
                  <button onClick={() => removeName(n)} className="text-slate-500 hover:text-emergency">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <button
            onClick={runCheck}
            disabled={busy || names.length === 0}
            className="btn-primary w-full mt-6 disabled:opacity-40"
          >
            {busy ? 'Checking…' : `Check ${names.length || ''} medicine${names.length === 1 ? '' : 's'}`}
          </button>
        </Card>

        <div className="space-y-4">
          {busy && <Card><Spinner label="Matching names against RxNorm and reading FDA labels…" /></Card>}
          <ErrorNote error={error} />

          {resolved && resolved.length > 0 && (
            <Card>
              <h3 className="text-white font-bold mb-3 text-sm">Identified medicines</h3>
              <ul className="space-y-2 text-sm">
                {resolved.map((d) => (
                  <li key={d.rxcui} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-routine mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-white">{d.name}</strong>
                      {d.corrected && <span className="text-mint"> — read as “{d.input}”, corrected</span>}
                    </span>
                  </li>
                ))}
              </ul>
              {unresolved.length > 0 && (
                <p className="text-xs text-urgent mt-3">
                  Not recognised: {unresolved.join(', ')}
                </p>
              )}
            </Card>
          )}

          {report?.duplicates?.length > 0 && (
            <Card className="border-urgent/50">
              <h3 className="text-amber-200 font-bold mb-3 text-sm flex items-center gap-2">
                <Copy className="w-4 h-4" /> Same medicine taken twice
              </h3>
              {report.duplicates.map((d) => (
                <div key={d.ingredient} className="text-sm text-slate-300 mb-2">
                  <strong className="text-white capitalize">{d.ingredient}</strong> appears in{' '}
                  <strong className="text-white">{d.drugs.join(' and ')}</strong>. Taking both means a
                  double dose without meaning to.
                </div>
              ))}
            </Card>
          )}

          {report && sortedInteractions.length === 0 && !report.duplicates?.length && (
            <Card>
              <div className="flex items-center gap-3 text-routine">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-semibold">No interactions found in the FDA labels checked.</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {report.note || 'This does not guarantee the combination is safe — it means nothing was flagged in the labels available.'}
              </p>
            </Card>
          )}

          {sortedInteractions.map((i, idx) => (
            <Card key={idx} className="border-slate-700">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-urgent" />
                  {i.drug_a} + {i.drug_b}
                </h3>
                <SeverityBadge severity={i.severity} />
              </div>
              <p className="text-sm text-slate-300 mb-3">{i.mechanism}</p>
              <p className="text-sm text-mint font-semibold mb-3">{i.what_to_do}</p>
              <div className="flex gap-2 items-start text-xs text-slate-500 bg-navy-900/60 rounded-lg p-3">
                <Quote className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="italic">“{i.evidence_quote}”</span>
              </div>
            </Card>
          ))}

          {report?.sources?.length > 0 && (
            <p className="text-xs text-slate-600">
              Checked against FDA labels for: {report.sources.map((s) => s.drug).join(', ')}
              {report.dropped_ungrounded > 0 &&
                ` · ${report.dropped_ungrounded} unsupported claim${report.dropped_ungrounded === 1 ? '' : 's'} discarded`}
            </p>
          )}
        </div>
      </div>

      <Disclaimer>
        Drug identities come from RxNorm (US National Library of Medicine); interactions are quoted
        from openFDA drug label data. Any finding without a direct quote from that source text is
        discarded rather than shown. This is not a substitute for your pharmacist — never stop or
        change a medicine based on this screen alone.
      </Disclaimer>
    </div>
  );
};

export default MedicineSafety;
