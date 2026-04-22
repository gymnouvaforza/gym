import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getPublicSupabaseEnv, hasSupabasePublicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

export function updateSession(request: NextRequest, initialResponse?: NextResponse) {
  if (!hasSupabasePublicEnv()) {
    return initialResponse ?? NextResponse.next({ request });
  }

  const { url, anonKey } = getPublicSupabaseEnv();
  
  // Creamos una respuesta base si no existe
  let response = initialResponse ?? NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Actualizamos tanto la petición como la respuesta para mantener sincronía
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        
        // Regeneramos la respuesta solo si es necesario para inyectar cookies
        response = NextResponse.next({ request });
        
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Ejecutamos getUser() para refrescar el token si es necesario, 
  // pero lo hacemos de forma que no bloquee críticamente si falla
  void supabase.auth.getUser().catch((error) => {
    console.error("Middleware Auth Error:", error);
  });

  return response;
}
