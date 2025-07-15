import { createConversation } from '../../../../server/src/conversations/controller.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return createConversation(req, res);
  }
  res.status(405).json({ message: 'Method not allowed' });
}
