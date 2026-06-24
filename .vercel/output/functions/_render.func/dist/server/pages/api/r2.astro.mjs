export { renderers } from '../../renderers.mjs';

const prerender = false;
async function GET() {
  {
    return new Response(
      JSON.stringify({ error: "Cloudflare R2 no configurado" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
