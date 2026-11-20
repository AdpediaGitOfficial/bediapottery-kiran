"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeadsByDate = exports.getAllLeads = exports.createQuestionnaireLead = exports.createListPropertyLead = exports.createReportLead = exports.createLead = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const leadsUseCase_1 = require("../useCases/leadsUseCase");
exports.createLead = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    const { download } = req.query;
    let response = { message: '', result: false };
    if (!download) {
        //register  interest
        response = await (0, leadsUseCase_1.createLeadUseCase)(data);
    }
    res.status(200).json({
        success: true,
        message: response.message,
        result: response.result,
    });
});
exports.createReportLead = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    const response = await (0, leadsUseCase_1.downloadReportUseCase)(data);
    res.status(200).json({
        success: true,
        message: response.message,
        result: response.result,
    });
});
exports.createListPropertyLead = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    const response = await (0, leadsUseCase_1.createListPropertyLeadUseCase)(data);
    res.status(200).json({
        success: true,
        message: response.message,
        result: response.result,
    });
});
exports.createQuestionnaireLead = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    const response = await (0, leadsUseCase_1.createQuestionnaireLeadUseCase)(data);
    res.status(200).json({
        success: true,
        message: response.message,
        result: response.result,
    });
});
exports.getAllLeads = (0, express_async_handler_1.default)(async (req, res) => {
    const response = await (0, leadsUseCase_1.getAllLeadsUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Leads fetched successfully',
        result: response,
    });
});
exports.getLeadsByDate = (0, express_async_handler_1.default)(async (req, res) => {
    const { startDate, endDate, leadType = '' } = req.query;
    const response = await (0, leadsUseCase_1.getLeadsByDateUseCase)({ startDate, endDate, leadType });
    res.status(200).json({
        success: true,
        message: 'Leads fetched successfully',
        result: response,
    });
});
