const mongoose = require('mongoose');

const EvidenceRecordSchema = new mongoose.Schema({
    complaint_id: { type: Number, required: true, index: true },
    evidence_type: { type: String, enum: ['IMAGE', 'VIDEO', 'DOCUMENT'], required: true },
    file_url: { type: String, required: true },
    description: { type: String },
    uploaded_by_officer_id: { type: Number, required: true },
    uploaded_at: { type: Date, default: Date.now },
    tags: [String],
    visibility: { type: String, enum: ['PRIVATE', 'VICTIM', 'PUBLIC'], default: 'PRIVATE' }
});

module.exports = mongoose.model('EvidenceRecord', EvidenceRecordSchema);
