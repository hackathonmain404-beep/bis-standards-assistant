/// <reference lib="esnext" />

declare const Deno: any;
declare const process: any;

declare module 'npm:@supabase/supabase-js@2' {
  export interface SupabaseClientOptions<SchemaName = 'public'> {
    auth?: {
      persistSession?: boolean;
      autoRefreshToken?: boolean;
      detectSessionInUrl?: boolean;
    };
    global?: {
      headers?: Record<string, string>;
    };
    db?: {
      schema?: SchemaName;
    };
  }

  export class SupabaseClient<Database = any, SchemaName extends string & keyof Database = 'public' extends keyof Database ? 'public' : string & keyof Database> {
    auth: any;
    from(table: string): any;
    schema(schema: string): any;
    rpc(fn: string, args?: any): any;
    channel(name: string, opts?: any): any;
    getChannels(): any[];
    removeChannel(channel: any): any;
    removeAllChannels(): any;
  }

  export function createClient<Database = any, SchemaName extends string & keyof Database = 'public' extends keyof Database ? 'public' : string & keyof Database>(
    supabaseUrl: string,
    supabaseKey: string,
    options?: SupabaseClientOptions<SchemaName>
  ): SupabaseClient<Database, SchemaName>;
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
