"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartnerById = exports.deletePartnerById = exports.updatePartnerById = exports.createPartner = exports.getAllPartnersForAdmin = exports.getAllPartners = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const partnerUseCase_1 = require("../useCases/partnerUseCase");
exports.getAllPartners = (0, express_async_handler_1.default)(async (req, res) => {
    const partners = await (0, partnerUseCase_1.getAllPartnersUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Partners successfully',
        result: partners,
    });
});
exports.getAllPartnersForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const partners = await (0, partnerUseCase_1.getAllPartnersForAdminUseCase)(req.query);
    res.status(200).json({
        success: true,
        message: 'Fetched All Partners successfully',
        result: partners,
    });
});
exports.createPartner = (0, express_async_handler_1.default)(async (req, res) => {
    const data = req.body;
    await (0, partnerUseCase_1.createPartnerUseCase)(data);
    res.status(200).json({
        success: true,
        message: 'Created Partner successfully',
        result: true,
    });
});
exports.updatePartnerById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    await (0, partnerUseCase_1.updatePartnerByIdUseCase)(id, data);
    res.status(200).json({
        success: true,
        message: 'Updated Partner successfully',
        result: true,
    });
});
exports.deletePartnerById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    await (0, partnerUseCase_1.deletePartnerByIdUseCase)(id);
    res.status(200).json({
        success: true,
        message: 'Deleted Partner successfully',
        result: true,
    });
});
exports.getPartnerById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const partner = await (0, partnerUseCase_1.getPartnerByIdUseCase)({ _id: id });
    res.status(200).json({
        success: true,
        message: 'Fetched Partner successfully',
        result: partner,
    });
});
