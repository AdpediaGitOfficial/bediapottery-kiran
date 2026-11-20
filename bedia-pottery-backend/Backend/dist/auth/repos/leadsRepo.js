"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeadsCount = void 0;
const leadsModel_1 = __importDefault(require("../../leads/models/leadsModel"));
const getLeadsCount = async (query) => {
    return await leadsModel_1.default.countDocuments(query);
};
exports.getLeadsCount = getLeadsCount;
