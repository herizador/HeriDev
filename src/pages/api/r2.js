export const prerender = false;

export async function GET() {
  const r2Endpoint = import.meta.env.R2_ENDPOINT;
  const r2AccessKey = import.meta.env.R2_ACCESS_KEY_ID;
  const r2SecretKey = import.meta.env.R2_SECRET_ACCESS_KEY;

  if (!r2Endpoint || !r2AccessKey || !r2SecretKey) {
    return new Response(
      JSON.stringify({ error: "Cloudflare R2 no configurado" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ status: "ok", message: "Endpoint R2 listo" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
