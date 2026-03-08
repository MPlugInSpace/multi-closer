# TODO

- Decide pinned tab handling.
- Decide current tab handling.
- Decide incognito behavior.
- Decide whether to add a confirmation dialog before closing.
- Proposal: Add CI publishing to browser stores (one-click installs)
  - Reason: Publishing to official stores (Chrome Web Store, Mozilla AMO) provides true one-click installs, automatic signing, and simplifies distribution to testers and users.
  - Proposed approach:
    1.  Create publisher accounts for Chrome Web Store and Mozilla AMO and obtain API credentials (CWS: service account / OAuth2; AMO: JWT key pair).
    2.  Add encrypted secrets to the repository for CI (e.g., `CWS_CLIENT_ID`, `CWS_PRIVATE_KEY`, `AMO_JWT_ISSUER`, `AMO_JWT_SECRET`).
    3.  Extend CI to build and create signed artifacts: produce CRX/XPI or upload via the stores' APIs using the stored credentials.
    4.  Automate release workflow to publish to the stores on merges to `main` with optional manual approval step.
    5.  Monitor store review status and provide rollbacks by creating new release drafts when necessary.
