"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("./config/logger"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const connectToDatabase_1 = __importDefault(require("./config/connectToDatabase"));
const errorHandleMiddleware_1 = __importDefault(require("./middleware/errorHandleMiddleware"));
const configKeys_1 = __importDefault(require("./configKeys"));
const swaggerConfig_1 = __importDefault(require("./swaggerdocs/swaggerConfig"));
const fileUploadRoute_1 = __importDefault(require("./fileupload/routes/fileUploadRoute"));
const blogRoute_1 = __importDefault(require("./blog/routes/blogRoute"));
const commentRoute_1 = __importDefault(require("./comment/routes/commentRoute"));
const testimonialRoute_1 = __importDefault(require("./testimonial/routes/testimonialRoute"));
const partnerRoute_1 = __importDefault(require("./partner/routes/partnerRoute"));
const reportRoute_1 = __importDefault(require("./report/routes/reportRoute"));
const categoryRoute_1 = __importDefault(require("./category/routes/categoryRoute"));
const workshopRoute_1 = __importDefault(require("./workshop/routes/workshopRoute"));
const authRoute_1 = __importDefault(require("./auth/routes/authRoute"));
const careerRoute_1 = __importDefault(require("./careers/routes/careerRoute"));
const careerFooterRoute_1 = __importDefault(require("./careerfooter/routes/careerFooterRoute"));
const pageMetaRoute_1 = __importDefault(require("./pageMeta/routes/pageMetaRoute"));
const customLeadRoute_1 = __importDefault(require("./customLeads/routes/customLeadRoute"));
const communityroute_1 = __importDefault(require("./community/routes/communityroute"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const brochureRoute_1 = __importDefault(require("./brochure/routes/brochureRoute"));
const googleReviewRoute_1 = __importDefault(require("./googleReview/routes/googleReviewRoute"));
const galleryRoute_1 = __importDefault(require("./gallery/routes/galleryRoute"));
const faqRoute_1 = __importDefault(require("./faq/routes/faqRoute"));
const userRoutes_1 = __importDefault(require("./user/routes/userRoutes"));
const clayTypeRoute_1 = __importDefault(require("./clayType/routes/clayTypeRoute"));
const termsAndConditionRoute_1 = __importDefault(require("./termsAndConditions/routes/termsAndConditionRoute"));
const openingHoursRoute_1 = __importDefault(require("./openingHours/routes/openingHoursRoute"));
const dashboardRoute_1 = __importDefault(require("./dashboard/routes/dashboardRoute"));
const studioRoute_1 = __importDefault(require("./studio/routes/studioRoute"));
const workshopController_1 = require("./workshop/controllers/workshopController");
const potteryTrackingJob_1 = require("./workshop/jobs/potteryTrackingJob");
const paymentCheckJob_1 = require("./workshop/jobs/paymentCheckJob");
const uploadedFiles_1 = require("./utils/uploadedFiles");
const app = (0, express_1.default)();
(0, connectToDatabase_1.default)();
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, './uploads')));
// Files uploaded from the dashboard are saved by multer in ../uploads, outside dist.
app.use('/uploads', (0, uploadedFiles_1.serveUploadedFiles)(path_1.default.join(__dirname, '../uploads')));
const corsOptions = {
    origin: JSON.parse(configKeys_1.default.CORS_URLS),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
// For stripe
app.post('/workshop/stripe-webhook', express_1.default.raw({ type: 'application/json' }), workshopController_1.stripeWebhookController);
app.get('/test-email', workshopController_1.testBookingEmail);
app.use(express_1.default.json({ limit: '30mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Set secure cookie options
app.use((req, res, next) => {
    res.cookie('sessionId', process.env.SESSION_ID, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // This is the key setting
        path: '/',
        maxAge: 3600000, // 1 hour
    });
    next();
});
app.use('/blog', blogRoute_1.default);
app.use('/comment', commentRoute_1.default);
app.use('/testimonial', testimonialRoute_1.default);
app.use('/partner', partnerRoute_1.default);
app.use('/customleads', customLeadRoute_1.default);
app.use('/report', reportRoute_1.default);
app.use('/category', categoryRoute_1.default);
app.use('/workshop', workshopRoute_1.default);
app.use('/auth', authRoute_1.default);
app.use('/careers', careerRoute_1.default);
app.use('/careerfooter', careerFooterRoute_1.default);
app.use('/meta-data', pageMetaRoute_1.default);
app.use('/community', communityroute_1.default);
app.use('/upload', fileUploadRoute_1.default);
app.use('/brochure', brochureRoute_1.default);
app.use('/reviews', googleReviewRoute_1.default);
app.use('/gallery', galleryRoute_1.default);
app.use('/faq', faqRoute_1.default);
app.use('/user', userRoutes_1.default);
app.use('/clay-type', clayTypeRoute_1.default);
app.use('/terms-and-conditions', termsAndConditionRoute_1.default);
app.use('/opening-hours', openingHoursRoute_1.default);
app.use('/dashboard', dashboardRoute_1.default);
app.use('/studio', studioRoute_1.default);
app.use(errorHandleMiddleware_1.default);
app.get('/hello', (req, res) => {
    res.send('hello world');
});
const port = configKeys_1.default.PORT;
app.listen(port, () => {
    logger_1.default.info(`application is running at port ${port}`);
    (0, swaggerConfig_1.default)(app);
    // Moves tracked pottery through drying, firing and painting, turns pieces
    // ready after three weeks, warns about and then discards uncollected ones.
    (0, potteryTrackingJob_1.startPotteryTrackingJob)();
    (0, paymentCheckJob_1.startPaymentCheckJob)();
});
