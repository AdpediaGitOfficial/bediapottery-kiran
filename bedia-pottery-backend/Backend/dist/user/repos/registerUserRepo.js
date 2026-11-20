"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserById = exports.deleteAccountByUser = exports.getUserCount = exports.deleteToken = exports.checkMobileEmailExist = exports.updatecurrentStudent = exports.verifyParentDobYear = exports.updateParentDob = exports.createAdmin = exports.updateUserPassword = exports.getUserPasswordById = exports.findActiveUserByEmail = exports.hashPassword = exports.verifyLogin = exports.getAllUsers = exports.getProfileById = exports.checkMobileExist = exports.updateUser = exports.checkUserIdExist = exports.getProfile = exports.updateUserOtp = exports.checkUserNumberExist = exports.uploadAvatar = exports.saveUserToken = exports.setUserVerified = exports.verifyOtp = exports.createUser = exports.checkUserExist = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const emailQuery_1 = require("../../utils/emailQuery");
const userModel_1 = __importDefault(require("../models/userModel"));
const userAuthModel_1 = __importDefault(require("../models/userAuthModel"));
const httpStatus_1 = require("../../common/httpStatus");
const appError_1 = __importDefault(require("../../common/appError"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const objectIdParser_2 = require("../../utils/objectIdParser");
const checkUserExist = async (email) => {
    return await userModel_1.default
        .findOne({
        email,
        isDeleted: false,
    })
        .select({ _id: 1 })
        .lean();
};
exports.checkUserExist = checkUserExist;
// export const checkUserExist = async (
//   email: string | null,
//   mobileNumber: number,
// ): Promise<{ _id: string; mobileNumberVerified: boolean; currentStudentId: string } | null> => {
//   // const query: any = { mobileNumber };
//   const query: any = {
//     isDeleted: false,
//     mobileNumber,
//   };
//   if (email && email.trim() !== '') {
//     query.$or = [{ email }, { mobileNumber }];
//   }
//   return await usersModel
//     .findOne(query)
//     .select({ _id: 1, mobileNumberVerified: 1, currentStudentId: 1 })
//     .lean();
// };
// export const createUser = async (
//   data: IUserBody,
//   otp: string,
// ): Promise<{ _id: string; otp: string }> => {
//   const user = await usersModel.create({ ...data, otp });
//   return { _id: user._id as string, otp };
// };
const createUser = async (data) => {
    const user = await userModel_1.default.create({ ...data });
    return { _id: user._id };
};
exports.createUser = createUser;
const verifyOtp = async (mobileNumber, otp) => {
    return await userModel_1.default
        .findOne({ mobileNumber, otp, isDeleted: false })
        .sort({ createdAt: -1 })
        .select({ _id: 1 })
        .lean();
};
exports.verifyOtp = verifyOtp;
const setUserVerified = async (id) => {
    const _id = (0, objectIdParser_1.ObjectID)(id);
    return await userModel_1.default.findOneAndUpdate({ _id, isDeleted: false }, { mobileNumberVerified: true, otp: '' }, { new: true });
};
exports.setUserVerified = setUserVerified;
const saveUserToken = async (userId, deviceId, deviceType, authToken) => {
    const existingSession = await userAuthModel_1.default.findOne({
        userId,
        deviceType,
    });
    if (!existingSession) {
        return await userAuthModel_1.default.create({ userId, deviceId, deviceType, authToken, isActive: true });
    }
    else {
        return await userAuthModel_1.default.findOneAndUpdate({ userId, deviceType, isActive: true }, { authToken, deviceId }, { new: true });
    }
};
exports.saveUserToken = saveUserToken;
const uploadAvatar = async (id, imageUrl) => {
    const _id = (0, objectIdParser_1.ObjectID)(id);
    return await userModel_1.default.findOneAndUpdate({ _id, isDeleted: false }, { avatar: imageUrl }, { new: true });
};
exports.uploadAvatar = uploadAvatar;
const checkUserNumberExist = async (mobileNumber, type) => {
    if (type !== 'register') {
        return await userModel_1.default
            .findOne({ mobileNumber, isDeleted: false, mobileNumberVerified: true })
            .select({ _id: 1, fixedOtp: 1 })
            .lean();
    }
    return await userModel_1.default
        .findOne({ mobileNumber, isDeleted: false })
        .select({ _id: 1, fixedOtp: 1 })
        .lean();
};
exports.checkUserNumberExist = checkUserNumberExist;
const updateUserOtp = async (mobileNumber, otp) => {
    return await userModel_1.default.findOneAndUpdate({ mobileNumber, isDeleted: false }, { otp: otp });
};
exports.updateUserOtp = updateUserOtp;
const getProfile = async (userId) => {
    return await userModel_1.default.findOne({ _id: userId, isDeleted: false }).lean();
};
exports.getProfile = getProfile;
const checkUserIdExist = async (userId) => {
    const _id = (0, objectIdParser_1.ObjectID)(userId);
    return await userModel_1.default.findOne({ _id, isDeleted: false }).select({ _id: 1 }).lean();
};
exports.checkUserIdExist = checkUserIdExist;
const updateUser = async (id, data) => {
    const _id = (0, objectIdParser_1.ObjectID)(id);
    const obj = { modifiedOn: new Date().toISOString(), ...data };
    const updatedData = await userModel_1.default.findOneAndUpdate({ _id }, obj, { new: true }).lean();
    if (!updatedData) {
        throw new appError_1.default('Something went wrong', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    return updatedData;
};
exports.updateUser = updateUser;
const checkMobileExist = async (mobileNumber, userId) => {
    return await userModel_1.default
        .findOne({
        mobileNumber,
        _id: { $ne: userId },
    })
        .select({ _id: 1 })
        .lean();
};
exports.checkMobileExist = checkMobileExist;
const getProfileById = async (userId) => {
    return await userModel_1.default.findOne({ _id: userId, isDeleted: false }).lean();
};
exports.getProfileById = getProfileById;
const getAllUsers = async (filters, limit, page) => {
    const query = {};
    if (filters.fullName) {
        query.fullName = { $regex: filters.fullName, $options: 'i' }; // Case-insensitive search
    }
    if (filters.mobileNumber) {
        query.mobileNumber = filters.mobileNumber;
    }
    if (filters.status !== undefined) {
        query.status = filters.status;
    }
    if (filters.role) {
        query.role = filters.role;
    }
    query.isDeleted = false;
    const skip = (page - 1) * limit;
    const data = (await userModel_1.default.find(query).limit(limit).skip(skip).lean()) || [];
    const totalCount = await userModel_1.default.countDocuments(query);
    return {
        data,
        totalCount,
    };
};
exports.getAllUsers = getAllUsers;
const verifyLogin = async (email, password) => {
    const user = await userModel_1.default
        .findOne({ email, isDeleted: false })
        .select({ _id: 1, password: 1 })
        .lean();
    if (!user)
        return null;
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    return isMatch ? { _id: (0, objectIdParser_2.objectIdToString)(user._id) } : null;
};
exports.verifyLogin = verifyLogin;
//Password hashing for user reg
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcryptjs_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
/**
 * `name` is selected alongside `fullName` because the users collection also
 * holds records written by the admin module, which stores the display name
 * under `name`. Callers fall back from one to the other.
 *
 * Forgot-password starts from an address the user typed, so it is matched
 * case-insensitively - see utils/emailQuery.
 */
const findActiveUserByEmail = async (email) => {
    return await userModel_1.default
        .findOne({ email: (0, emailQuery_1.emailMatchQuery)(email), isDeleted: false })
        .select({ _id: 1, fullName: 1, name: 1, email: 1, password: 1 })
        .lean();
};
exports.findActiveUserByEmail = findActiveUserByEmail;
const getUserPasswordById = async (userId) => {
    const _id = (0, objectIdParser_1.ObjectID)(userId);
    return await userModel_1.default.findOne({ _id, isDeleted: false }).select({ _id: 1, password: 1 }).lean();
};
exports.getUserPasswordById = getUserPasswordById;
const updateUserPassword = async (userId, password) => {
    const _id = (0, objectIdParser_1.ObjectID)(userId);
    return await userModel_1.default.findOneAndUpdate({ _id, isDeleted: false }, { password, modifiedOn: new Date().toISOString() }, { new: true });
};
exports.updateUserPassword = updateUserPassword;
const createAdmin = async (data) => {
    const user = await userModel_1.default.create(data);
    return { _id: user._id };
};
exports.createAdmin = createAdmin;
const updateParentDob = async (id, parentDob, parentName) => {
    const _id = (0, objectIdParser_1.ObjectID)(id);
    return await userModel_1.default.findOneAndUpdate({ _id }, { parentDob: parentDob, parentName }, { new: true });
};
exports.updateParentDob = updateParentDob;
const verifyParentDobYear = async (userId, year) => {
    const _id = (0, objectIdParser_1.ObjectID)(userId);
    const user = await userModel_1.default.findOne({ _id, isDeleted: false }, { parentDob: 1 });
    if (!user || !user.parentDob) {
        throw new appError_1.default('User or parent DOB not found', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    const parentDobYear = new Date(user.parentDob).getFullYear();
    return parentDobYear === year;
};
exports.verifyParentDobYear = verifyParentDobYear;
const updatecurrentStudent = async (userId, studentId) => {
    const _id = (0, objectIdParser_1.ObjectID)(userId);
    return await userModel_1.default.findOneAndUpdate({ _id, isDeleted: false }, { currentStudentId: studentId }, { new: true });
};
exports.updatecurrentStudent = updatecurrentStudent;
const checkMobileEmailExist = async (mobileNumber, userId, email) => {
    return await userModel_1.default
        .findOne({
        mobileNumber,
        email,
        _id: { $ne: userId },
    })
        .select({ _id: 1 })
        .lean();
};
exports.checkMobileEmailExist = checkMobileEmailExist;
const deleteToken = async (userId, deviceType) => {
    const authUserId = (0, objectIdParser_1.ObjectID)(userId);
    return await userAuthModel_1.default.findOneAndUpdate({ userId: authUserId, deviceType }, { isActive: false, authToken: '' }, { new: true });
};
exports.deleteToken = deleteToken;
const getUserCount = async () => {
    try {
        const result = await userModel_1.default.countDocuments({ isDeleted: false, role: 'user' });
        return result;
    }
    catch (error) {
        console.error('Error fetching user count:', error);
        throw new Error('Failed to fetch user count');
    }
};
exports.getUserCount = getUserCount;
const deleteAccountByUser = async (userId) => {
    const authUserId = (0, objectIdParser_1.ObjectID)(userId);
    const user = await userModel_1.default
        .findOneAndUpdate({ _id: authUserId, isDeleted: false }, { isActive: false, isDeleted: true }, { new: true })
        .lean();
    if (!user)
        return null;
    // Update related students
    await userModel_1.default.updateMany({ userId: authUserId }, { $set: { isDeleted: true, isActive: false } });
    return { _id: user._id.toString() };
};
exports.deleteAccountByUser = deleteAccountByUser;
const fetchUserById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await userModel_1.default
        .findOne(dbQuery)
        .select({ avatar: 1, email: 1, mobileNumber: 1, fullName: 1, role: 1, _id: 0 })
        .lean();
};
exports.fetchUserById = fetchUserById;
