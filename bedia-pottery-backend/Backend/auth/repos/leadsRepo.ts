import leadsModel from '../../leads/models/leadsModel';

export const getLeadsCount = async (query: { isDeleted: boolean }): Promise<number> => {
  return await leadsModel.countDocuments(query);
};
