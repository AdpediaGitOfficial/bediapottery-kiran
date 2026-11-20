import {
  createLeads,
  createQuestionnaireLead,
  fetchAllLeads,
  fetchAllLeadsByDate,
  getLeadsCount,
} from '../repos/leadsRepo';
import {
  IGetByDateQuery,
  ILeadsBody,
  ILeadsGetDBQuery,
  ILeadsModel,
  IListPropertyLeadsBody,
  IQuestionnaireBody,
  IReportLeadsBody,
} from '../../types/leadsTypes';
import AppError from '../../common/appError';
import { HttpStatus } from '../../common/httpStatus';
import { sendEmail } from '../../services/mailService';
import configKeys from '../../configKeys';
import { IGetAllQuery } from '../../types/leadsTypes';
import { fetchLatestReport } from '../repos/reportRepo';

export const createLeadUseCase = async (
  data: ILeadsBody,
): Promise<{ message: string; result: boolean }> => {
  const { userName, email } = data;
  // insert the data to the database
  const newLead = await createLeads(data);
  if (!newLead) {
    throw new AppError('Couldn\'t Create new lead. Try again', HttpStatus.BAD_REQUEST);
  }
  const subject = 'Thank you for your interest';
  const text = `Dear ${userName},\n\nThank you for showing interest. We will contact you soon.\n\nBest Regards,\nBediapottery Team`;
  //send mail to the client
  await sendEmail(email, subject, text);
  await sendMarketingMail(data, 'Registered Interest');
  return { message: 'Registered interest successfully', result: true };
};

export const createQuestionnaireLeadUseCase = async (
  data: IQuestionnaireBody,
): Promise<{ message: string; result: boolean }> => {
  const {
    userName,
    email,
    phone,
    preferredLanguage,
    propertyType,
    preferredContactMethod,
    preferredContactTime,
    preferredArea,
    idealBudget,
    bedrooms,
    userType,
    expectedPurchaseTime,
    leadType,
  } = data;
  // insert the data to the database
  const newLead = await createQuestionnaireLead(data);
  if (!newLead) {
    throw new AppError('Couldn\'t Create new lead. Try again', HttpStatus.BAD_REQUEST);
  }
  const subject = 'Thank you for your interest';
  const text = `Dear ${userName},\n\nThank you for showing interest by completing the questionnaire. We will contact you soon.\n\nBest Regards,\nBediapottery Team`;
  //send mail to the client
  await sendEmail(email, subject, text);
  // send mail to the marketing team
  const marketingMail = configKeys.MARKETING_MAIL;
  const marketingSubject = 'New lead registered';
  const marketingText = `Hi Team,\n\nA new lead has been registered with the following details:\nName: ${userName}\nEmail: ${email}\nPhone Number: ${phone}\nPreferred Language: ${preferredLanguage}\nLead Type:${leadType}\nProperty Type: ${propertyType}\nPreferred Contact Method:${preferredContactMethod}\nPreffered Contact Time: ${preferredContactTime}\nPreferred Area: ${preferredArea}\nIdeal Budget: ${idealBudget}\nBedrooms: ${bedrooms}\nUser Type: ${userType}\nExpected Purchase Time: ${expectedPurchaseTime}\nEnquiry Type: Questionnaire\n\nBest Regards,\nBediapottery Team`;
  //send mail to the client
  await sendEmail(marketingMail, marketingSubject, marketingText);
  return { message: 'Registered interest successfully', result: true };
};

