"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserPasswordById = exports.fetchUserWithPasswordById = exports.updateUserPassword = exports.updateUserById = exports.deleteUserById = exports.fetchUserById = exports.fetchAllUsers = exports.createUser = exports.fetchUserByEmailInsensitive = exports.fetchUserByEmail = exports.getUsersCount = void 0;
const objectIdParser_1 = require("../../utils/objectIdParser");
const emailQuery_1 = require("../../utils/emailQuery");
const userModel_1 = __importDefault(require("../models/userModel"));
const getUsersCount = async (query) => {
    return await userModel_1.default.countDocuments(query);
};
exports.getUsersCount = getUsersCount;
const fetchUserByEmail = async (email) => {
    const dbQuery = {
        email,
        isDeleted: false,
    };
    return await userModel_1.default.findOne(dbQuery).select({ createdAt: 0, updatedAt: 0, __v: 0 }).lean();
};
exports.fetchUserByEmail = fetchUserByEmail;
/**
 * Forgot-password starts from an address the user typed, so it is matched
 * case-insensitively - see utils/emailQuery.
 */
const fetchUserByEmailInsensitive = async (email) => {
    const dbQuery = {
        email: (0, emailQuery_1.emailMatchQuery)(email),
        isDeleted: false,
    };
    return await userModel_1.default.findOne(dbQuery).select({ createdAt: 0, updatedAt: 0, __v: 0 }).lean();
};
exports.fetchUserByEmailInsensitive = fetchUserByEmailInsensitive;
const createUser = async (data) => {
    return await userModel_1.default.create(data);
};
exports.createUser = createUser;
const fetchAllUsers = async (query, skip, limit) => {
    return await userModel_1.default
        .find(query)
        .select({ password: 0, isDeleted: 0, __v: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
exports.fetchAllUsers = fetchAllUsers;
const fetchUserById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await userModel_1.default
        .findOne(dbQuery)
        .select({ name: 1, email: 1, designation: 1, _id: 0 })
        .lean();
};
exports.fetchUserById = fetchUserById;
const deleteUserById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await userModel_1.default.findOneAndUpdate(dbQuery, { isDeleted: true });
};
exports.deleteUserById = deleteUserById;
const updateUserById = async (id, data) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await userModel_1.default.findOneAndUpdate(dbQuery, data);
};
exports.updateUserById = updateUserById;
const updateUserPassword = async (email, password) => {
    return await userModel_1.default.findOneAndUpdate({ email }, { password });
};
exports.updateUserPassword = updateUserPassword;
const fetchUserWithPasswordById = async (id) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await userModel_1.default.findOne(dbQuery).select({ _id: 1, name: 1, email: 1, password: 1 }).lean();
};
exports.fetchUserWithPasswordById = fetchUserWithPasswordById;
const updateUserPasswordById = async (id, password) => {
    const dbQuery = {
        _id: (0, objectIdParser_1.ObjectID)(id),
        isDeleted: false,
    };
    return await userModel_1.default.findOneAndUpdate(dbQuery, { password }, { new: true });
};
exports.updateUserPasswordById = updateUserPasswordById;
