import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import {
  createLeadUseCase,
  createQuestionnaireLeadUseCase,
  getAllLeadsUseCase,
  getLeadsByDateUseCase,
  downloadReportUseCase,
  createListPropertyLeadUseCase,
} from '../useCases/leadsUseCase';
import {
  IGetByDateQuery,
  ILeadsBody,
  IListPropertyLeadsBody,
  IQuestionnaireBody,
  IReportLeadsBody,
} from '../../types/leadsTypes';

export const createLead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = req.body as ILeadsBody;
  const { download } = req.query as { download?: string };
  let response: { message: string; result: boolean } = { message: '', result: false };
  if (!download) {
    //register  interest
    response = await createLeadUseCase(data);
  }

  res.status(200).json({
    success: true,
    message: response.message,
    result: response.result,
  });
});

export const createReportLead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = req.body as IReportLeadsBody;
  const response: { message: string; result: boolean } = await downloadReportUseCase(data);
  res.status(200).json({
    success: true,
    message: response.message,
    result: response.result,
  });
});

export const createListPropertyLead = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = req.body as IListPropertyLeadsBody;
    const response: { message: string; result: boolean } =
      await createListPropertyLeadUseCase(data);
    res.status(200).json({
      success: true,
      message: response.message,
      result: response.result,
    });
  },
);

export const createQuestionnaireLead = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = req.body as IQuestionnaireBody;
    const response = await createQuestionnaireLeadUseCase(data);
    res.status(200).json({
      success: true,
      message: response.message,
      result: response.result,
    });
  },
);

export const getAllLeads = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const response = await getAllLeadsUseCase(req.query);
  res.status(200).json({
    success: true,
    message: 'Leads fetched successfully',
    result: response,
  });
});

export const getLeadsByDate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate, leadType = '' } = req.query as unknown as IGetByDateQuery;
  const response = await getLeadsByDateUseCase({ startDate, endDate, leadType });
  res.status(200).json({
    success: true,
    message: 'Leads fetched successfully',
    result: response,
  });
});
