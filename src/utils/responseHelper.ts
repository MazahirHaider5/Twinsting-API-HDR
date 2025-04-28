
import { Response } from 'express';

const sendResponse = (res: Response, status: number, success: boolean, message: string, data?: any) => {
  res.status(status).json({ success, message, ...(data && { data }) });
};

export default sendResponse;