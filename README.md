# IQRA School Management Dashboard

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

 '# Clerk Dashboard Setup

### 🔐 Session Claims Example

Go to **Clerk Dashboard → Sessions → Claims**, and set:

`
{
  "publicMetadata": {
    "role": "{{user.public_metadata.role}}"
  }
}
`

This sets the user role (e.g. admin, teacher, etc.) that you can access in your Next.js app via:

\`\`\`
const role = user?.publicMetadata.role
\`\`\`

' >> README.md
# iqra-School-dasboard
