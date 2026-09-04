import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    // Add server-side env vars here as needed
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  // We need to explicitly expose client variables to the browser
  experimental__runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});
