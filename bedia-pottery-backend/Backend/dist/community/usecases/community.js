"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNewLaunchProjectUseCase = exports.getNewLaunchProjectBySlugUseCase = exports.getAllNewLaunchProjectsUseCase = exports.addNewLaunchProjectUseCase = exports.getCommunitiesCountUseCase = exports.deleteCommunityUseCase = exports.updateCommunityUseCase = exports.getCommunityBySlugUseCase = exports.getAllCommunitiesUseCase = exports.createCommunityUseCase = void 0;
const communityModelSchema_1 = require("../models/communityModelSchema");
const communityRepository_1 = require("../repos/communityRepository");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const createCommunityUseCase = async (data) => {
    try {
        const community = new communityModelSchema_1.CommunityModel(data);
        await community.save();
    }
    catch (error) {
        console.error('Error creating community:', error.message);
        throw new Error(`Failed to create community: ${error.message}`);
    }
};
exports.createCommunityUseCase = createCommunityUseCase;
const getAllCommunitiesUseCase = async (page = 1, limit = 6) => {
    try {
        page = Number(page) || 1;
        limit = Number(limit) || 6;
        const skip = (page - 1) * limit;
        const filter = { isDeleted: false };
        const total = await communityModelSchema_1.CommunityModel.countDocuments(filter);
        const communities = await communityModelSchema_1.CommunityModel.find(filter, {
            _id: 1,
            title: 1,
            shortTitle: 1,
            shortDescription: 1,
            developer: 1,
            bannerImage: 1,
            propertyImages: 1,
            bedrooms: 1,
            paymentPlan: 1,
            startingPrice: 1,
            slug: 1,
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const formattedData = communities.map((item) => ({
            ...item,
            _id: item._id.toString(),
        }));
        return {
            data: formattedData,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    catch (error) {
        console.error('Error fetching communities:', error.message);
        throw new Error(`Failed to fetch communities: ${error.message}`);
    }
};
exports.getAllCommunitiesUseCase = getAllCommunitiesUseCase;
// export const getCommunityBySlugUseCase = async (slug: string): Promise<Community> => {
//   try {
//     const community = await CommunityModel.findOne({ slug }).lean().exec();
//     if (!community) {
//       throw new Error('Community not found');
//     }
//     // Convert _id to string
//     return {
//       ...community,
//       _id: (community as any)._id?.toString(),
//     } as Community;
//   } catch (error: any) {
//     console.error('Error fetching community by slug:', error.message);
//     throw new Error(`Failed to fetch community: ${error.message}`);
//   }
// };
// export const getCommunityBySlugUseCase = async (slug: string): Promise<Community> => {
//   try {
//     const community = await CommunityModel.findOne({ slug })
//       .lean<Community & { _id: mongoose.Types.ObjectId }>()
//       .exec();
//     if (!community) throw new Error('Community not found');
//     return community;
//   } catch (error: any) {
//     console.error('Error fetching community by slug:', error.message);
//     throw new Error(`Failed to fetch community: ${error.message}`);
//   }
// };
const getCommunityBySlugUseCase = async (slug) => {
    try {
        const community = await communityModelSchema_1.CommunityModel.findOne({ slug, isDeleted: false })
            .lean()
            .exec();
        if (!community)
            throw new Error('Community not found');
        // Sort newLaunchProjects: latest first
        if (community.newLaunchProjects && community.newLaunchProjects.length > 0) {
            community.newLaunchProjects.sort((a, b) => {
                const dateA = a.createdAt
                    ? new Date(a.createdAt).getTime()
                    : a._id
                        ? new Date(a._id.toString()).getTime()
                        : 0;
                const dateB = b.createdAt
                    ? new Date(b.createdAt).getTime()
                    : b._id
                        ? new Date(b._id.toString()).getTime()
                        : 0;
                return dateB - dateA; // newest first
            });
        }
        return community;
    }
    catch (error) {
        console.error('Error fetching community by slug:', error.message);
        throw new Error(`Failed to fetch community: ${error.message}`);
    }
};
exports.getCommunityBySlugUseCase = getCommunityBySlugUseCase;
// export const updateCommunityUseCase = async (
//   slug: string,
//   data: Partial<Community>,
// ): Promise<Community> => {
//   try {
//     const updatedCommunity = await CommunityModel.findOneAndUpdate(
//       { slug }, // 🔹 find by slug instead of id
//       { $set: data },
//       { new: true, lean: true }, // return the updated document
//     ).exec();
//     if (!updatedCommunity) {
//       throw new Error('Community not found');
//     }
//     return {
//       ...updatedCommunity,
//     } as Community;
//   } catch (error: any) {
//     console.error('Error updating community:', error.message);
//     throw new Error(`Failed to update community: ${error.message}`);
//   }
// };
const updateCommunityUseCase = async (slug, data) => {
    try {
        const updatedCommunity = await communityModelSchema_1.CommunityModel.findOneAndUpdate({ slug }, { $set: data }, { new: true, lean: true }).exec();
        if (!updatedCommunity) {
            throw new Error('Community not found');
        }
        return updatedCommunity;
    }
    catch (error) {
        console.error('Error updating community:', error.message);
        throw new Error(`Failed to update community: ${error.message}`);
    }
};
exports.updateCommunityUseCase = updateCommunityUseCase;
const deleteCommunityUseCase = async (slug) => {
    try {
        // Find the community by slug and update isDeleted to true
        const updated = await communityModelSchema_1.CommunityModel.findOneAndUpdate({ slug }, { isDeleted: true }, { new: true }).exec();
        if (!updated) {
            throw new Error('Community not found');
        }
        // console.log(`🗑️ Community with slug '${slug}' soft deleted successfully`);
    }
    catch (error) {
        console.error('Error soft deleting community:', error.message);
        throw new Error(`Failed to soft delete community: ${error.message}`);
    }
};
exports.deleteCommunityUseCase = deleteCommunityUseCase;
const getCommunitiesCountUseCase = async () => {
    try {
        const filter = { isDeleted: false };
        const total = await communityModelSchema_1.CommunityModel.countDocuments(filter);
        return total;
    }
    catch (error) {
        console.error('Error counting communities:', error.message);
        throw new Error(`Failed to count communities: ${error.message}`);
    }
};
exports.getCommunitiesCountUseCase = getCommunitiesCountUseCase;
const addNewLaunchProjectUseCase = async (communityId, projectData) => {
    try {
        const updatedCommunity = await communityRepository_1.communityRepository.addNewLaunchProject(communityId, projectData);
        return updatedCommunity;
    }
    catch (error) {
        console.error('Error adding new launch project:', error.message);
        throw new Error(`Failed to add new launch project: ${error.message}`);
    }
};
exports.addNewLaunchProjectUseCase = addNewLaunchProjectUseCase;
const getAllNewLaunchProjectsUseCase = async (queryParams) => {
    const { page = '1', search, sortBy, order = 'desc' } = queryParams;
    const { limit = '10' } = queryParams;
    const sortCriteria = {};
    sortCriteria[sortBy || 'updatedAt'] = order === 'asc' ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const { totalCount, projects } = await (0, communityRepository_1.fetchAllNewLaunchProjects)(search, skip, parseInt(limit), sortCriteria);
    return {
        totalCount,
        newLaunchProjects: projects,
    };
};
exports.getAllNewLaunchProjectsUseCase = getAllNewLaunchProjectsUseCase;
const getNewLaunchProjectBySlugUseCase = async (communitySlug, slug) => {
    const project = await (0, communityRepository_1.fetchNewLaunchProjectBySlug)({ communitySlug, slug });
    if (!project) {
        throw new appError_1.default('No New Launch Project Found', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    return project;
};
exports.getNewLaunchProjectBySlugUseCase = getNewLaunchProjectBySlugUseCase;
const updateNewLaunchProjectUseCase = async (communityId, projectSlug, updateData) => {
    try {
        const updatedProject = await communityRepository_1.communityRepository.updateNewLaunchProject(communityId, projectSlug, updateData);
        return updatedProject;
    }
    catch (error) {
        console.error('Error updating launch project:', error.message);
        throw new Error(`Failed to update launch project: ${error.message}`);
    }
};
exports.updateNewLaunchProjectUseCase = updateNewLaunchProjectUseCase;
