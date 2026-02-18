"use strict";
// src/routes/calendar.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const calendar_controller_1 = require("../controllers/calendar.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// GET /api/calendar/events?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/events', calendar_controller_1.CalendarController.getEvents);
exports.default = router;
//# sourceMappingURL=calendar.routes.js.map