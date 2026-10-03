/// <reference lib="esnext" />

declare module 'npm:@supabase/supabase-js@2' {
  export * from '@supabase/supabase-js';
}

declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>,
    options?: {
      port?: number;
      hostname?: string;
      signal?: AbortSignal;
      onError?: (error: unknown) => Response | Promise<Response>;
      onListen?: (params: { port: number; hostname: string }) => void;
    }
  ): void | Promise<void>;
}

declare module 'https://*' {
  const content: any;
  export default content;
  export const serve: any;
}
