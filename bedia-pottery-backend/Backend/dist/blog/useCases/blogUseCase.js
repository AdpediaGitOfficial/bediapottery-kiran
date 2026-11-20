"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlogMetaBySlugUseCase = exports.getBlogBySlugUseCase = exports.getBlogByIdUseCase = exports.deleteBlogByIdUseCase = exports.updateBlogByIdUseCase = exports.fetchBlogFromXmlUseCase = exports.createBlogUseCase = exports.getAllBlogsForAdminUseCase = exports.getAllBlogsUseCase = void 0;
const blogRepo_1 = require("../repos/blogRepo");
const objectIdParser_1 = require("../../utils/objectIdParser");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const xml2js_1 = __importDefault(require("xml2js"));
const logger_1 = __importDefault(require("../../config/logger"));
const getAllBlogsUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [
            { title: { $regex: search, $options: 'i' } }, // Case-insensitive search
            { category: { $regex: search, $options: 'i' } },
        ];
    }
    const totalCount = await (0, blogRepo_1.getBlogsCount)(query);
    if (!totalCount)
        return { totalCount: 0, blogs: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const blogs = await (0, blogRepo_1.fetchAllBlogs)(query, skip, parseInt(limit));
    return { totalCount, blogs };
};
exports.getAllBlogsUseCase = getAllBlogsUseCase;
const getAllBlogsForAdminUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [
            { title: { $regex: search, $options: 'i' } }, // Case-insensitive search
            { category: { $regex: search, $options: 'i' } },
        ];
    }
    const totalCount = await (0, blogRepo_1.getBlogsCount)(query);
    if (!totalCount)
        return { totalCount: 0, blogs: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const blogs = await (0, blogRepo_1.fetchAllBlogsForAdmin)(query, skip, parseInt(limit));
    return { totalCount, blogs };
};
exports.getAllBlogsForAdminUseCase = getAllBlogsForAdminUseCase;
const createBlogUseCase = async (data) => {
    // check for  unique value duplications
    const blog = await (0, blogRepo_1.createBlog)(data);
    if (!blog) {
        throw new appError_1.default('Couldn\'t Create new Blog. Try again', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return true;
};
exports.createBlogUseCase = createBlogUseCase;
const fetchBlogFromXmlUseCase = async (files) => {
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
                const blogData = result.rss.channel[0].item;
                const newBlogs = blogData
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
                            bannerImage: '/uploads/blogs/e12e16f8-5010-4754-b10d-76d432421977.png', // May provide a static banner image here...
                            category: categoryString || 'General',
                            metaTitle: item['wp:post_name'][0],
                            metaDescription: metaDescription || 'sample description',
                            createdAt: new Date(item.pubDate[0]),
                            updatedAt: new Date(item.pubDate[0]),
                        };
                    }
                    return null; // Return null explicitly if content is falsy
                })
                    .filter((blog) => blog !== null); // Filter out null values
                logger_1.default.info('Processed xml file');
                await (0, blogRepo_1.bulkInsertBlogs)(newBlogs);
                logger_1.default.info('bulk inserted blog data to db');
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
exports.fetchBlogFromXmlUseCase = fetchBlogFromXmlUseCase;
const updateBlogByIdUseCase = async (id, data) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        // const existingBlog = await fetchBlogById(id);
        // check for  unique value updations
        const blog = await (0, blogRepo_1.updateBlogById)(id, data);
        if (!blog)
            throw new appError_1.default('Couldn\'t update Blog', httpStatus_1.HttpStatus.NOT_FOUND);
        return blog;
    }
    throw new appError_1.default('No Blog Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateBlogByIdUseCase = updateBlogByIdUseCase;
const deleteBlogByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const blog = await (0, blogRepo_1.deleteBlogById)(id);
        // check for  unique value updations
        if (blog)
            return true;
    }
    throw new appError_1.default('No Blog Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteBlogByIdUseCase = deleteBlogByIdUseCase;
const getBlogByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const blog = await (0, blogRepo_1.fetchBlogById)(query._id);
        if (blog)
            return blog;
    }
    throw new appError_1.default('No Blog Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getBlogByIdUseCase = getBlogByIdUseCase;
const getBlogBySlugUseCase = async (slug) => {
    const blog = await (0, blogRepo_1.fetchBlogBySlug)({ slug, isDeleted: false });
    if (blog)
        return blog;
    throw new appError_1.default('No Blog Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getBlogBySlugUseCase = getBlogBySlugUseCase;
const getBlogMetaBySlugUseCase = async (slug) => {
    const blog = await (0, blogRepo_1.fetchBlogMetaBySlug)({ slug, isDeleted: false });
    if (blog)
        return blog;
    throw new appError_1.default('No Blog Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getBlogMetaBySlugUseCase = getBlogMetaBySlugUseCase;
