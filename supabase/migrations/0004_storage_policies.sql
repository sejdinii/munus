-- Munus storage policies — applied on top of 0001/0002/0003.
-- TASK-104: the /api/cv route uploads the source CV to the private
-- `cv-uploads` bucket (authenticated, owner-only) and the studio writes
-- PDFs to `document-pdfs`. Without these policies the API gets RLS denials.

-- ── cv-uploads: owner can upload / read / replace / delete own files ──────
create policy "cv_upload_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'cv-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "cv_read_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'cv-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "cv_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'cv-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "cv_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'cv-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── document-pdfs: owner can read own generated PDFs ──────────────────────
create policy "pdf_read_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'document-pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
