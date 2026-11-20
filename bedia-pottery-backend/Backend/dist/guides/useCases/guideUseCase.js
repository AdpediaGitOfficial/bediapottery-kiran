"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuideByIdUseCase = exports.deleteGuideByIdUseCase = exports.updateGuideByIdUseCase = exports.createGuideUseCase = exports.getAllGuidesForAdminUseCase = exports.getSingleGuideUseCase = void 0;
const guideRepo_1 = require("../repos/guideRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const getSingleGuideUseCase = async (queryParams) => {
    const { purpose, type = 'General' } = queryParams;
    const query = { isDeleted: false, propertyPurpose: purpose, propertyType: type }; // Assuming you only want non-deleted documents
    const guide = await (0, guideRepo_1.fetchSingleGuide)(query);
    if (!guide)
        throw new appError_1.default('No Guide Found', httpStatus_1.HttpStatus.NOT_FOUND);
    return guide;
};
exports.getSingleGuideUseCase = getSingleGuideUseCase;
const getAllGuidesForAdminUseCase = async (queryParams) => {
    const { purpose } = queryParams;
    const query = {
        isDeleted: false,
        propertyPurpose: purpose,
    }; // Assuming you only want non-deleted documents
    const totalCount = await (0, guideRepo_1.getGuidesCount)(query);
    if (!totalCount)
        return { totalCount: 0, guides: [] };
    // const skip = (parseInt(page) - 1) * parseInt(limit);
    const guides = await (0, guideRepo_1.fetchAllGuidesForAdmin)(query);
    return { totalCount, guides };
};
exports.getAllGuidesForAdminUseCase = getAllGuidesForAdminUseCase;
const createGuideUseCase = async (data) => {
    // check for  unique value duplications : propertyPurpose, propertyType
    const { propertyPurpose, propertyType = 'General' } = data;
    const existingGuide = await (0, guideRepo_1.checkGuideExists)({ propertyPurpose, propertyType, isDeleted: false });
    if (existingGuide)
        throw new appError_1.default('Guide already exists', httpStatus_1.HttpStatus.CONFLICT);
    const guide = await (0, guideRepo_1.createGuide)(data);
    if (!guide) {
        throw new appError_1.default('Couldn\'t Create new Guide. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createGuideUseCase = createGuideUseCase;
const updateGuideByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const existingGuide = await (0, guideRepo_1.fetchGuideById)(id);
        if (!existingGuide)
            throw new appError_1.default('No Guide Found', httpStatus_1.HttpStatus.NOT_FOUND);
        const { propertyPurpose, propertyType } = existingGuide;
        if (propertyPurpose !== data.propertyPurpose || propertyType !== data.propertyType) {
            throw new appError_1.default('Can not update propertyPurpose or propertyType', httpStatus_1.HttpStatus.BAD_REQUEST);
        }
        const guide = await (0, guideRepo_1.updateGuideById)(id, data);
        if (!guide)
            throw new appError_1.default('Couldn\'t update Guide', httpStatus_1.HttpStatus.NOT_FOUND);
        return guide;
    }
    throw new appError_1.default('No Guide Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateGuideByIdUseCase = updateGuideByIdUseCase;
const deleteGuideByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const guide = await (0, guideRepo_1.deleteGuideById)(id);
        // check for  unique value updations
        if (guide)
            return true;
    }
    throw new appError_1.default('No Guide Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteGuideByIdUseCase = deleteGuideByIdUseCase;
const getGuideByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const guide = await (0, guideRepo_1.fetchGuideById)(query._id);
        if (guide)
            return guide;
    }
    throw new appError_1.default('No Guide Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getGuideByIdUseCase = getGuideByIdUseCase;
