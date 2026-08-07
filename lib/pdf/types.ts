// Generic PDF export document shapes. Deliberately decoupled from
// lib/mock/lib/supabase — the studio (and, later, real generation output)
// maps its own content into these before handing off to render.ts.

export type CvSection = {
  heading: string;
  bullets: string[];
};

export type CvDocument = {
  name: string;
  headline: string;
  /** Header lines under the name: location, email, phone, links. */
  contact?: string[];
  sections: CvSection[];
};

export type LetterDocument = {
  recipientCompany: string;
  paragraphs: string[];
  signoffName: string;
};
