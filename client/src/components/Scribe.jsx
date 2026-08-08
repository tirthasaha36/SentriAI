import React, { useRef, useState } from 'react';
import { Mic, Square, Upload, FileText, Copy, Check, AlertTriangle, User, Stethoscope } from 'lucide-react';
import { PageHeader, Card, Spinner, ErrorNote, Disclaimer } from './ui';
import { transcribeAudio, generateNote } from '../api';

const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const NoteField = ({ label, value }) =>
  !value ? null : (
    <div className="mb-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">{label}</div>
      <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{value}</div>
    </div>
  );

const Scribe = () => {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [note, setNote] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState('clinician');

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(timerRef.current);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        await sendAudio(blob);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err) {
      setError(`Microphone unavailable: ${err.message}`);
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const sendAudio = async (blob) => {
    setBusy('transcribe');
    setError(null);
    try {
      const res = await transcribeAudio(blob);
      setTranscript(res.transcript || '');
      if (!res.transcript) setError('Nothing could be transcribed from that recording.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) sendAudio(file);
    e.target.value = '';
  };

  const makeNote = async () => {
    setBusy('note');
    setError(null);
    setNote(null);
    try {
      setNote(await generateNote(transcript));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const copyNote = () => {
    if (!note) return;
    const text = [
      `CHIEF COMPLAINT: ${note.chief_complaint}`,
      `\nSUBJECTIVE:\n${note.subjective}`,
      note.objective && `\nOBJECTIVE:\n${note.objective}`,
      note.assessment && `\nASSESSMENT:\n${note.assessment}`,
      `\nPLAN:\n${note.plan}`,
      note.medications_mentioned?.length &&
        `\nMEDICATIONS:\n${note.medications_mentioned.map((m) => `- ${m.name} ${m.dose} ${m.instructions}`.trim()).join('\n')}`,
      note.follow_up?.length && `\nFOLLOW-UP:\n${note.follow_up.map((f) => `- ${f}`).join('\n')}`,
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Consultation Scribe"
        subtitle="Clinicians spend roughly two hours on documentation for every hour of patient care, and it is the leading driver of burnout. Record the consultation, get a structured note — and a plain-language version for the patient."
      />

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <Card>
            <h3 className="text-white font-bold mb-4 text-sm flex items-center gap-2">
              <Mic className="w-4 h-4 text-mint" /> Record the consultation
            </h3>

            <div className="flex flex-col items-center py-6">
              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={busy === 'transcribe'}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all disabled:opacity-40 ${
                  recording
                    ? 'bg-emergency/20 border-2 border-emergency animate-pulse'
                    : 'bg-mint/10 border-2 border-mint hover:bg-mint/20'
                }`}
              >
                {recording ? <Square className="w-8 h-8 text-emergency" /> : <Mic className="w-8 h-8 text-mint" />}
              </button>
              <div className="mt-4 font-mono text-2xl text-slate-200">{formatTime(seconds)}</div>
              <div className="text-xs text-slate-500 mt-1">
                {recording ? 'Recording — tap to stop' : 'Tap to start recording'}
              </div>
            </div>

            <label className="flex items-center justify-center gap-2 border border-dashed border-slate-700 rounded-xl py-3 text-sm text-slate-400 cursor-pointer hover:border-mint/50 hover:text-slate-200 transition-colors">
              <Upload className="w-4 h-4" /> Or upload an audio file
              <input type="file" accept="audio/*" onChange={handleUpload} className="hidden" />
            </label>

            <p className="text-xs text-slate-600 mt-4 leading-relaxed">
              Everyone being recorded must know and agree beforehand. Audio is sent for transcription
              and discarded immediately — it is never written to disk.
            </p>
          </Card>

          {busy === 'transcribe' && <Card><Spinner label="Transcribing with Whisper…" /></Card>}
          <ErrorNote error={error} />

          {transcript && (
            <Card>
              <h3 className="text-white font-bold mb-2 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-mint" /> Transcript
              </h3>
              <p className="text-xs text-slate-500 mb-3">Correct any mis-heard words before generating the note.</p>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={8}
                className="w-full bg-navy-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-mint"
              />
              <button onClick={makeNote} disabled={busy === 'note'} className="btn-primary w-full mt-3 disabled:opacity-40">
                {busy === 'note' ? 'Writing note…' : 'Generate clinical note'}
              </button>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {busy === 'note' && <Card><Spinner label="Structuring the consultation…" /></Card>}

          {note && (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('clinician')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                    view === 'clinician' ? 'bg-mint/15 text-mint border border-mint/40' : 'text-slate-400 border border-slate-700'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" /> Clinician note
                </button>
                <button
                  onClick={() => setView('patient')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                    view === 'patient' ? 'bg-mint/15 text-mint border border-mint/40' : 'text-slate-400 border border-slate-700'
                  }`}
                >
                  <User className="w-3.5 h-3.5" /> For the patient
                </button>
                <button onClick={copyNote} className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 hover:text-mint">
                  {copied ? <Check className="w-3.5 h-3.5 text-routine" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy note'}
                </button>
              </div>

              {note.uncertainties?.length > 0 && (
                <Card className="border-urgent/50">
                  <h4 className="text-amber-200 font-bold text-sm mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Check these before signing
                  </h4>
                  <ul className="text-sm text-amber-100/80 list-disc pl-5 space-y-1">
                    {note.uncertainties.map((u, i) => <li key={i}>{u}</li>)}
                  </ul>
                </Card>
              )}

              <Card>
                {view === 'clinician' ? (
                  <>
                    <NoteField label="Chief complaint" value={note.chief_complaint} />
                    <NoteField label="Subjective" value={note.subjective} />
                    <NoteField label="Objective" value={note.objective} />
                    <NoteField label="Assessment" value={note.assessment} />
                    <NoteField label="Plan" value={note.plan} />

                    {note.medications_mentioned?.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Medications</div>
                        {note.medications_mentioned.map((m, i) => (
                          <div key={i} className="text-sm text-slate-200">
                            <span className="text-white font-semibold">{m.name}</span>
                            {m.dose && <span className="text-mint"> {m.dose}</span>}
                            {m.instructions && <span className="text-slate-400"> — {m.instructions}</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {note.follow_up?.length > 0 && (
                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Follow-up</div>
                        <ul className="text-sm text-slate-200 list-disc pl-5 space-y-1">
                          {note.follow_up.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">What we discussed</div>
                    <p className="text-sm text-slate-200 leading-relaxed">{note.patient_summary}</p>
                  </>
                )}
              </Card>
            </>
          )}
        </div>
      </div>

      <Disclaimer>
        A draft, not a signed record. The model is instructed to record only what was said and to list
        anything unclear rather than guess — but transcription mishears drug names and numbers, so a
        clinician must read and correct the note before it enters any patient record.
      </Disclaimer>
    </div>
  );
};

export default Scribe;