const sendMarketingMail = async (
  data: ILeadsBody | IReportLeadsBody | IListPropertyLeadsBody,
  enquiryType: string,
) => {
  // Type guards to distinguish between different data interfaces
  const isLeadsBody = (data: any): data is ILeadsBody =>
    'propertyType' in data && 'propertySlug' in data;
  const isReportLeadsBody = (data: any): data is IReportLeadsBody =>
    !('propertyAddress' in data) && !('bedrooms' in data) && 'preferredLanguage' in data;
  const isListPropertyLeadsBody = (data: any): data is IListPropertyLeadsBody =>
    'propertyAddress' in data && 'bedrooms' in data;

  // Destructure common properties
  const { userName, email, phone, leadType } = data;

  // Initialize other variables
  let preferredLanguage = '';
  let propertyIdentifier = '';
  let message = '';
  let propertyUrl = 'N/A';
  let propertyType = '';

  // Type-specific property assignments
  if (isLeadsBody(data)) {
    preferredLanguage = data.preferredLanguage || '';
    propertyIdentifier = data.propertyIdentifier || '';
    message = data.message || '';
    propertyType = data.propertyType || '';
    propertyUrl = data.propertySlug
      ? `${configKeys.CLIENT_BASE_URL}/offplan/${data.propertySlug}`
      : 'N/A';
  } else if (isReportLeadsBody(data)) {
    preferredLanguage = data.preferredLanguage;
    propertyIdentifier = data.propertyIdentifier;
  } else if (isListPropertyLeadsBody(data)) {
    preferredLanguage = data.preferredLanguage;
    message = data.message;
    propertyType = data.propertyType;
  }

  // Construct the marketing text
  const marketingText = `Hi Team,

A new lead has been registered with the following details:
Name: ${userName}
Email: ${email}
Phone Number: ${phone}${propertyUrl !== 'N/A' ? `\nProperty: ${propertyUrl}` : ''}
Lead Type: ${leadType}${preferredLanguage ? `\nPreferred Language: ${preferredLanguage}` : ''}${propertyIdentifier ? `\nProperty Identifier: ${propertyIdentifier}` : ''}${propertyType ? `\nProperty Type: ${propertyType}` : ''}
Enquiry Type: ${enquiryType}${message ? `\nMessage: ${message}` : ''}

Best Regards,
Bediapottery Team`;

  // Send email to the marketing team
  const marketingMail = configKeys.MARKETING_MAIL;
  const marketingSubject = 'New lead registered!';

  await sendEmail(marketingMail, marketingSubject, marketingText);
};
export const downloadReportUseCase = async (
  data: IReportLeadsBody,
): Promise<{ message: string; result: boolean }> => {
  const { userName, email } = data;
  const report = await fetchLatestReport();
  if (!report || !report?.path) {
    throw new AppError('Couldn\'t find report. Try again', HttpStatus.BAD_REQUEST);
  }
  // insert the data to the database
  const newLead = await createLeads(data);
  if (!newLead) {
    throw new AppError('Couldn\'t Create new lead. Try again', HttpStatus.BAD_REQUEST);
  }
  // send mail to the client
  const subject = 'Report from Bediapottery';
  const text = `Dear ${userName},\n\nThank you for showing interest in us.We have attached the requested report.\nYou're welcome to reach out to us anytime.\n\nBest Regards,\nBediapottery Team`;
  const attachments = [
    {
      filename: 'Bediapottery-report.pdf',
      path: `${configKeys.FILE_BASE_URL}${report.path}`, // Adjust the path to your brochure file
    },
  ];
  console.log(`${configKeys.FILE_BASE_URL}${report.path}`);
  await sendEmail(email, subject, text, attachments);
  await sendMarketingMail(data, 'Download Report');
  return { message: 'Registered interest successfully', result: true };
};

export const createListPropertyLeadUseCase = async (
  data: IListPropertyLeadsBody,
): Promise<{ message: string; result: boolean }> => {
  const { userName, email } = data;
  const propertyData = await fetchLatestReport();
  if (!propertyData || !propertyData?.path) {
    throw new AppError('Couldn\'t find report. Try again', HttpStatus.BAD_REQUEST);
  }
  // insert the data to the database
  const newLead = await createLeads(data);
  if (!newLead) {
    throw new AppError('Couldn\'t Create new lead. Try again', HttpStatus.BAD_REQUEST);
  }
  // send mail to the client
  const subject = 'Thank You from Bediapottery';
  const text = `Dear ${userName},\n\nThank you for showing interest in us.We have recieved the property details you submitted.\nWe're looking forward to working with you soon.\nYou're welcome to reach out to us anytime.\n\nBest Regards,\nBediapottery Team`;

  await sendEmail(email, subject, text);
  await sendMarketingMail(data, 'List Property');
  return { message: 'Registered interest successfully', result: true };
};

export const getAllLeadsUseCase = async (
  queryParams: IGetAllQuery,
): Promise<{ totalCount: number; leads: ILeadsModel[] }> => {
  const { page = 1, search, sortBy, order = 'asc' } = queryParams;
  const { limit = 10 } = queryParams;
  // Sorting
  const sortCriteria: any = {};
  if (sortBy) {
    sortCriteria[sortBy] = order === 'asc' ? 1 : -1;
  } else {
    sortCriteria['updatedAt'] = -1;
  }
  const query: ILeadsGetDBQuery = { isDeleted: false }; // Assuming you only want non-deleted documents
  if (search && search.length > 0) {
    query['$or'] = [
      { userName: { $regex: search, $options: 'i' } },
      { preferredLanguage: { $regex: search, $options: 'i' } }, // Case-insensitive search
      { propertyType: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const totalCount = await getLeadsCount(query);

  if (!totalCount) return { totalCount: 0, leads: [] };

  const skip = (page - 1) * limit;
  const leads = await fetchAllLeads(query, skip, limit, sortCriteria);
  return { totalCount, leads };
};

export const getLeadsByDateUseCase = async (
  queryParams: IGetByDateQuery,
): Promise<{ totalCount: number; leads: ILeadsModel[] }> => {
  const { startDate, endDate, leadType } = queryParams;
  // Convert query parameters to Date objects
  const start = new Date(startDate as string);
  const end = new Date(endDate as string);
  const query: { isDeleted: boolean; updatedAt: { $gte: Date; $lte: Date }; leadType?: string } = {
    isDeleted: false,
    updatedAt: {
      $gte: start,
      $lte: end,
    },
  };
  if (leadType) query.leadType = leadType;

  const totalCount = await getLeadsCount(query);
  if (!totalCount) return { totalCount: 0, leads: [] };

  const leads = await fetchAllLeadsByDate(query);
  return { totalCount, leads };
};
