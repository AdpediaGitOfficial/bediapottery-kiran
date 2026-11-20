"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByIdUseCase = exports.resetPasswordUseCase = exports.forgotPasswordUseCase = exports.changePasswordUseCase = exports.deleteAccountUseCase = exports.logoutUseCase = exports.registerAdminUseCase = exports.userLoginUseCase = exports.loginUseCase = exports.getUsersUseCase = exports.updateUserUseCase = exports.getProfileUseCase = exports.sendOtpUseCase = exports.uploadAvatarUseCase = exports.verifyOtpUseCase = exports.registerUserUseCase = void 0;
const authentication_1 = require("../../authentication/authentication");
const appError_1 = __importDefault(require("../../common/appError"));
const httpStatus_1 = require("../../common/httpStatus");
const twilioService_1 = require("../../services/twilioService");
const passwordResetMailService_1 = require("../../services/passwordResetMailService");
const logger_1 = __importDefault(require("../../config/logger"));
const configKeys_1 = __importDefault(require("../../configKeys"));
//import { BrevoService } from '../../services/brevoService';
const objectIdParser_1 = require("../../utils/objectIdParser");
const passwordResetToken_1 = require("../../utils/passwordResetToken");
const registerUserRepo_1 = require("../repos/registerUserRepo");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// export const registerUserUseCase = async (
//   data: IUserBody,
// ): Promise<{ _id: string; otp: string }> => {
//   //  export const registerUserUseCase = async (data: IUserBody): Promise<Pick<IUsers, '_id'>> => {
//   const userExist = await checkUserExist(data.email ?? '', data.mobileNumber);
//   if (userExist) {
//     if (!userExist.mobileNumberVerified) {
//       const otp = Math.floor(100000 + Math.random() * 900000).toString();
//       await sendOtp(data.mobileNumber, otp);
//       await updateUser(userExist._id as string, { ...data, otp });
//       return { _id: userExist._id as string, otp };
//     } else {
//       throw new AppError('User Mobile Number/Email Already Exist', HttpStatus.BAD_REQUEST);
//     }
//   }
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   await sendOtp(data.mobileNumber, otp);
//   data.status = 1;
//   data.role = 'user';
//   const result = await createUser(data, otp);
//   return result;
// };
const registerUserUseCase = async (data) => {
    const userExist = await (0, registerUserRepo_1.checkUserExist)(data.email ?? '');
    if (userExist) {
        throw new appError_1.default('User Email Already Exist', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    data.status = 1;
    data.role = 'user';
    data.password = await (0, registerUserRepo_1.hashPassword)(data.password);
    const result = await (0, registerUserRepo_1.createUser)(data);
    return result;
};
exports.registerUserUseCase = registerUserUseCase;
const verifyOtpUseCase = async (data) => {
    const { mobileNumber, otp, deviceId, deviceType } = data;
    const otpCheck = await (0, registerUserRepo_1.verifyOtp)(mobileNumber, otp);
    if (!otpCheck)
        throw new appError_1.default('Invalid OTP', httpStatus_1.HttpStatus.BAD_REQUEST);
    await (0, registerUserRepo_1.setUserVerified)(otpCheck._id);
    const token = (0, authentication_1.generateTokenUser)({ role: 'user', userId: otpCheck._id });
    await (0, registerUserRepo_1.saveUserToken)(otpCheck._id, deviceId, deviceType, token);
    const result = await (0, registerUserRepo_1.getProfileById)(otpCheck._id);
    if (!result)
        throw new appError_1.default('User profile not found', httpStatus_1.HttpStatus.NOT_FOUND);
    return {
        token,
        ...result,
    };
};
exports.verifyOtpUseCase = verifyOtpUseCase;
const uploadAvatarUseCase = async (file, studentId) => {
    //  const imageUrl = await processAndUploadImage(file, 'avatar');
    // const imageUrl = imageUrl;
    // upload the avatar url to db using id from the token
    // const upload = await uploadAvatar(studentId);
    // if (!upload) throw new AppError('Image upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
    return studentId;
};
exports.uploadAvatarUseCase = uploadAvatarUseCase;
const sendOtpUseCase = async (data) => {
    //check exists
    const userExist = await (0, registerUserRepo_1.checkUserNumberExist)(data.mobileNumber, data.type);
    if (!userExist)
        throw new appError_1.default('User Not Found', httpStatus_1.HttpStatus.BAD_REQUEST);
    //const otp = '112233';
    let otp;
    const fixedOtpNumbers = [
        7306548087, 5500111111, 5500111112, 5500111113, 5500111114, 5500111115, 5500111116, 5500111117,
        5500111118, 5500111119, 5500111120, 8089838462, 8157956783, 8921137041, 8281005156, 9495956000,
        9946101989, 9446528172,
    ];
    if (fixedOtpNumbers.includes(data.mobileNumber)) {
        otp = '112233';
    }
    else if (data.mobileNumber === 9020493835) {
        otp = '123456';
    }
    else if (data.mobileNumber === 7907723393) {
        otp = '112114';
    }
    else if (userExist.fixedOtp) {
        otp = userExist.fixedOtp;
    }
    else {
        otp = Math.floor(100000 + Math.random() * 900000).toString();
        await (0, twilioService_1.sendOtp)(data.mobileNumber, otp);
    }
    await (0, registerUserRepo_1.updateUserOtp)(data.mobileNumber, otp);
    return otp;
};
exports.sendOtpUseCase = sendOtpUseCase;
const getProfileUseCase = async (userId) => {
    const result = await (0, registerUserRepo_1.getProfile)(userId);
    if (!result) {
        throw new appError_1.default('No User found for the given user ID', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    return {
        ...result,
    };
};
exports.getProfileUseCase = getProfileUseCase;
const updateUserUseCase = async (userId, data) => {
    const chkUser = await (0, registerUserRepo_1.getProfile)(userId);
    if (!chkUser) {
        throw new appError_1.default('No User found for the given user ID', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    const chkDataExist = await (0, registerUserRepo_1.checkMobileEmailExist)(data.mobileNumber, userId, data.email);
    if (chkDataExist)
        throw new appError_1.default('User Mobile Number/Email Exist', httpStatus_1.HttpStatus.BAD_REQUEST);
    const userData = {
        mobileNumber: data.mobileNumber,
        dob: data.dob,
        email: data.email,
        parentDob: data.parentDob,
        parentName: data.parentName,
        interest: data.interest,
    };
    const result = await (0, registerUserRepo_1.updateUser)(userId, userData);
    return {
        ...result,
    };
};
exports.updateUserUseCase = updateUserUseCase;
const getUsersUseCase = async (filters, limit, page) => {
    const result = await (0, registerUserRepo_1.getAllUsers)(filters, limit, page);
    if (!result.data || result.data.length === 0) {
        throw new appError_1.default('No Users found', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    return result;
};
exports.getUsersUseCase = getUsersUseCase;
const loginUseCase = async (data) => {
    const { email, password } = data;
    const check = await (0, registerUserRepo_1.verifyLogin)(email, password);
    if (!check)
        throw new appError_1.default('Invalid Email/Password', httpStatus_1.HttpStatus.BAD_REQUEST);
    const token = (0, authentication_1.generateToken)({ role: 'admin', userId: check._id });
    //await saveUserToken(otpCheck._id, deviceId, deviceType, token);
    const result = await (0, registerUserRepo_1.getProfileById)(check._id);
    if (!result)
        throw new appError_1.default('User profile not found', httpStatus_1.HttpStatus.NOT_FOUND);
    return { token, ...result };
};
exports.loginUseCase = loginUseCase;
const userLoginUseCase = async (data) => {
    const { email, password } = data;
    const check = await (0, registerUserRepo_1.verifyLogin)(email, password);
    if (!check)
        throw new appError_1.default('Invalid Email/Password', httpStatus_1.HttpStatus.BAD_REQUEST);
    const token = (0, authentication_1.generateTokenUser)({ role: 'user', userId: check._id });
    const result = await (0, registerUserRepo_1.getProfileById)(check._id);
    if (!result)
        throw new appError_1.default('User profile not found', httpStatus_1.HttpStatus.NOT_FOUND);
    return { token, ...result };
};
exports.userLoginUseCase = userLoginUseCase;
const registerAdminUseCase = async (data) => {
    //check userAlready exist
    const userExist = await (0, registerUserRepo_1.checkUserExist)(data.email ?? '');
    if (userExist)
        throw new appError_1.default('User Mobile Number/Email Already Exist', httpStatus_1.HttpStatus.BAD_REQUEST);
    data.status = 1;
    data.role = 'admin';
    const hashedPassword = await (0, registerUserRepo_1.hashPassword)(data.password);
    data.password = hashedPassword;
    const result = await (0, registerUserRepo_1.createAdmin)(data);
    return result;
};
exports.registerAdminUseCase = registerAdminUseCase;
const logoutUseCase = async (userId, deviceType) => {
    const result = await (0, registerUserRepo_1.deleteToken)(userId, deviceType);
    if (!result) {
        throw new appError_1.default('Token not found or already invalidated.', httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return true;
};
exports.logoutUseCase = logoutUseCase;
const deleteAccountUseCase = async (userId) => {
    const result = await (0, registerUserRepo_1.deleteAccountByUser)(userId);
    if (!result) {
        throw new appError_1.default('Unable to delete account.', httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return true;
};
exports.deleteAccountUseCase = deleteAccountUseCase;
const changePasswordUseCase = async (userId, data) => {
    const { oldPassword, newPassword } = data;
    const user = await (0, registerUserRepo_1.getUserPasswordById)(userId);
    if (!user) {
        throw new appError_1.default('No User found for the given user ID', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    if (!user.password) {
        throw new appError_1.default('Password login is not enabled for this account', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const isMatch = await bcryptjs_1.default.compare(oldPassword, user.password);
    if (!isMatch) {
        throw new appError_1.default('Current password is incorrect', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const isSamePassword = await bcryptjs_1.default.compare(newPassword, user.password);
    if (isSamePassword) {
        throw new appError_1.default('New password must be different from the current password', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const hashedPassword = await (0, registerUserRepo_1.hashPassword)(newPassword);
    const result = await (0, registerUserRepo_1.updateUserPassword)(userId, hashedPassword);
    if (!result) {
        throw new appError_1.default('Unable to update password', httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return true;
};
exports.changePasswordUseCase = changePasswordUseCase;
const forgotPasswordUseCase = async (data) => {
    const { email } = data;
    const user = await (0, registerUserRepo_1.findActiveUserByEmail)(email);
    /**
     * Telling the caller the address is unknown makes account enumeration
     * possible, but a silent success was indistinguishable from a mail delivery
     * failure and left support guessing - so the mismatch is reported outright.
     */
    if (!user) {
        logger_1.default.info('[password-reset] no matching active user, nothing sent', {
            requestedEmail: email,
            flow: 'customer',
        });
        throw new appError_1.default('No account is registered with this email address', httpStatus_1.HttpStatus.NOT_FOUND);
    }
    logger_1.default.info('[password-reset] account matched, building reset link', {
        requestedEmail: email,
        storedEmail: user.email,
        userId: String(user._id),
        flow: 'customer',
        /**
         * The base only - the token in the link is a live credential and must not
         * reach the log.
         */
        linkBase: configKeys_1.default.CLIENT_BASE_URL,
    });
    const token = (0, passwordResetToken_1.generateResetToken)(user._id, user.password ?? '');
    const resetLink = (0, passwordResetToken_1.buildResetLink)(configKeys_1.default.CLIENT_BASE_URL, '/reset-password', token);
    /**
     * Sent to the stored address rather than the typed one so the mail still
     * reaches the account when the two differ only by case.
     */
    const recipient = user.email ?? email;
    await (0, passwordResetMailService_1.sendPasswordResetMail)({
        to: recipient,
        name: user.fullName ?? user.name,
        resetLink,
    });
    return recipient;
};
exports.forgotPasswordUseCase = forgotPasswordUseCase;
const resetPasswordUseCase = async (data) => {
    const { token, newPassword } = data;
    const userId = (0, passwordResetToken_1.decodeResetTokenUserId)(token);
    if (!userId || !(0, objectIdParser_1.ObjectID)(userId)) {
        throw new appError_1.default('Reset session is invalid or has expired', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const user = await (0, registerUserRepo_1.getUserPasswordById)(userId);
    if (!user) {
        throw new appError_1.default('Reset session is invalid or has expired', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    /**
     * Signed with the password hash in force when the link was issued, so a
     * token already spent on a successful reset no longer verifies.
     */
    const payload = (0, passwordResetToken_1.verifyResetToken)(token, user.password ?? '');
    if (!payload) {
        throw new appError_1.default('Reset session is invalid or has expired', httpStatus_1.HttpStatus.BAD_REQUEST);
    }
    const hashedPassword = await (0, registerUserRepo_1.hashPassword)(newPassword);
    const result = await (0, registerUserRepo_1.updateUserPassword)(userId, hashedPassword);
    if (!result) {
        throw new appError_1.default('Unable to reset password', httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return true;
};
exports.resetPasswordUseCase = resetPasswordUseCase;
const getUserByIdUseCase = async (query) => {
    if ((0, objectIdParser_1.ObjectID)(query._id)) {
        const user = await (0, registerUserRepo_1.fetchUserById)(query._id);
        if (user)
            return user;
    }
    throw new appError_1.default('No User Found', httpStatus_1.HttpStatus.NOT_FOUND);
};
exports.getUserByIdUseCase = getUserByIdUseCase;
