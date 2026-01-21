const { PrismaClient } = require('@prisma/client');
const CaseUpdate = require('../models/CaseUpdate');
const EvidenceRecord = require('../models/EvidenceRecord');

const prisma = new PrismaClient();

// Lodge Complaint
exports.lodgeComplaint = async (req, res) => {
    const { title, description, incident_location, category, station_id } = req.body;
    try {
        const complaint = await prisma.complaint.create({
            data: {
                victim_id: req.user.id,
                title,
                description,
                incident_location,
                category,
                station_id: parseInt(station_id), // Auto-assign to station (simplified)
                current_status: 'PENDING'
            }
        });

        // Initialize Mongo Case Update doc
        await new CaseUpdate({ complaint_id: complaint.complaint_id, updates: [] }).save();

        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get My Complaints (Victim)
exports.getMyComplaints = async (req, res) => {
    try {
        const complaints = await prisma.complaint.findMany({
            where: { victim_id: req.user.id },
            include: { station: true, assigned_officer: true }
        });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Complaints (Officer - for their station)
// Simplified: Officer sees all complaints assigned to them or their station
exports.getAllComplaints = async (req, res) => {
    if (req.user.role !== 'OFFICER') return res.status(403).json({ message: 'Access denied' });
    try {
        // Fetch officer's station
        const officer = await prisma.policeOfficer.findUnique({ where: { officer_id: req.user.id } });

        const complaints = await prisma.complaint.findMany({
            where: { station_id: officer.station_id },
            include: { victim: true }
        });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Complaint Details (SQL + Mongo)
exports.getComplaintDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const complaint = await prisma.complaint.findUnique({
            where: { complaint_id: parseInt(id) },
            include: { victim: true, station: true, assigned_officer: true }
        });

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        // Fetch Mongo Data
        const updates = await CaseUpdate.findOne({ complaint_id: parseInt(id) });
        const evidence = await EvidenceRecord.find({ complaint_id: parseInt(id) });

        res.json({ ...complaint, timeline: updates ? updates.updates : [], evidence });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Status (SQL)
exports.updateStatus = async (req, res) => {
    if (req.user.role !== 'OFFICER') return res.status(403).json({ message: 'Access denied' });
    const { id } = req.params;
    const { status, remarks } = req.body;

    try {
        const complaint = await prisma.complaint.update({
            where: { complaint_id: parseInt(id) },
            data: { current_status: status }
        });

        // Log in History
        await prisma.complaintStatus.create({
            data: {
                complaint_id: parseInt(id),
                status,
                updated_by_officer_id: req.user.id,
                remarks
            }
        });

        // Add to Mongo Timeline automatically
        await CaseUpdate.findOneAndUpdate(
            { complaint_id: parseInt(id) },
            {
                $push: {
                    updates: {
                        text: `Status changed to ${status}: ${remarks}`,
                        author_role: 'POLICE',
                        author_id: req.user.id,
                        visibility: 'VICTIM'
                    }
                }
            }
        );

        res.json(complaint);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add Case Update (Mongo)
exports.addCaseUpdate = async (req, res) => {
    const { id } = req.params;
    const { text, visibility } = req.body;

    try {
        const update = await CaseUpdate.findOneAndUpdate(
            { complaint_id: parseInt(id) },
            {
                $push: {
                    updates: {
                        text,
                        author_role: req.user.role, // 'POLICE' or 'VICTIM'
                        author_id: req.user.id,
                        visibility: visibility || 'VICTIM'
                    }
                }
            },
            { new: true, upsert: true }
        );
        res.json(update);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add Evidence (Mongo)
exports.addEvidence = async (req, res) => {
    if (req.user.role !== 'OFFICER') return res.status(403).json({ message: 'Access denied' });
    const { id } = req.params;
    const { file_url, evidence_type, description } = req.body;

    try {
        const evidence = new EvidenceRecord({
            complaint_id: parseInt(id),
            evidence_type, // 'IMAGE', 'VIDEO', 'DOCUMENT'
            file_url,
            description,
            uploaded_by_officer_id: req.user.id,
            visibility: 'PRIVATE' // Default
        });
        await evidence.save();
        res.json(evidence);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
