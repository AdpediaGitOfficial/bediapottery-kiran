"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByIdUseCase = exports.deleteUserByIdUseCase = exports.updateUserByIdUseCase = exports.resetPasswordUseCase = exports.forgotPasswordUseCase = exports.changePasswordUseCase = exports.getDashboardDataUseCase = exports.getAllUsersUseCase = exports.verifyTokenUseCase = exports.loginUserUseCase = exports.registerUserUseCase = void 0;
const authRepo_1 = require("../repos/authRepo");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appError_1 = __importDefault(require("../../common/appError"));
const logger_1 = __importDefault(require("../../config/logger"));
const httpStatus_1 = require("../../common/httpStatus");
const configKeys_1 = __importDefault(require("../../configKeys"));
const objectIdParser_1 = require("../../utils/objectIdParser");
const passwordResetToken_1 = require("../../utils/passwordResetToken");
const passwordResetMailService_1 = require("../../services/passwordResetMailService");
const createCustomleadUseCase_1 = require("../../customLeads/usecases/createCustomleadUseCase");
// import { getCommunitiesCountController } from '../../community/controllers/communitycontroller';
const community_1 = require("../../community/usecases/community");
// export const registerUserUseCase = async (
//   data: IUserRegisterBody,
// ): Promise<{ token: string; role: string }> => {
//   const { name, email, password, designation } = data;
//   // Check if user already exists
//   const existingUser = await fetchUserByEmail(email);
//   if (existingUser) {
//     throw new AppError('User already exists', HttpStatus.BAD_REQUEST);
//   }
//   // Hash password
//   const hashedPassword = await bcrypt.hash(password, 10);
//   // Create new user
//   await createUser({ name, email, designation, password: hashedPassword });
//   // Create JWT token
//   const token = jwt.sign({ email, role: 'user' }, configKeys.JWT_SECRET, {
//     expiresIn: configKeys.JWT_DURATION,
//   });
//   return { token, role: 'user' };
// };
const registerUserUseCase = async (data) => {
    const { name, email, password, designation } = data;
    // Check if user already exists
    const existingUser = await (0, authRepo_1.fetchUserByEmail)(email);
    if (existingUser) {
        throw new appError_1.default('User already exists', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    // Hash password
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    // Create new user
    const user = await (0, authRepo_1.createUser)({
        name,
        email,
        designation,
        password: hashedPassword,
    });
    if (!user) {
        throw new appError_1.default('Failed to create user', httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
    // Create JWT token
    const token = jsonwebtoken_1.default.sign({ email, role: user.role }, configKeys_1.default.JWT_SECRET, {
        expiresIn: configKeys_1.default.JWT_DURATION,
    });
    return {
        token,
        role: user.role,
        user: {
            userId: String(user._id),
            name: user.name,
            email: user.email,
        },
    };
};
exports.registerUserUseCase = registerUserUseCase;
// export const loginUserUseCase = async (
//   data: IUserLoginBody,
// ): Promise<{ token: string; role: string }> => {
//   const { email, password } = data;
//   // Check if user exists
//   const user = await fetchUserByEmail(email);
//   if (!user) {
//     throw new AppError('User does not exist', HttpStatus.BAD_REQUEST);
//   }
//   // Check password
//   const isPasswordValid = await bcrypt.compare(password, user!.password);
//   if (!isPasswordValid) {
//     throw new AppError('User does not exist pwd', HttpStatus.BAD_REQUEST);
//   }
//   // Create JWT token
//   const token = jwt.sign({ email, role: user!.role }, configKeys.JWT_SECRET, {
//     expiresIn: configKeys.JWT_DURATION,
//   });
//   return { token, role: user!.role };
// };
const loginUserUseCase = async (data) => {
    const { email, password } = data;
    /**
     * Check if user exists
     */
    const user = await (0, authRepo_1.fetchUserByEmail)(email);
    if (!user) {
        throw new appError_1.default('User does not exist', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    /**
     * Check password
     */
    const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new appError_1.default('Invalid password', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    /**
     * Create JWT token
     */
    const token = jsonwebtoken_1.default.sign({ email, role: user.role }, configKeys_1.default.JWT_SECRET, {
        expiresIn: configKeys_1.default.JWT_DURATION,
    });
    return {
        token,
        role: user.role,
        user: {
            userId: String(user._id),
            name: user.name,
            email: user.email,
        },
    };
};
exports.loginUserUseCase = loginUserUseCase;
const verifyTokenUseCase = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, configKeys_1.default.JWT_SECRET);
        if (decoded)
            return true;
        throw new appError_1.default('Invalid token', httpStatus_1.HttpStatus.UNAUTHORIZED);
    }
    catch (error) {
        throw new appError_1.default('Invalid token', httpStatus_1.HttpStatus.UNAUTHORIZED);
    }
};
exports.verifyTokenUseCase = verifyTokenUseCase;
const getAllUsersUseCase = async (queryParams) => {
    const { page = '1', search } = queryParams;
    const { limit = '10' } = queryParams;
    const query = { isDeleted: false }; // Assuming you only want non-deleted documents
    if (search && search.length > 0) {
        query['$or'] = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { designation: { $regex: search, $options: 'i' } },
        ]; // Case-insensitive search
    }
    const totalCount = await (0, authRepo_1.getUsersCount)(query);
    if (!totalCount)
        return { totalCount: 0, users: [] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await (0, authRepo_1.fetchAllUsers)(query, skip, parseInt(limit));
    return { totalCount, users };
};
exports.getAllUsersUseCase = getAllUsersUseCase;
const getDashboardDataUseCase = async () => {
    // No of leads, No of page views, Number of active listings for sales, number of active listings for rent,
    // const query = { isDeleted: false };
    // const leadCount = await getLeadsCount(query);
    const leadCount = await (0, createCustomleadUseCase_1.getCustomLeadCount)();
    const communityCount = await (0, community_1.getCommunitiesCountUseCase)();
    const pageViewCount = 0;
    return {
        leadCount,
        pageViewCount,
        communityCount,
    };
};
exports.getDashboardDataUseCase = getDashboardDataUseCase;
const changePasswordUseCase = async (data) => {
    const { email, oldPassword, newPassword } = data;
    const existingUser = await (0, authRepo_1.fetchUserByEmail)(email);
    if (!existingUser) {
        throw new appError_1.default('Update Failed. Provide valid data', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const validPassword = await bcryptjs_1.default.compare(oldPassword, existingUser.password);
    if (!validPassword) {
        throw new appError_1.default('Upload Failed. Provide valid data', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const password = await bcryptjs_1.default.hash(newPassword, 10);
    const user = await (0, authRepo_1.updateUserPassword)(email, password);
    if (!user)
        throw new appError_1.default('Couldn\'t update User', httpStatus_1.HttpStatus.NOT_FOUND);
    return user;
};
exports.changePasswordUseCase = changePasswordUseCase;
const forgotPasswordUseCase = async (data) => {
    const { email } = data;
    const existingUser = await (0, authRepo_1.fetchUserByEmailInsensitive)(email);
    /**
     * Telling the caller the address is unknown makes account enumeration
     * possible, but a silent success was indistinguishable from a mail delivery
     * failure and left support guessing - so the mismatch is reported outright.
     */
    if (!existingUser) {
        logger_1.default.info('[password-reset] no matching dashboard account', {
            requestedEmail: email,
            flow: 'dashboard',
        });
        throw new appError_1.default('No dashboard account is registered with this email address', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    const token = (0, passwordResetToken_1.generateResetToken)(String(existingUser._id), existingUser.password);
    const resetLink = (0, passwordResetToken_1.buildResetLink)(configKeys_1.default.DASHBOARD_BASE_URL, '/authentication/reset-password', token);
    logger_1.default.info('[password-reset] account matched, building reset link', {
        requestedEmail: email,
        storedEmail: existingUser.email,
        userId: String(existingUser._id),
        flow: 'dashboard',
        /**
         * The base only - the token in the link is a live credential and must not
         * reach the log.
         */
        linkBase: configKeys_1.default.DASHBOARD_BASE_URL,
    });
    await (0, passwordResetMailService_1.sendPasswordResetMail)({
        to: existingUser.email,
        name: existingUser.name,
        resetLink,
        variant: 'dashboard',
    });
    /**
     * The stored address is returned rather than the typed one so the response
     * shows where the mail actually went.
     */
    return existingUser.email;
};
exports.forgotPasswordUseCase = forgotPasswordUseCase;
const resetPasswordUseCase = async (data) => {
    const { token, newPassword } = data;
    const userId = (0, passwordResetToken_1.decodeResetTokenUserId)(token);
    if (!userId || !(0, objectIdParser_1.ObjectID)(userId)) {
        throw new appError_1.default('Reset link is invalid or has expired', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const existingUser = await (0, authRepo_1.fetchUserWithPasswordById)(userId);
    if (!existingUser) {
        throw new appError_1.default('Reset link is invalid or has expired', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    /**
     * Signed with the current hash, so a token already spent on a successful
     * reset no longer verifies.
     */
    const payload = (0, passwordResetToken_1.verifyResetToken)(token, existingUser.password);
    if (!payload) {
        throw new appError_1.default('Reset link is invalid or has expired', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const password = await bcryptjs_1.default.hash(newPassword, 10);
    const updated = await (0, authRepo_1.updateUserPasswordById)(userId, password);
    if (!updated)
        throw new appError_1.default('Couldn\'t update password', httpStatus_1.HttpStatus.NOT_FOUND);
    return true;
};
exports.resetPasswordUseCase = resetPasswordUseCase;
const updateUserByIdUseCase = async (id, data) => {
    const { email, designation, name, oldPassword, newPassword } = data;
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const existingUser = await (0, authRepo_1.fetchUserByEmail)(email);
        if (!existingUser) {
            throw new appError_1.default('Update Failed. Cannot update email field', httpStatus_1.HttpStatus.BAD_REQUEST);
        }
        const body = { email, designation, name };
        if (newPassword && newPassword !== '') {
            if (!oldPassword || oldPassword === '')
                throw new appError_1.default('Upload Failed. Provide valid data', httpStatus_1.HttpStatus.BAD_REQUEST);
            const validPassword = await bcryptjs_1.default.compare(oldPassword, existingUser.password);
            if (validPassword) {
                body.password = await bcryptjs_1.default.hash(newPassword, 10);
            }
            else
                throw new appError_1.default('Upload Failed. Provide valid data', httpStatus_1.HttpStatus.BAD_REQUEST);
        }
        // check for  matching password
        const user = await (0, authRepo_1.updateUserById)(id, body);
        if (!user)
            throw new appError_1.default('Couldn\'t update User', httpStatus_1.HttpStatus.NOT_FOUND);
        return user;
    }
    throw new appError_1.default('No User Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.updateUserByIdUseCase = updateUserByIdUseCase;
const deleteUserByIdUseCase = async (id) => {
    if ((0, objectIdParser_1.ObjectID)(id)) {
        const user = await (0, authRepo_1.deleteUserById)(id);
        // check for  unique value updations
        if (user)
            return true;
    }
    throw new appError_1.default('No User Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.deleteUserByIdUseCase = deleteUserByIdUseCase;
const getUserByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const user = await (0, authRepo_1.fetchUserById)(query._id);
        if (user)
            return user;
    }
    throw new appError_1.default('No User Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getUserByIdUseCase = getUserByIdUseCase;
