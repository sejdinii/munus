-- W3 fix (founder: exported CV "looks nothing like the CV I input").
-- The parse pipeline discarded the original CV's structure; new fact
-- kinds preserve the profile summary and contact details so the export
-- can mirror the real CV (header, summary, section order).
alter type fact_kind add value 'profile';
alter type fact_kind add value 'contact';
