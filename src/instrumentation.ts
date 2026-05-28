export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") {
    const { registerEdge } = await import("./instrumentation/register.edge");
    return registerEdge();
  }

  const { registerNode } = await import("./instrumentation/register.node");
  return registerNode();
}
