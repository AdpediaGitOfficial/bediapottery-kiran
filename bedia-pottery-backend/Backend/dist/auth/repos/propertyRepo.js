"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertyCount = void 0;
const propertyModel_1 = __importDefault(require("../../properties/models/propertyModel"));
const getPropertyCount = async (query) => {
    return await propertyModel_1.default.countDocuments(query);
};
exports.getPropertyCount = getPropertyCount;
