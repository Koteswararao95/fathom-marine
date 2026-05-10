const express = require('express');
const MaintenanceTask = require('../models/MaintenanceTask');
const SafetyDrill = require('../models/SafetyDrill');
const Ship = require('../models/Ship');
const { protect } = require('../middleware/auth');
const router = express.Router();

// GET /api/compliance  — Overall compliance per ship
router.get('/', protect, async (req, res) => {
  try {
    const ships = await Ship.find();
    const now = new Date();

    const results = await Promise.all(ships.map(async (ship) => {
      // Maintenance stats
      const allTasks = await MaintenanceTask.find({ shipId: ship._id });
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(t => t.status === 'Completed').length;
      const overdueTasks = allTasks.filter(t => t.status !== 'Completed' && new Date(t.dueDate) < now).length;
      const pendingTasks = allTasks.filter(t => t.status === 'Pending').length;
      const inProgressTasks = allTasks.filter(t => t.status === 'In Progress').length;
      const maintenanceCompliance = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 100;

      // Drill stats
      const allDrills = await SafetyDrill.find({ shipId: ship._id });
      const totalDrills = allDrills.length;
      const completedDrills = allDrills.filter(d => d.status === 'Completed').length;
      const missedDrills = allDrills.filter(d => d.status !== 'Completed' && new Date(d.scheduledDate) < now).length;
      const scheduledDrills = allDrills.filter(d => d.status === 'Scheduled' && new Date(d.scheduledDate) >= now).length;

      // Drill participation
      let totalParticipants = 0;
      let attendedParticipants = 0;
      allDrills.forEach(drill => {
        totalParticipants += drill.participants.length;
        attendedParticipants += drill.participants.filter(p => p.attended).length;
      });
      const drillParticipation = totalParticipants > 0
        ? Math.round((attendedParticipants / totalParticipants) * 100)
        : 100;

      const drillCompliance = totalDrills > 0
        ? Math.round((completedDrills / totalDrills) * 100)
        : 100;

      // Overall compliance score (average)
      const overallCompliance = Math.round((maintenanceCompliance + drillCompliance) / 2);

      return {
        ship: { _id: ship._id, name: ship.name, imoNumber: ship.imoNumber, status: ship.status },
        maintenance: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          overdue: overdueTasks,
          complianceRate: maintenanceCompliance
        },
        drills: {
          total: totalDrills,
          completed: completedDrills,
          missed: missedDrills,
          scheduled: scheduledDrills,
          participationRate: drillParticipation,
          complianceRate: drillCompliance
        },
        overallCompliance,
        isNonCompliant: overallCompliance < 70
      };
    }));

    // Global summary
    const globalStats = {
      totalShips: ships.length,
      nonCompliantShips: results.filter(r => r.isNonCompliant).length,
      avgCompliance: results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.overallCompliance, 0) / results.length)
        : 100,
      totalOverdueTasks: results.reduce((sum, r) => sum + r.maintenance.overdue, 0),
      totalMissedDrills: results.reduce((sum, r) => sum + r.drills.missed, 0)
    };

    res.json({ globalStats, ships: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/compliance/ship/:shipId  — Single ship compliance
router.get('/ship/:shipId', protect, async (req, res) => {
  try {
    const ship = await Ship.findById(req.params.shipId);
    if (!ship) return res.status(404).json({ message: 'Ship not found' });
    const now = new Date();

    const allTasks = await MaintenanceTask.find({ shipId: ship._id })
      .populate('assignedTo', 'name');
    const allDrills = await SafetyDrill.find({ shipId: ship._id });

    const overdueTasks = allTasks.filter(t => t.status !== 'Completed' && new Date(t.dueDate) < now);
    const missedDrills = allDrills.filter(d => d.status !== 'Completed' && new Date(d.scheduledDate) < now);

    res.json({
      ship,
      overdueTasks,
      missedDrills,
      recentTasks: allTasks.slice(-5),
      upcomingDrills: allDrills.filter(d => d.status === 'Scheduled' && new Date(d.scheduledDate) >= now)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
