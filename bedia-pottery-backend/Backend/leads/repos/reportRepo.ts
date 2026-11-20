import { IReportModel } from '../../types/reportTypes';
import reportModel from '../../report/models/reportModel';

export const fetchLatestReport = async (): Promise<IReportModel | null> => {
  return await reportModel.findOne({ isDeleted: false }).sort({ createdAt: -1 }).select({
    __v: 0,
    isDeleted: 0,
    createdAt: 0,
  });
};
