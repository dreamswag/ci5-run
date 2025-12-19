export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/free') {
      ctx.waitUntil((async () => {
        const key = 'total_liberated';
        let value = await env.COUNTER_KV.get(key);
        let count = (parseInt(value) || 0) + 1;
        await env.COUNTER_KV.put(key, count.toString());
      })());

      return fetch('https://ci5.run/scripts/bootstrap.sh');  // Adjust if needed
    }

    if (url.pathname === '/api/counter') {
      const key = 'total_liberated';
      let value = await env.COUNTER_KV.get(key);
      let count = parseInt(value) || 0;
      return new Response(JSON.stringify({ total_liberated: count }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    return fetch(request);  // Fallback for other requests
  }
};