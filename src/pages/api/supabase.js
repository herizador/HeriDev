export const prerender = false;

export async function GET() {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ error: "Supabase no configurado" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ status: "ok", message: "Endpoint Supabase listo" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
