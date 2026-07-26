import { getDashboardMetrics } from '../models/dashboard.model.js';

export async function metrics(_req, res, next) {
  try {
    res.json(await getDashboardMetrics());
  } catch (error) {
    next(error);
  }
}
