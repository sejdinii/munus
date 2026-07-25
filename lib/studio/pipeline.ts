/* The ONLY sanctioned path from a tailor provider to the UI. Screens must
   call generateKit — never a provider directly — so the verifier gate can
   never be skipped (CONTRACTS §3.1). */

import type { Job } from "@/lib/mock/jobs";
import { verify } from "./verifier";
import type { Fact, TailorProvider, VerifiedResult } from "./types";

export async function generateKit(
  provider: TailorProvider,
  job: Job,
  facts: Fact[],
  tone: string | null,
): Promise<VerifiedResult> {
  const raw = await provider.tailor({ job, facts, tone });
  return verify(raw, facts);
}
