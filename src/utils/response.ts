import { Response } from 'express';

export const res = {
  ok: (res: Response, code = 200, msg = 'Success', data?: any) => 
    res.status(code).json({ status: 'success', message: msg, ...(data && { data }) }),
  
  err: (res: Response, code = 400, msg = 'Error') => 
    res.status(code).json({ status: 'error', message: msg }),
  
  created: (res: Response, msg = 'Created', data?: any) =>
    res.status(201).json({ status: 'success', message: msg, ...(data && { data }) }),
  
  unauthorized: (res: Response, msg = 'Unauthorized') =>
    res.status(401).json({ status: 'error', message: msg }),
  
  forbidden: (res: Response, msg = 'Forbidden') =>
    res.status(403).json({ status: 'error', message: msg }),
  
  notFound: (res: Response, msg = 'Not found') =>
    res.status(404).json({ status: 'error', message: msg }),
};
