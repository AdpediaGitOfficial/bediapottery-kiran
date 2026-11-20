"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeadCountController = exports.getLeadsController = exports.createLeadController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const createCustomleadUseCase_1 = require("../usecases/createCustomleadUseCase");
// POST /leads/:type
exports.createLeadController = (0, express_async_handler_1.default)(async (req, res) => {
    const { type } = req.params;
    const data = req.body;
    const newLead = await (0, createCustomleadUseCase_1.createCustomLead)(type, data);
    res.status(201).json({
        success: true,
        message: `Lead created successfully at ${type}`,
        data: newLead,
    });
});
exports.getLeadsController = (0, express_async_handler_1.default)(async (req, res) => {
    const { type } = req.params; // lead type from URL params
    const page = parseInt(req.query.page) || 1; // page number from query
    const limit = parseInt(req.query.limit) || 10; // limit from query
    if (!type) {
        res.status(400);
        throw new Error('Lead type is required');
    }
    const leads = await (0, createCustomleadUseCase_1.getAllCustomLeads)(type, page, limit);
    res.status(200).json({
        success: true,
        message: `Leads fetched successfully for ${type}`,
        data: leads.data,
        total: leads.total,
        page,
        limit,
    });
});
// Get COUNT
exports.getLeadCountController = (0, express_async_handler_1.default)(async (req, res) => {
    // optional
    const count = await (0, createCustomleadUseCase_1.getCustomLeadCount)();
    res.status(200).json({
        success: true,
        count: count,
        message: 'Lead counts for all types fetched successfully',
    });
});
