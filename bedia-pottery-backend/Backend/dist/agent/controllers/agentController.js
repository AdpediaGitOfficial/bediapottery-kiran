"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgentBySlug = exports.getAgentById = exports.deleteAgentById = exports.updateAgentById = exports.createAgent = exports.getAllAgentsForAdmin = exports.getAllAgents = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const agentUseCase_1 = require("../useCases/agentUseCase");
exports.getAllAgents = (0, express_async_handler_1.default)(async (req, res) => {
    const agents = await (0, agentUseCase_1.getAllAgentsUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Agents successfully',
        result: agents,
    });
});
exports.getAllAgentsForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const agents = await (0, agentUseCase_1.getAllAgentsForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Agents successfully',
        result: agents,
    });
});
exports.createAgent = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, agentUseCase_1.createAgentUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created Agent successfully',
        result: true,
    });
});
exports.updateAgentById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, agentUseCase_1.updateAgentByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated Agent successfully',
        result: true,
    });
});
exports.deleteAgentById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, agentUseCase_1.deleteAgentByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted Agent successfully',
        result: true,
    });
});
exports.getAgentById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const agent = await (0, agentUseCase_1.getAgentByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched Agent successfully',
        result: agent,
    });
});
exports.getAgentBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const agent = await (0, agentUseCase_1.getAgentBySlugUseCase)(slug);
    res.status(200).json({
        success: true,
        message: 'Fetched Agent successfully',
        result: agent,
    });
});
