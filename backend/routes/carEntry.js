const express = require('express');
const router = express.Router();
const { 
  createEntry, 
  updateExit, 
  getEntries, 
  getEntryById 
} = require('../controllers/carEntryController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/car-entries:
 *   post:
 *     summary: Record a new car entry
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plateNumber
 *               - parking
 *             properties:
 *               plateNumber:
 *                 type: string
 *                 description: Vehicle plate number
 *                 example: RAA123A
 *               parking:
 *                 type: string
 *                 description: ID of the parking lot
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       201:
 *         description: Car entry recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CarEntry'
 *                 ticket:
 *                   type: object
 *                   properties:
 *                     ticketNumber:
 *                       type: string
 *                       example: TKT-20240320-001
 *                     entryTime:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-03-20T10:00:00Z
 *       400:
 *         description: Invalid input or parking lot full
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - Admin or parking attendant access required
 */
router.post('/', protect, authorize('admin', 'parking_attendant'), createEntry);

/**
 * @swagger
 * /api/car-entries/{id}/exit:
 *   put:
 *     summary: Record car exit and generate bill
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Car entry ID
 *     responses:
 *       200:
 *         description: Car exit recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CarEntry'
 *                 bill:
 *                   type: object
 *                   properties:
 *                     ticketNumber:
 *                       type: string
 *                       example: TKT-20240320-001
 *                     plateNumber:
 *                       type: string
 *                       example: RAA123A
 *                     entryTime:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-03-20T10:00:00Z
 *                     exitTime:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-03-20T12:00:00Z
 *                     duration:
 *                       type: string
 *                       example: 2 hours
 *                     rate:
 *                       type: number
 *                       example: 1000
 *                     amount:
 *                       type: number
 *                       example: 2000
 *       400:
 *         description: Invalid input or car already exited
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - Admin or parking attendant access required
 *       404:
 *         description: Car entry not found
 */
router.put('/:id/exit', protect, authorize('admin', 'parking_attendant'), updateExit);

/**
 * @swagger
 * /api/car-entries:
 *   get:
 *     summary: Get all car entries
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed]
 *         description: Filter by entry status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: plateNumber
 *         schema:
 *           type: string
 *         description: Filter by plate number
 *     responses:
 *       200:
 *         description: List of car entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CarEntry'
 *       401:
 *         description: Not authorized
 */
router.get('/', protect, getEntries);

/**
 * @swagger
 * /api/car-entries/{id}:
 *   get:
 *     summary: Get a car entry by ID
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Car entry ID
 *     responses:
 *       200:
 *         description: Car entry details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CarEntry'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Car entry not found
 */
router.get('/:id', protect, getEntryById);

module.exports = router;