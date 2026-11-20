"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTermsAndConditionMetaBySlugUseCase = exports.getTermsAndConditionBySlugUseCase = exports.getTermsAndConditionByIdUseCase = exports.deleteTermsAndConditionByIdUseCase = exports.updateTermsAndConditionByIdUseCase = exports.fetchTermsAndConditionFromXmlUseCase = exports.createTermsAndConditionUseCase = exports.getAllTermsAndConditionsForAdminUseCase = exports.getAllTermsAndConditionsUseCase = void 0;
const termsAndConditionRepo_1 = require("../repos/termsAndConditionRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const xml2js_1 = __importDefault(require("xml2js"));
const logger_1 = __importDefault(require("../../config/logger"));
const getAllTermsAndConditionsUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '100' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [
            { title: { $regex: search, $options: 'i' } }, // Case-insensitive search
            { category: { $regex: search, $options: 'i' } },
        ];
    }
    const totalCount = await (0, termsAndConditionRepo_1.getTermsAndConditionsCount)(query);
    if (!totalCount)
        return { totalCount: 0, termsAndConditions: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const termsAndConditions = await (0, termsAndConditionRepo_1.fetchAllTermsAndConditions)(query, skip, parseInt(limit));
    return { totalCount, termsAndConditions };
};
exports.getAllTermsAndConditionsUseCase = getAllTermsAndConditionsUseCase;
const getAllTermsAndConditionsForAdminUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [
            { title: { $regex: search, $options: 'i' } }, // Case-insensitive search
            { category: { $regex: search, $options: 'i' } },
        ];
    }
    const totalCount = await (0, termsAndConditionRepo_1.getTermsAndConditionsCount)(query);
    if (!totalCount)
        return { totalCount: 0, termsAndConditions: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const termsAndConditions = await (0, termsAndConditionRepo_1.fetchAllTermsAndConditionsForAdmin)(query, skip, parseInt(limit));
    return { totalCount, termsAndConditions };
};
exports.getAllTermsAndConditionsForAdminUseCase = getAllTermsAndConditionsForAdminUseCase;
const createTermsAndConditionUseCase = async (data) => {
    // check for  unique value duplications
    const termsAndCondition = await (0, termsAndConditionRepo_1.createTermsAndCondition)(data);
    if (!termsAndCondition) {
        throw new appError_1.default('Couldn\'t Create new TermsAndCondition. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createTermsAndConditionUseCase = createTermsAndConditionUseCase;
const fetchTermsAndConditionFromXmlUseCase = async (files) => {
    for (const file of files) {
        if (!file.buffer) {
            logger_1.default.error('File buffer is undefined');
            throw new appError_1.default('File buffer is undefined', httpStatus_1.HttpStatus.BAD_REQUEST);
        }
        logger_1.default.info('Processing  xml file');
        try {
            // Read the uploaded XML file from the buffer
            const xmlData = file.buffer.toString('utf8');
            // Parse the XML data
            xml2js_1.default.parseString(xmlData, async (parseErr, result) => {
                if (parseErr) {
                    console.error('Error parsing XML:', parseErr);
                    throw new appError_1.default('Invalid XML format', httpStatus_1.HttpStatus.BAD_REQUEST);
                }
                // XML successfully parsed to JavaScript object
                // response = result.rss.channel[0].item[4];
                const termsAndConditionData = result.rss.channel[0].item;
                const newTermsAndConditions = termsAndConditionData
                    .map((item) => {
                    const categoryString = item.category && item.category.map((category) => category['_']).join(', ');
                    const metaDescriptionExist = item['wp:postmeta'].filter((meta) => meta['wp:meta_key'][0] === 'post_content');
                    const metaDescription = metaDescriptionExist && metaDescriptionExist.length > 0
                        ? metaDescriptionExist[0]['wp:meta_value'][0]
                        : '';
                    const content = item['content:encoded'][0];
                    if (content) {
                        return {
                            title: item.title[0],
                            content,
                            bannerImage: '/uploads/termsAndConditions/e12e16f8-5010-4754-b10d-76d432421977.png', // May provide a static banner image here...
                            category: categoryString || 'General',
                            metaTitle: item['wp:post_name'][0],
                            metaDescription: metaDescription || 'sample description',
                            createdAt: new Date(item.pubDate[0]),
                            updatedAt: new Date(item.pubDate[0]),
                        };
                    }
                    return null; // Return null explicitly if content is falsy
                })
                    .filter((termsAndCondition) => termsAndCondition !== null); // Filter out null values
                logger_1.default.info('Processed xml file');
                await (0, termsAndConditionRepo_1.bulkInsertTermsAndConditions)(newTermsAndConditions);
                logger_1.default.info('bulk inserted termsAndCondition data to db');
                // No need to delete files since they are in memory
            });
        }
        catch (err) {
            logger_1.default.error('Error processing file:', err);
            throw new appError_1.default('Error processing file', httpStatus_1.HttpStatus.BAD_REQUEST);
        }
    }
    return true;
};
exports.fetchTermsAndConditionFromXmlUseCase = fetchTermsAndConditionFromXmlUseCase;
const updateTermsAndConditionByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingTermsAndCondition = await fetchTermsAndConditionById(id);
        // check for  unique value updations
        const termsAndCondition = await (0, termsAndConditionRepo_1.updateTermsAndConditionById)(id, data);
        if (!termsAndCondition)
            throw new appError_1.default('Couldn\'t update TermsAndCondition', httpStatus_1.HttpStatus.NOT_FOUND);
        return termsAndCondition;
    }
    throw new appError_1.default('No TermsAndCondition Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateTermsAndConditionByIdUseCase = updateTermsAndConditionByIdUseCase;
const deleteTermsAndConditionByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const termsAndCondition = await (0, termsAndConditionRepo_1.deleteTermsAndConditionById)(id);
        // check for  unique value updations
        if (termsAndCondition)
            return true;
    }
    throw new appError_1.default('No TermsAndCondition Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteTermsAndConditionByIdUseCase = deleteTermsAndConditionByIdUseCase;
const getTermsAndConditionByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const termsAndCondition = await (0, termsAndConditionRepo_1.fetchTermsAndConditionById)(query._id);
        if (termsAndCondition)
            return termsAndCondition;
    }
    throw new appError_1.default('No TermsAndCondition Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getTermsAndConditionByIdUseCase = getTermsAndConditionByIdUseCase;
const getTermsAndConditionBySlugUseCase = async (slug) => {
    const termsAndCondition = await (0, termsAndConditionRepo_1.fetchTermsAndConditionBySlug)({ slug, isDeleted: false });
    if (termsAndCondition)
        return termsAndCondition;
    throw new appError_1.default('No TermsAndCondition Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getTermsAndConditionBySlugUseCase = getTermsAndConditionBySlugUseCase;
const getTermsAndConditionMetaBySlugUseCase = async (slug) => {
    const termsAndCondition = await (0, termsAndConditionRepo_1.fetchTermsAndConditionMetaBySlug)({ slug, isDeleted: false });
    if (termsAndCondition)
        return termsAndCondition;
    throw new appError_1.default('No TermsAndCondition Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getTermsAndConditionMetaBySlugUseCase = getTermsAndConditionMetaBySlugUseCase;
