export function requireApiKey(req, res, next) { //middleware to check if the api key is valid
  const configuredKey = process.env.API_KEY;

  if (!configuredKey) {
    return res.status(500).json({ error: 'Server API key is not configured' });
  }

  const providedKey = req.headers['x-api-key'];

  if (!providedKey || providedKey !== configuredKey) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  next();
}
//This middleware acts as a gatekeeper. It validates the API key sent by the Chrome extension before allowing any write operation to reach the route handler.