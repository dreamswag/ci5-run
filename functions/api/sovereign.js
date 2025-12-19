// Handles the "Proof of Life" POST request
export async function onRequestPost(context) {
  try {
    // 1. Get current fleet count from KV
    let count = await context.env.COUNTERS.get("SOVEREIGN_NODES");
    
    // 2. Increment
    count = parseInt(count || 0) + 1;
    
    // 3. Save back to KV
    await context.env.COUNTERS.put("SOVEREIGN_NODES", count.toString());

    // 4. Return the specific military acknowledgement
    return new Response("ACK_SOVEREIGN_CONFIRMED", {
      headers: { 
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/plain"
      }
    });
  } catch (err) {
    return new Response("ERR_UPLINK_FAIL", { status: 500 });
  }
}