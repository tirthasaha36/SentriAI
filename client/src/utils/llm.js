export async function triagePatient({ heartRate, breathingRate, symptoms, apiKey }) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  
  const systemPrompt = `You are a clinical triage decision-support assistant, modeled loosely on
standard Emergency Severity Index (ESI) principles. You are NOT diagnosing
the patient — you are helping prioritize how urgently they should seek care.

You will be given:
1. Measured vitals: heart rate in BPM (and breathing rate if available)
2. A transcribed description of the patient's symptoms, in their own words

Your task:
1. Classify urgency into exactly one of: "Emergency", "Urgent", or "Routine"
2. Write a short, plain-language explanation (grade 8 reading level, 2-3
   sentences) that references both the vitals and the symptoms in your reasoning
3. Suggest one concrete next step appropriate to the urgency level

Guidelines:
- Elevated heart rate (>100 BPM at rest) combined with symptoms like chest
  pain, shortness of breath, or dizziness should generally push toward
  "Emergency" or "Urgent"
- Mild, isolated symptoms with normal vitals (60-100 BPM resting) should
  generally be "Routine" unless the symptom description itself indicates
  a red flag (e.g. severe pain, confusion, difficulty breathing)
- Always err toward caution when uncertain — recommend a higher urgency
  tier rather than a lower one
- Never state a specific diagnosis. Only describe urgency and next steps.

Respond ONLY in this JSON format, no other text:
{
  "urgency": "Emergency" | "Urgent" | "Routine",
  "explanation": "string",
  "next_step": "string"
}`;

  const vitalsText = `Heart Rate: ${heartRate ? heartRate + ' BPM' : 'Not measured'}\n` +
                     `Breathing Rate: ${breathingRate ? breathingRate + ' breaths/min' : 'Not measured'}`;
                     
  const userPrompt = `Vitals:\n${vitalsText}\n\nSymptoms:\n${symptoms || 'No symptoms provided.'}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Empty response from LLM");
    }

    const parsed = JSON.parse(content);
    return {
      urgency: parsed.urgency || "Urgent",
      explanation: parsed.explanation || "No explanation provided.",
      next_step: parsed.next_step || "Consult a healthcare provider."
    };

  } catch (error) {
    console.error("LLM Error:", error);
    return {
      urgency: 'Urgent',
      explanation: `An error occurred while evaluating your symptoms (${error.message}). As a precaution, we suggest seeking medical evaluation.`,
      next_step: 'Please speak with a healthcare professional or staff member for assistance.'
    };
  }
}
