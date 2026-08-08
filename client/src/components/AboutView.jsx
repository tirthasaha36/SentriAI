import React from 'react';
import { PageHeader, Card } from './ui';

const LIMITS = [
  {
    title: 'This is decision support, not diagnosis',
    body: 'Sentri surfaces information that already exists — drug labels, reference ranges, what your doctor said — and organises it. It does not decide what is wrong with you. Every screen ends with "confirm with your doctor or pharmacist" because that is genuinely the correct next step.',
  },
  {
    title: 'OCR is imperfect, so you always get to correct it',
    body: 'Text is read from photos in your browser using Tesseract. It handles printed pill strips and typed reports well, and handwriting poorly. Extracted text is always shown in an editable box before anything is analysed — nothing is processed that you have not had the chance to fix.',
  },
  {
    title: 'Interaction data comes from real drug labels',
    body: 'Drug names are normalised against RxNorm (US National Library of Medicine) and interactions are drawn from openFDA label data, which is the manufacturer\'s own published labelling. The language model organises and explains that source text — it is not inventing interactions from memory.',
  },
  {
    title: 'Nothing is stored on a server',
    body: 'There is no database and no account. Documents and lab reports live in your browser\'s local storage; audio is sent for transcription and immediately discarded. Closing the tab and clearing site data removes everything.',
  },
];

const AboutView = () => (
  <div className="max-w-4xl">
    <PageHeader
      title="About & Limits"
      subtitle="What this tool does, where the data comes from, and — importantly — what it cannot do."
    />
    <div className="grid gap-4">
      {LIMITS.map((l) => (
        <Card key={l.title}>
          <h3 className="text-white font-bold mb-2">{l.title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{l.body}</p>
        </Card>
      ))}
    </div>
    <div className="mt-6 rounded-2xl border border-urgent/40 bg-urgent/10 p-6">
      <h3 className="text-amber-200 font-bold mb-2">If you are having an emergency</h3>
      <p className="text-amber-100/80 text-sm leading-relaxed">
        Do not use this tool. Call your local emergency number or go to the nearest emergency
        department. Sentri is not monitored and cannot summon help.
      </p>
    </div>
  </div>
);

export default AboutView;
