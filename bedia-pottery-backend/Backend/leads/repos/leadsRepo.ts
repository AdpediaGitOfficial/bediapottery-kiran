import {
  ILeadsModel,
  ILeadsBody,
  ILeadsGetDBQuery,
  IQuestionnaireBody,
  IReportLeadsBody,
  IListPropertyLeadsBody,
} from '../../types/leadsTypes';
import leadsModel from '../models/leadsModel';

export const createLeads = async (
  data: ILeadsBody | IReportLeadsBody | IListPropertyLeadsBody,
): Promise<ILeadsModel | null> => {
  return await leadsModel.create(data);
};

export const createQuestionnaireLead = async (
  data: IQuestionnaireBody,
): Promise<ILeadsModel | null> => {
  return await leadsModel.create(data);
};

export const getLeadsCount = async (query: ILeadsGetDBQuery): Promise<number> => {
  return await leadsModel.countDocuments(query);
};
export const fetchAllLeads = async (
  query: ILeadsGetDBQuery,
  skip: number,
  limit: number,
  sortCriteria: any,
): Promise<ILeadsModel[]> => {
  return await leadsModel
    .find(query)
    .select({
      __v: 0,
      isDeleted: 0,
      createdAt: 0,
    })
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit)
    .lean();
};
export const fetchAllLeadsByDate = async (query: {
  isDeleted: boolean;
  updatedAt: { $gte: Date; $lte: Date };
  leadType?: string;
}): Promise<ILeadsModel[]> => {
  return await leadsModel.find(query).select({
    __v: 0,
    isDeleted: 0,
    createdAt: 0,
  });
};
