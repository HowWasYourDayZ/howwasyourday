// Short commit id of this deployment (Vercel sets NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA at build
// time; empty locally). Shown in footers so anyone can see which version a page is serving.
export const BUILD = (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || '').slice(0, 7)
