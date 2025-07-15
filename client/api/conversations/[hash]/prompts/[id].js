import { deletePrompt } from '../../../../../../server/src/prompts/controller.js';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    req.params = { hash: req.query.hash, id: req.query.id };
    return deletePrompt(req, res);
  }
  res.status(405).json({ message: 'Method not allowed' });
}
