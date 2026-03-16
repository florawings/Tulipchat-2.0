const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    evidence: { type: String }, // Screenshot link ya message ID
    status: { type: String, default: 'pending' }, // pending, resolved, dismissed
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
