"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const propertyFinderController_1 = require("../controllers/propertyFinderController");
const router = (0, express_1.Router)();
router.get('/all', propertyFinderController_1.getAllPropertyFinderProperties);
router.get('/:id', propertyFinderController_1.getSinglePropertyFinderProperty);
exports.default = router;
