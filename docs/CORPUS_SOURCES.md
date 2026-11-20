# RAG Corpus and Skill Source Report

Retrieved for the healthcare conversion. Only `docs/ingested/**/*.{txt,md,yaml}` is indexed at startup; retained PDFs and HTML are source originals where available. The corpus is evidence for traceable requirements analysis, not legal or medical advice. Jurisdiction, applicability, amendments, and final decisions require authorised review.

## Included healthcare evidence

| Publisher | Document | Local evidence | Source | Use |
| --- | --- | --- | --- | --- |
| National Health Authority / MoHFW | Health Data Management Policy | `docs/ingested/healthcare/india/abdm/abdm-health-data-management-policy.md` | https://abdm.gov.in/strapicms/uploads/health_management_policy_bac9429a79.pdf | Federated architecture, security and privacy by design, consent, health-data sharing, auditability |
| National Health Authority | HIP, HIU, HRP and PHR Guidelines, version 24 October 2022 | `docs/ingested/healthcare/india/abdm/abdm-hip-hiu-guidelines.md` | https://abdm.gov.in/strapicms/uploads/HIP_HIU_Guidelines_f85df336ec.pdf | ABDM roles, ABHA, consent-managed exchange, provider/user interoperability |
| MoHFW | EHR Standards for India, Standards Set Recommendations v2.0, 2016 | `docs/ingested/healthcare/india/clinical/ehr-standards-for-india.md` | https://esanjeevani.mohfw.gov.in/assets/guidelines/ehr_guidlines.pdf | Record structure, clinical terminology, access privilege, audit, integrity and encryption themes |
| MoHFW | Telemedicine Practice Guidelines | `docs/ingested/healthcare/india/clinical/telemedicine-source-note.md` | https://www.mohfw.gov.in/pdf/Telemedicine.pdf | Patient identification, consent, consultation, prescriptions, records, privacy, escalation |
| MeitY | Digital Personal Data Protection Act, 2023 | `docs/ingested/healthcare/india/privacy/dpdp-act-source-note.md` | https://www.meity.gov.in/content/digital-personal-data-protection-act-2023 | Personal-data processing, notice/consent, fiduciary responsibilities, safeguards, rights, breach and erasure themes |
| CDSCO | Guidance on Medical Device Software under MDR 2017 | `docs/ingested/healthcare/india/clinical/medical-device-software-source-note.md` | https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/Guidance-document-on-Medical-Device-Software-under-MDR-2017.pdf | Intended use and medical-device software applicability; requires regulatory review |
| CERT-In | Best Practices against vulnerabilities while using Generative AI solutions, CIAD-2025-0013 | `docs/ingested/healthcare/india/security/cert-in-generative-ai-source-note.md` | https://www.cert-in.org.in/s2cMainServlet?pageid=PUBVLNOTES02&VLCODE=CIAD-2025-0013 | Prompt injection, sensitive-data exposure, hallucinations, access control, verification, intended-use limits |
| NASA / NIST / OWASP | Retained general requirements and AI/security material | `docs/ingested/requirements/` and `docs/ingested/security/` | Existing repository sources | Requirements quality, traceability, risk, AI governance, cybersecurity, and prompt-injection controls |

## Scope and limitations

The application is generic across hospitals, clinics, telemedicine, EHR, laboratories, pharmacies, health insurance, claims, public-health, and health-data exchange scenarios. It defaults to India and synthetic/anonymised input. It does not diagnose, prescribe, triage, establish legal compliance, or approve production deployment.
