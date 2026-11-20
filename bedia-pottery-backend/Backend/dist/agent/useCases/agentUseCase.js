"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgentBySlugUseCase = exports.getAgentByIdUseCase = exports.deleteAgentByIdUseCase = exports.updateAgentByIdUseCase = exports.createAgentUseCase = exports.getAllAgentsForAdminUseCase = exports.getAllAgentsUseCase = void 0;
const agentRepo_1 = require("../repos/agentRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const getAllAgentsUseCase = async (queryParams) => {
    const { page = '1', search, type } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [
            { name: { $regex: search, $options: 'i' } }, // Case-insensitive search
            { designation: { $regex: search, $options: 'i' } },
        ];
    }
    if (type && type.length > 0) {
        query['type'] = type;
    }
    const totalCount = await (0, agentRepo_1.getAgentsCount)(query);
    if (!totalCount)
        return { totalCount: 0, Agents: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const agents = await (0, agentRepo_1.fetchAllAgents)(query, skip, parseInt(limit));
    return { totalCount, agents };
};
exports.getAllAgentsUseCase = getAllAgentsUseCase;
const getAllAgentsForAdminUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [
            { name: { $regex: search, $options: 'i' } }, // Case-insensitive search
            { designation: { $regex: search, $options: 'i' } },
        ];
    }
    const totalCount = await (0, agentRepo_1.getAgentsCount)(query);
    if (!totalCount)
        return { totalCount: 0, Agents: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const agents = await (0, agentRepo_1.fetchAllAgentsForAdmin)(query, skip, parseInt(limit));
    return { totalCount, agents };
};
exports.getAllAgentsForAdminUseCase = getAllAgentsForAdminUseCase;
const createAgentUseCase = async (data) => {
    // check for  unique value duplications
    const agent = await (0, agentRepo_1.createAgent)(data);
    if (!agent) {
        throw new appError_1.default('Couldn\'t Create new Agent. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createAgentUseCase = createAgentUseCase;
const updateAgentByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingAgent = await fetchAgentById(id);
        // check for  unique value updations
        const agent = await (0, agentRepo_1.updateAgentById)(id, data);
        if (!agent)
            throw new appError_1.default('Couldn\'t update Agent', httpStatus_1.HttpStatus.NOT_FOUND);
        return agent;
    }
    throw new appError_1.default('No Agent Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateAgentByIdUseCase = updateAgentByIdUseCase;
const deleteAgentByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const agent = await (0, agentRepo_1.deleteAgentById)(id);
        // check for  unique value updations
        if (agent)
            return true;
    }
    throw new appError_1.default('No Agent Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteAgentByIdUseCase = deleteAgentByIdUseCase;
const getAgentByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const agent = await (0, agentRepo_1.fetchAgentById)(query._id);
        if (agent)
            return agent;
    }
    throw new appError_1.default('No Agent Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getAgentByIdUseCase = getAgentByIdUseCase;
const getAgentBySlugUseCase = async (slug) => {
    const agent = await (0, agentRepo_1.fetchAgentBySlug)({ slug, isDeleted: false });
    if (agent)
        return agent;
    throw new appError_1.default('No Agent Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getAgentBySlugUseCase = getAgentBySlugUseCase;
