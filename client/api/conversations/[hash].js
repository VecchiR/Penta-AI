import { getConversation } from '../../../../server/src/conversations/controller.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    req.params = { hash: req.query.hash };
    return getConversation(req, res);
  }
  res.status(405).json({ message: 'Method not allowed' });
}
