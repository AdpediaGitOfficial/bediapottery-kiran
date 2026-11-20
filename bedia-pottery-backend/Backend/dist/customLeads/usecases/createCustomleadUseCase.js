"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomLeadCount = exports.getAllCustomLeads = exports.createCustomLead = void 0;
const PropertyLeadModel_1 = __importDefault(require("../models/PropertyLeadModel"));
const contactLeadModel_1 = __importDefault(require("../models/contactLeadModel"));
const consultationLeadModel_1 = __importDefault(require("../models/consultationLeadModel"));
const communityLeadModel_1 = __importDefault(require("../models/communityLeadModel"));
const createCustomLead = async (type, data) => {
    let Model;
    switch (type) {
        case 'property':
            Model = PropertyLeadModel_1.default;
            break;
        case 'contact':
            Model = contactLeadModel_1.default;
            break;
        case 'consultation':
            Model = consultationLeadModel_1.default;
            break;
        case 'community':
            Model = communityLeadModel_1.default;
            break;
        default:
            throw new Error('Invalid lead type');
    }
    const lead = new Model(data);
    await lead.save();
    return lead;
};
exports.createCustomLead = createCustomLead;
// GET all leads (optionally by type)
const getAllCustomLeads = async (type, page = 1, limit = 10) => {
    if (!type) {
        throw new Error('Lead type is required');
    }
    try {
        const skip = (page - 1) * limit;
        let leads;
        let total = 0;
        switch (type) {
            case 'property':
                total = await PropertyLeadModel_1.default.countDocuments();
                leads = await PropertyLeadModel_1.default
                    .find()
                    .sort({ createdAt: -1 }) // 👈 Sort by latest first
                    .skip(skip)
                    .limit(limit);
                break;
            case 'contact':
                total = await contactLeadModel_1.default.countDocuments();
                leads = await contactLeadModel_1.default.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
                break;
            case 'consultation':
                total = await consultationLeadModel_1.default.countDocuments();
                leads = await consultationLeadModel_1.default.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
                break;
            case 'community':
                total = await communityLeadModel_1.default.countDocuments();
                leads = await communityLeadModel_1.default.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
                break;
            default:
                throw new Error('Invalid lead type');
        }
        return { total, data: leads };
    }
    catch (error) {
        console.error(error);
        throw new Error('Can\'t get lead');
    }
};
exports.getAllCustomLeads = getAllCustomLeads;
// GET COUNT
const getCustomLeadCount = async (type) => {
    // ✅ If a specific type is provided, count only that model
    if (type) {
        let Model;
        switch (type) {
            case 'property':
                Model = PropertyLeadModel_1.default;
                break;
            case 'contact':
                Model = contactLeadModel_1.default;
                break;
            case 'consultation':
                Model = consultationLeadModel_1.default;
                break;
            default:
                throw new Error('Invalid lead type');
        }
        const count = await Model.countDocuments();
        return count;
    }
    // ✅ If no type is provided, return counts for all types
    const [propertyCount, contactCount, consultationCount] = await Promise.all([
        PropertyLeadModel_1.default.countDocuments(),
        contactLeadModel_1.default.countDocuments(),
        consultationLeadModel_1.default.countDocuments(),
    ]);
    const total = propertyCount + contactCount + consultationCount;
    return total;
};
exports.getCustomLeadCount = getCustomLeadCount;
