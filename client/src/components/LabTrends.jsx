import React, { useEffect, useState } from 'react';
import { LineChart, Upload, Plus, Trash2, TrendingUp, TrendingDown, Minus, AlertTriangle, Table2 } from 'lucide-react';
import { PageHeader, Card, Spinner, ErrorNote, Disclaimer } from './ui';
import { parseLabReport, analyseLabTrends } from '../api';
import { readImageText } from '../utils/ocr';
import TrendChart from './TrendChart';

const STORAGE_KEY = 'sentri.labReports';

const SAMPLE = `SUNRISE DIAGNOSTICS — Biochemistry Report
Collected: 12/02/2025
Fasting Blood Glucose      105 mg/dL      (70 - 110)
HbA1c                      5.9 %          (4.0 - 5.6)
Total Cholesterol          190 mg/dL      (< 200)
HDL Cholesterol            38 mg/dL       (> 40)
Serum Creatinine           1.0 mg/dL      (0.7 - 1.3)
Haemoglobin                13.8 g/dL      (13.0 - 17.0)`;

const loadReports = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const STATUS_LABEL = {
  above: { text: 'Above range', color: 'text-emergency', Icon: AlertTriangle },
  below: { text: 'Below range', color: 'text-emergency', Icon: AlertTriangle },
  normal: { text: 'In range', color: 'text-routine', Icon: Minus },
  unknown: { text: 'No range given', color: 'text-slate-400', Icon: Minus },
};

const DIRECTION = {
  rising: { Icon: TrendingUp, text: 'rising' },
  falling: { Icon: TrendingDown, text: 'falling' },
  stable: { Icon: Minus, text: 'stable' },
};

