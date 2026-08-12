import { AccessToken } from "livekit-server-sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  const { room, name } = req.body;
  if (!room || !name)
    return res.status(400).json({ error: "room+name required" });

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  console.log("KEY LENGTH:", apiKey?.length, JSON.stringify(apiKey));
  console.log("SECRET LENGTH:", apiSecret?.length, JSON.stringify(apiSecret));
  if (!apiKey || !apiSecret)
    return res.status(500).json({ error: "LiveKit keys missing" });

  const at = new AccessToken(apiKey, apiSecret, { identity: name });
  at.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true });
  const token = await at.toJwt();
  console.log("GENERATED TOKEN:", token);
  res.json({ token });
}
