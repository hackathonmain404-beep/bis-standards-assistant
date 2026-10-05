import { handleApiRequest } from './handler';

export default async function handler(req: any, res: any) {
  return handleApiRequest(req, res);
}
