// Handles the "Fleet Strength" GET request for the website
export async function onRequestGet(context) {
  try {
    const count = await context.env.COUNTERS.get("SOVEREIGN_NODES");
    
    // Fallback number if 0 (optional styling choice)
    const displayCount = parseInt(count || 0); 

    return new Response(JSON.stringify({ count: displayCount }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ count: 0 }), { status: 500 });
  }
}