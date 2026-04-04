
## Plan: Functionalities Hub with 6 Security Modules

### Phase 1: Database & Infrastructure
1. **Create `functionality_scans` table** — stores all scan logs with: scan_type, input_value, timestamp, result_summary, status, full_result (JSON), user_id
2. **RLS policies** — users can CRUD their own logs

### Phase 2: Edge Functions (6 functions)
Each edge function proxies to a real external API:

1. **domain-squatting** — generates typo/homoglyph permutations server-side + checks DNS registration
2. **breach-check** — calls Have I Been Pwned API (requires `HIBP_API_KEY`)
3. **dns-twist** — generates domain permutations + DNS resolution (server-side logic, no external API needed)
4. **url-scanner** — calls URLScan.io API (requires `URLSCAN_API_KEY`)
5. **whois-lookup** — calls WhoisXML API (requires `WHOIS_API_KEY`)
6. **network-scanner** — basic port scanning via Deno (limited in edge function context, will do DNS + basic connectivity checks)

### Phase 3: API Keys Required
- `HIBP_API_KEY` — from haveibeenpwned.com/API/Key ($3.50/month)
- `URLSCAN_API_KEY` — from urlscan.io (free tier available)
- `WHOIS_API_KEY` — from whoisxmlapi.com (free tier: 500 queries)

### Phase 4: Frontend
1. **Functionalities page** — hub with 6 module cards
2. **6 individual module pages** — input form + results display
3. **Scan History page** (within Functionalities) — filterable, searchable, with export CSV, download PDF, copy to clipboard, delete
4. **Nav update** — add "Functionalities" tab

### Design
- Black/grey/off-white color scheme (existing)
- Clean card-based UI with animations
- Consistent with current design system
