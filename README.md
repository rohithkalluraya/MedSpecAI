# MedSpec AI

MedSpec AI is a local healthcare requirements assistant for synthetic and anonymised project briefs. It uses LM Studio, retrieval augmented generation, and a two agent workflow to produce traceable software requirements and justified SDLC recommendations for Indian healthcare projects.

## Capabilities

The system supports projects involving hospitals, clinics, telemedicine, electronic health records, laboratories, pharmacies, insurance, claims, public health, and health data exchange. It analyses functional, safety, privacy, security, interoperability, compliance, performance, and operational concerns, with evidence references and human approval points.

Its knowledge base includes Indian healthcare and digital health sources such as ABDM guidance, EHR Standards for India, telemedicine guidance, the Digital Personal Data Protection Act, CDSCO software guidance, and CERT In security guidance.

## Scope

MedSpec AI is a requirements engineering prototype. It does not provide diagnosis, treatment, triage, medical advice, legal conclusions, or production approval. Use synthetic or anonymised data only. Regulatory and high impact decisions require authorised human review.

## Requirements

- Node.js `>=22.13.0`
- LM Studio with a compatible local model
- The model identifier configured in `.env`

## Setup

```bash
npm install
cp .env.example .env
npm run check
npm run app
```

Open `http://127.0.0.1:4173` for the custom MedSpec AI interface. Submit a synthetic healthcare project brief and review the requirements and SDLC output. Results are saved under `artifacts/evaluation/`. Use `npm run dev` separately when you need the standard Mastra Studio for inspecting agents, traces, and workflows.

## Configuration

Set the LM Studio values in `.env`:

```env
LM_STUDIO_BASE_URL=http://127.0.0.1:1234/v1
LM_STUDIO_API_KEY=lm-studio
LM_STUDIO_MODEL=qwen/qwen3-vl-8b
MEDSPEC_WORKSPACE_ROOT=
MASTRA_DATABASE_URL=file:./architect.db
MASTRA_TELEMETRY_DISABLED=1
```

Do not commit secrets, database files, private documents, or real patient information.

## Licence

MIT. See [LICENSE](LICENSE).
