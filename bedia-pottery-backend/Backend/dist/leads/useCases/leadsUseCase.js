"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeadsByDateUseCase = exports.getAllLeadsUseCase = exports.createListPropertyLeadUseCase = exports.downloadReportUseCase = exports.createQuestionnaireLeadUseCase = exports.createLeadUseCase = void 0;
const leadsRepo_1 = require("../repos/leadsRepo");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const mailService_1 = require("../../services/mailService");
const configKeys_1 = __importDefault(require("../../configKeys"));
const reportRepo_1 = require("../repos/reportRepo");
const createLeadUseCase = async (data) => {
    const { userName, email } = data;
    // insert the data to the database
    const newLead = await (0, leadsRepo_1.createLeads)(data);
    if (!newLead) {
        throw new appError_1.default('Couldn\'t Create new lead. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const subject = 'Thank you for your interest';
    const text = `Dear ${userName},\n\nThank you for showing interest. We will contact you soon.\n\nBest Regards,\nBediapottery Team`;
    //send mail to the client
    await (0, mailService_1.sendEmail)(email, subject, text);
    await sendMarketingMail(data, 'Registered Interest');
    return { message: 'Registered interest successfully', result: true };
};
exports.createLeadUseCase = createLeadUseCase;
const createQuestionnaireLeadUseCase = async (data) => {
    const { userName, email, phone, preferredLanguage, propertyType, preferredContactMethod, preferredContactTime, preferredArea, idealBudget, bedrooms, userType, expectedPurchaseTime, leadType, } = data;
    // insert the data to the database
    const newLead = await (0, leadsRepo_1.createQuestionnaireLead)(data);
    if (!newLead) {
        throw new appError_1.default('Couldn\'t Create new lead. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const subject = 'Thank you for your interest';
    const text = `Dear ${userName},\n\nThank you for showing interest by completing the questionnaire. We will contact you soon.\n\nBest Regards,\nBediapottery Team`;
    //send mail to the client
    await (0, mailService_1.sendEmail)(email, subject, text);
    // send mail to the marketing team
    const marketingMail = configKeys_1.default.MARKETING_MAIL;
    const marketingSubject = 'New lead registered';
    const marketingText = `Hi Team,\n\nA new lead has been registered with the following details:\nName: ${userName}\nEmail: ${email}\nPhone Number: ${phone}\nPreferred Language: ${preferredLanguage}\nLead Type:${leadType}\nProperty Type: ${propertyType}\nPreferred Contact Method:${preferredContactMethod}\nPreffered Contact Time: ${preferredContactTime}\nPreferred Area: ${preferredArea}\nIdeal Budget: ${idealBudget}\nBedrooms: ${bedrooms}\nUser Type: ${userType}\nExpected Purchase Time: ${expectedPurchaseTime}\nEnquiry Type: Questionnaire\n\nBest Regards,\nBediapottery Team`;
    //send mail to the client
    await (0, mailService_1.sendEmail)(marketingMail, marketingSubject, marketingText);
    return { message: 'Registered interest successfully', result: true };
};
exports.createQuestionnaireLeadUseCase = createQuestionnaireLeadUseCase;
const sendMarketingMail = async (data, enquiryType) => {
    // Type guards to distinguish between different data interfaces
    const isLeadsBody = (data) => 'propertyType' in data && 'propertySlug' in data;
    const isReportLeadsBody = (data) => !('propertyAddress' in data) && !('bedrooms' in data) && 'preferredLanguage' in data;
    const isListPropertyLeadsBody = (data) => 'propertyAddress' in data && 'bedrooms' in data;
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
            ? `${configKeys_1.default.CLIENT_BASE_URL}/offplan/${data.propertySlug}`
            : 'N/A';
    }
    else if (isReportLeadsBody(data)) {
        preferredLanguage = data.preferredLanguage;
        propertyIdentifier = data.propertyIdentifier;
    }
    else if (isListPropertyLeadsBody(data)) {
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
    const marketingMail = configKeys_1.default.MARKETING_MAIL;
    const marketingSubject = 'New lead registered!';
    await (0, mailService_1.sendEmail)(marketingMail, marketingSubject, marketingText);
};
const downloadReportUseCase = async (data) => {
    const { userName, email } = data;
    const report = await (0, reportRepo_1.fetchLatestReport)();
    if (!report || !report?.path) {
        throw new appError_1.default('Couldn\'t find report. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    // insert the data to the database
    const newLead = await (0, leadsRepo_1.createLeads)(data);
    if (!newLead) {
        throw new appError_1.default('Couldn\'t Create new lead. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    // send mail to the client
    const subject = 'Report from Bediapottery';
    const text = `Dear ${userName},\n\nThank you for showing interest in us.We have attached the requested report.\nYou're welcome to reach out to us anytime.\n\nBest Regards,\nBediapottery Team`;
    const attachments = [
        {
            filename: 'Bediapottery-report.pdf',
            path: `${configKeys_1.default.FILE_BASE_URL}${report.path}`, // Adjust the path to your brochure file
        },
    ];
    console.log(`${configKeys_1.default.FILE_BASE_URL}${report.path}`);
    await (0, mailService_1.sendEmail)(email, subject, text, attachments);
    await sendMarketingMail(data, 'Download Report');
    return { message: 'Registered interest successfully', result: true };
};
exports.downloadReportUseCase = downloadReportUseCase;
const createListPropertyLeadUseCase = async (data) => {
    const { userName, email } = data;
    const propertyData = await (0, reportRepo_1.fetchLatestReport)();
    if (!propertyData || !propertyData?.path) {
        throw new appError_1.default('Couldn\'t find report. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    // insert the data to the database
    const newLead = await (0, leadsRepo_1.createLeads)(data);
    if (!newLead) {
        throw new appError_1.default('Couldn\'t Create new lead. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    // send mail to the client
    const subject = 'Thank You from Bediapottery';
    const text = `Dear ${userName},\n\nThank you for showing interest in us.We have recieved the property details you submitted.\nWe're looking forward to working with you soon.\nYou're welcome to reach out to us anytime.\n\nBest Regards,\nBediapottery Team`;
    await (0, mailService_1.sendEmail)(email, subject, text);
    await sendMarketingMail(data, 'List Property');
    return { message: 'Registered interest successfully', result: true };
};
exports.createListPropertyLeadUseCase = createListPropertyLeadUseCase;
const getAllLeadsUseCase = async (queryParams) => {
    const { page = 1, search, sortBy, order = 'asc' } = queryParams;
    const { limit = 10 } = queryParams;
    // Sorting
    const sortCriteria = {};
    if (sortBy) {
        sortCriteria[sortBy] = order === 'asc' ? 1 : -1;
    }
    else {
        sortCriteria['updatedAt'] = -1;
    }
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [
            { userName: { $regex: search, $options: 'i' } },
            { preferredLanguage: { $regex: search, $options: 'i' } }, // Case-insensitive search
            { propertyType: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }
    const totalCount = await (0, leadsRepo_1.getLeadsCount)(query);
    if (!totalCount)
        return { totalCount: 0, leads: [] };
    const skip = (page - 1) * limit;
    const leads = await (0, leadsRepo_1.fetchAllLeads)(query, skip, limit, sortCriteria);
    return { totalCount, leads };
};
exports.getAllLeadsUseCase = getAllLeadsUseCase;
const getLeadsByDateUseCase = async (queryParams) => {
    const { startDate, endDate, leadType } = queryParams;
    // Convert query parameters to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    const query = {
        isDeleted: false,
        updatedAt: {
            $gte: start,
            $lte: end,
        },
    };
    if (leadType)
        query.leadType = leadType;
    const totalCount = await (0, leadsRepo_1.getLeadsCount)(query);
    if (!totalCount)
        return { totalCount: 0, leads: [] };
    const leads = await (0, leadsRepo_1.fetchAllLeadsByDate)(query);
    return { totalCount, leads };
};
exports.getLeadsByDateUseCase = getLeadsByDateUseCase;
