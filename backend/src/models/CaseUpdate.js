const mongoose = require('mongoose');

const CaseUpdateSchema = new mongoose.Schema({
  complaint_id: { type: Number, required: true, index: true }, // Refers to SQL Complaint ID
  updates: [
    {
      text: { type: String, required: true },
      author_role: { type: String, enum: ['POLICE', 'VICTIM', 'SYSTEM'], required: true },
      author_id: { type: Number, required: true }, // police_officer_id or victim_id
      author_name: { type: String },
      timestamp: { type: Date, default: Date.now },
      visibility: { type: String, enum: ['PRIVATE', 'VICTIM', 'PUBLIC'], default: 'VICTIM' }
    }
  ]
});

module.exports = mongoose.model('CaseUpdate', CaseUpdateSchema);
