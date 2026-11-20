"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartnerByIdUseCase = exports.deletePartnerByIdUseCase = exports.updatePartnerByIdUseCase = exports.createPartnerUseCase = exports.getAllPartnersForAdminUseCase = exports.getAllPartnersUseCase = void 0;
const partnerRepo_1 = require("../repos/partnerRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const getAllPartnersUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [{ name: { $regex: search, $options: 'i' } }]; // Case-insensitive search
    }
    const totalCount = await (0, partnerRepo_1.getPartnersCount)(query);
    if (!totalCount)
        return { totalCount: 0, partners: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const partners = await (0, partnerRepo_1.fetchAllPartners)(query, skip, parseInt(limit));
    return { totalCount, partners };
};
exports.getAllPartnersUseCase = getAllPartnersUseCase;
const getAllPartnersForAdminUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [{ name: { $regex: search, $options: 'i' } }]; // Case-insensitive search
    }
    const totalCount = await (0, partnerRepo_1.getPartnersCount)(query);
    if (!totalCount)
        return { totalCount: 0, partners: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const partners = await (0, partnerRepo_1.fetchAllPartnersForAdmin)(query, skip, parseInt(limit));
    return { totalCount, partners };
};
exports.getAllPartnersForAdminUseCase = getAllPartnersForAdminUseCase;
const createPartnerUseCase = async (data) => {
    // check for  unique value duplications
    const partner = await (0, partnerRepo_1.createPartner)(data);
    if (!partner) {
        throw new appError_1.default('Couldn\'t Create new Partner. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createPartnerUseCase = createPartnerUseCase;
const updatePartnerByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingPartner = await fetchPartnerById(id);
        // check for  unique value updations
        const partner = await (0, partnerRepo_1.updatePartnerById)(id, data);
        if (!partner)
            throw new appError_1.default('Couldn\'t update Partner', httpStatus_1.HttpStatus.NOT_FOUND);
        return partner;
    }
    throw new appError_1.default('No Partner Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updatePartnerByIdUseCase = updatePartnerByIdUseCase;
const deletePartnerByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const partner = await (0, partnerRepo_1.deletePartnerById)(id);
        // check for  unique value updations
        if (partner)
            return true;
    }
    throw new appError_1.default('No Partner Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deletePartnerByIdUseCase = deletePartnerByIdUseCase;
const getPartnerByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const partner = await (0, partnerRepo_1.fetchPartnerById)(query._id);
        if (partner)
            return partner;
    }
    throw new appError_1.default('No Partner Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getPartnerByIdUseCase = getPartnerByIdUseCase;
