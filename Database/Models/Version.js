const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  version: { type: Number, required: true, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Version', versionSchema);
