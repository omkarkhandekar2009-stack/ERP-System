const Activity = require('../models/Activity');
const Productivity = require('../models/Productivity');

// @desc  Log activity (called from desktop Electron app)
// @route POST /api/activity
// @access Private
const logActivity = async (req, res) => {
  try {
    const { appName, windowTitle, category, durationSeconds, isPrivate } = req.body;

    const activity = await Activity.create({
      user: req.user._id,
      appName,
      windowTitle: isPrivate ? '[Private]' : windowTitle,
      category,
      durationSeconds,
      isPrivate: !!isPrivate,
    });

    // Trigger productivity recalc (async, don't await)
    recalcProductivity(req.user._id).catch(console.error);

    res.status(201).json({ success: true, activity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get my activity today
// @route GET /api/activity/me
// @access Private
const getMyActivity = async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);

    const activities = await Activity.find({
      user: req.user._id,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    res.json({ success: true, count: activities.length, activities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get hourly breakdown for chart
// @route GET /api/activity/hourly/:userId
// @access Private (manager)
const getHourlyBreakdown = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const start = new Date(dateStr); start.setHours(0, 0, 0, 0);
    const end = new Date(dateStr); end.setHours(23, 59, 59, 999);

    const result = await Activity.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
      { $group: { _id: { hour: '$hour', category: '$category' }, totalSeconds: { $sum: '$durationSeconds' } } },
      { $sort: { '_id.hour': 1 } },
    ]);

    res.json({ success: true, breakdown: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get team activity (manager only)
// @route GET /api/activity/team
// @access Private (manager/admin)
const getTeamActivity = async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);

    const result = await Activity.aggregate([
      { $match: { date: { $gte: start } } },
      { $group: { _id: '$user', totalSeconds: { $sum: '$durationSeconds' }, topApp: { $first: '$appName' } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { 'user.password': 0 } },
    ]);

    res.json({ success: true, team: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Internal: recalculate productivity score for today
async function recalcProductivity(userId) {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(); end.setHours(23, 59, 59, 999);

  const activities = await Activity.find({ user: userId, date: { $gte: start, $lte: end }, isPrivate: false });

  const totalActive = activities.filter(a => a.category !== 'idle').reduce((s, a) => s + a.durationSeconds, 0);
  const totalIdle = activities.filter(a => a.category === 'idle').reduce((s, a) => s + a.durationSeconds, 0);
  const totalAll = totalActive + totalIdle;

  const score = totalAll > 0 ? Math.min(100, Math.round((totalActive / totalAll) * 100)) : 0;

  // App usage summary
  const appMap = {};
  activities.forEach(a => {
    appMap[a.appName] = (appMap[a.appName] || 0) + a.durationSeconds;
  });
  const topApps = Object.entries(appMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([appName, durationSeconds]) => ({ appName, durationSeconds }));

  // Burnout: if active > 10h
  const burnoutRisk = totalActive > 36000 ? 'high' : totalActive > 25200 ? 'medium' : 'low';

  await Productivity.findOneAndUpdate(
    { user: userId, date: start },
    { score, totalActiveSeconds: totalActive, totalIdleSeconds: totalIdle, burnoutRisk, topApps },
    { upsert: true, new: true }
  );
}

module.exports = { logActivity, getMyActivity, getHourlyBreakdown, getTeamActivity };
