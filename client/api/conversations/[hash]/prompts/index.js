import { createPrompt } from '../../../../server/src/prompts/controller.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    req.params = { hash: req.query.hash };
    return createPrompt(req, res);
  }
  res.status(405).json({ message: 'Method not allowed' });
}