const LabTrends = () => {
  const [reports, setReports] = useState(loadReports);
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [ocrProgress, setOcrProgress] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }, [reports]);

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setOcrProgress(0);
    try {
      const read = await readImageText(file, setOcrProgress);
      setText((prev) => (prev ? `${prev}\n${read}` : read));
    } catch (err) {
      setError(`Could not read that image: ${err.message}`);
    } finally {
      setOcrProgress(null);
      e.target.value = '';
    }
  };

  const addReport = async () => {
    setBusy('parse');
    setError(null);
    try {
      const parsed = await parseLabReport(text, date || null);
      if (!parsed.markers.length) {
        setError('No numeric test results were found in that text.');
        return;
      }
      if (!parsed.report_date) {
        setError('No date found in the report — please set the report date above so it can be placed on the timeline.');
        return;
      }
      setReports((prev) =>
        [...prev, { id: `${Date.now()}`, date: parsed.report_date, lab_name: parsed.lab_name, markers: parsed.markers }]
          .sort((a, b) => new Date(a.date) - new Date(b.date))
      );
      setText('');
      setDate('');
      setAnalysis(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const removeReport = (id) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    setAnalysis(null);
  };

  const runAnalysis = async () => {
    setBusy('trends');
    setError(null);
    try {
      setAnalysis(await analyseLabTrends(reports));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Lab Report Trends"
        subtitle="One report is a snapshot. The useful signal is usually the direction of travel — a value still inside the normal range but climbing steadily every year is the thing a single report can never show you."
      />

      <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4 text-mint" /> Add a report
              </h3>
              <button onClick={() => setText(SAMPLE)} className="text-xs text-mint hover:underline">Use sample</button>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder="Paste the text of a lab report…"
              className="w-full bg-navy-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-mint"
            />

            <label className="flex items-center justify-center gap-2 border border-dashed border-slate-700 rounded-xl py-3 mt-3 text-sm text-slate-400 cursor-pointer hover:border-mint/50 hover:text-slate-200 transition-colors">
              <Upload className="w-4 h-4" />
              {ocrProgress === null ? 'Or photograph the report' : `Reading… ${ocrProgress}%`}
              <input type="file" accept="image/*" capture="environment" onChange={handleImage} className="hidden" />
            </label>

            <label className="block text-xs text-slate-500 mt-4 mb-1">Report date (if not printed on it)</label>
            <input
              type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-mint"
            />

            <button onClick={addReport} disabled={busy === 'parse' || text.trim().length < 10}
                    className="btn-primary w-full mt-4 disabled:opacity-40">
              {busy === 'parse' ? 'Reading…' : 'Add to timeline'}
            </button>
          </Card>

          <Card>
            <h3 className="text-white font-bold mb-3 text-sm">
              Your timeline ({reports.length} report{reports.length === 1 ? '' : 's'})
            </h3>
            {reports.length === 0 && (
              <p className="text-sm text-slate-500">
                Add at least two reports from different dates to see a trend.
              </p>
            )}
            <div className="space-y-2">
              {reports.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm bg-navy-900/60 rounded-lg px-3 py-2">
                  <div>
                    <div className="text-slate-200 font-semibold">{new Date(r.date).toLocaleDateString()}</div>
                    <div className="text-slate-500 text-xs">{r.markers.length} results{r.lab_name ? ` · ${r.lab_name}` : ''}</div>
                  </div>
                  <button onClick={() => removeReport(r.id)} className="text-slate-600 hover:text-emergency">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={runAnalysis} disabled={busy === 'trends' || reports.length < 1}
                    className="btn-secondary w-full mt-4 disabled:opacity-40 text-sm">
              {busy === 'trends' ? 'Analysing…' : 'Analyse trends'}
            </button>
          </Card>
        </div>

        <div className="space-y-4">
          {busy === 'trends' && <Card><Spinner label="Computing trends…" /></Card>}
          <ErrorNote error={error} />

          {analysis?.narrative && (
            <Card className="border-mint/30">
              <p className="text-white font-semibold mb-3">{analysis.narrative.headline}</p>
              {analysis.narrative.discuss_with_doctor?.length > 0 && (
                <>
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Worth raising with your doctor</p>
                  <ul className="text-sm text-slate-300 list-disc pl-5 space-y-1">
                    {analysis.narrative.discuss_with_doctor.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </>
              )}
            </Card>
          )}

          {analysis?.trends?.length > 0 && (
            <>
              <div className="flex justify-end">
                <button onClick={() => setShowTable((v) => !v)}
                        className="text-xs text-slate-400 hover:text-mint flex items-center gap-1.5">
                  <Table2 className="w-3.5 h-3.5" /> {showTable ? 'Show charts' : 'Show as table'}
                </button>
              </div>

              {showTable ? (
                <Card className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-500 text-xs uppercase tracking-wide text-left">
                        <th className="pb-2 pr-4">Marker</th><th className="pb-2 pr-4">Latest</th>
                        <th className="pb-2 pr-4">Range</th><th className="pb-2 pr-4">Status</th>
                        <th className="pb-2">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.trends.map((t) => (
                        <tr key={t.name} className="border-t border-slate-800">
                          <td className="py-2 pr-4 text-slate-200">{t.name}</td>
                          <td className="py-2 pr-4 text-white font-mono">{t.latest_value} {t.unit}</td>
                          <td className="py-2 pr-4 text-slate-400 font-mono">{t.ref_low ?? '—'}–{t.ref_high ?? '—'}</td>
                          <td className="py-2 pr-4">{STATUS_LABEL[t.status]?.text}</td>
                          <td className="py-2 text-slate-400">{t.direction} {t.percent_change}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {analysis.trends.map((t) => {
                    const s = STATUS_LABEL[t.status] || STATUS_LABEL.unknown;
                    const d = DIRECTION[t.direction] || DIRECTION.stable;
                    const note = analysis.narrative?.notes?.find(
                      (n) => n.marker?.toLowerCase() === t.name.toLowerCase()
                    );
                    return (
                      <Card key={t.name} className={t.drift ? 'border-urgent/50' : ''}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-white font-bold text-sm">{t.name}</h4>
                          <span className={`text-xs font-semibold flex items-center gap-1 ${s.color}`}>
                            <s.Icon className="w-3.5 h-3.5" /> {s.text}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                          <d.Icon className="w-3.5 h-3.5" />
                          {d.text}
                          {t.readings.length > 1 && ` ${t.percent_change > 0 ? '+' : ''}${t.percent_change}% over ${t.span_days} days`}
                          {t.unit_normalised && <span className="text-mint"> · units converted</span>}
                        </div>

                        <TrendChart readings={t.readings} refLow={t.ref_low} refHigh={t.ref_high}
                                    unit={t.unit} status={t.status} />

                        {t.drift && (
                          <div className="mt-3 rounded-lg bg-urgent/10 border border-urgent/40 p-3 text-xs text-amber-200 flex gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <span>
                              Still within range, but at this rate it would reach {t.drift.toward} in
                              roughly {t.drift.days_to_cross} days. Worth watching, not panicking about.
                            </span>
                          </div>
                        )}

                        {note && <p className="text-xs text-slate-400 mt-3 leading-relaxed">{note.reading}</p>}
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {analysis?.note && <Card><p className="text-sm text-slate-400">{analysis.note}</p></Card>}
        </div>
      </div>

      <Disclaimer>
        Trends, percentages and range crossings are computed arithmetically from the values you
        entered — the language model only reads your report into numbers and writes the plain-language
        notes. Reference ranges vary between laboratories, so a value flagged here may be normal at a
        different lab. Reports are stored only in this browser.
      </Disclaimer>
    </div>
  );
};

export default LabTrends;
