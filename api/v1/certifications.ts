import { handleApiRequest } from '../../frontend/api/v1/handler';

export default async function handler(req: any, res: any) {
  return handleApiRequest(req, res);
}
