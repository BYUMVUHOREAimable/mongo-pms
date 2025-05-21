const express = require('express');
const router = express.Router();
const { 
  createParking, 
  getParkings, 
  getParkingById, 
  updateParking, 
  deleteParking 
} = require('../controllers/parkingController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/parking:
 *   post:
 *     summary: Create a new parking lot
 *     tags: [Parking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Parking'
 *     responses:
 *       201:
 *         description: Parking lot created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Parking lot created successfully
 *                 parking:
 *                   $ref: '#/components/schemas/Parking'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/', protect, authorize('admin'), createParking);

/**
 * @swagger
 * /api/parking:
 *   get:
 *     summary: Get all parking lots
 *     tags: [Parking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by available spaces
 *     responses:
 *       200:
 *         description: List of parking lots
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
 *                     $ref: '#/components/schemas/Parking'
 *       401:
 *         description: Not authorized
 */
router.get('/', protect, getParkings);

/**
 * @swagger
 * /api/parking/{id}:
 *   get:
 *     summary: Get a parking lot by ID
 *     tags: [Parking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parking lot ID
 *     responses:
 *       200:
 *         description: Parking lot details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Parking'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Parking lot not found
 */
router.get('/:id', protect, getParkingById);

/**
 * @swagger
 * /api/parking/{id}:
 *   put:
 *     summary: Update a parking lot
 *     tags: [Parking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parking lot ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Parking'
 *     responses:
 *       200:
 *         description: Parking lot updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Parking'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Parking lot not found
 */
router.put('/:id', protect, authorize('admin'), updateParking);

/**
 * @swagger
 * /api/parking/{id}:
 *   delete:
 *     summary: Delete a parking lot
 *     tags: [Parking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parking lot ID
 *     responses:
 *       200:
 *         description: Parking lot deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Parking lot deleted successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Parking lot not found
 */
router.delete('/:id', protect, authorize('admin'), deleteParking);

module.exports = router;