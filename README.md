# Munus

**Swipe-based job applications.** Swipe right to save a job. Every saved job comes with a CV and cover letter tailored to it that you can review and change, and you apply in one tap. Nothing is sent without your review.

This branch (`main`) is the current **mobile-first web prototype** of the app, running on sample data.

## The prototype

- **Onboarding:** drop in a CV, then pick target roles, locations and a salary range.
- **Swipe deck:** drag a job card right to save it or left to pass. Stamps fade in as you drag, and the next card reveals itself as the top one flies out.
- **Favourites:** each saved job opens a pack with a tailored CV and cover letter. You can tell it what to change ("Change the CV…") before applying.
- **Apply and track:** a confirmation step, then a tracking tab with application statuses (simulated employer signals in this prototype).
- **Design:** a "liquid glass" visual system with entrance animations, rendered inside a phone frame.

## Stack

React 19 · Vite · lucide-react icons · oxlint

## Run it

```bash
bun install      # or: npm install
bun run dev      # or: npm run dev
```

Open the local URL to use the phone-frame prototype.

## Earlier builds (other branches)

- `backup/w5b-final`: a full-stack build with Next.js, Supabase (auth, Postgres, storage) and an LLM via Groq. It includes job ingestion from five ATS platforms (Greenhouse, Lever, Ashby, SmartRecruiters and Workable), CV fact extraction with a verifier, match scoring with reasons, a document studio with PDF export, usage metering and GDPR export/delete.
- `claude/munus-bootstrap-plan-11inb2`: the first version of that full-stack build.
- `claude/start-bw0-3e2xyh`: a fresh restart of the full-stack build (Next.js + Supabase).
- `claude/affectionate-edison-lbk5cn` and `claude/peaceful-turing-1djj29`: planning docs, the design prototype and screenshots.
