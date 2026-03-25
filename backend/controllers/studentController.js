const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const Project = require('../models/Project');
const Hackathon = require('../models/Hackathon');
const Certification = require('../models/Certification');
const Skill = require('../models/Skill');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const grades = await Grade.find({ userId });
    const attendance = await Attendance.find({ userId });
    const projects = await Project.find({ userId });
    const hackathons = await Hackathon.find({ userId });
    const certifications = await Certification.find({ userId });
    const skills = await Skill.find({ userId });

    res.json({ grades, attendance, projects, hackathons, certifications, skills });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.addGrade = async (req, res) => {
  try {
    const newGrade = new Grade({ ...req.body, userId: req.user.id });
    const grade = await newGrade.save();
    res.json(grade);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

// ... similar for other models
exports.addAttendance = async (req, res) => {
    try {
        const attendance = new Attendance({ ...req.body, userId: req.user.id });
        await attendance.save();
        res.json(attendance);
    } catch (err) { 
        console.error(err);
        res.status(500).json({ msg: 'Server Error' }); 
    }
};

exports.updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const attendance = await Attendance.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            { $set: req.body },
            { new: true }
        );
        if (!attendance) return res.status(404).json({ msg: 'Attendance not found' });
        res.json(attendance);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.deleteAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const attendance = await Attendance.findOneAndDelete({ _id: id, userId: req.user.id });
        if (!attendance) return res.status(404).json({ msg: 'Attendance not found' });
        res.json({ msg: 'Attendance removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.addProject = async (req, res) => {
    try {
        const project = new Project({ ...req.body, userId: req.user.id });
        await project.save();
        res.json(project);
    } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
};

exports.addHackathon = async (req, res) => {
    try {
        const hackathon = new Hackathon({ ...req.body, userId: req.user.id });
        await hackathon.save();
        res.json(hackathon);
    } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
};

exports.updateHackathon = async (req, res) => {
    try {
        const { id } = req.params;
        const hackathon = await Hackathon.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            { $set: req.body },
            { new: true }
        );
        if (!hackathon) return res.status(404).json({ msg: 'Hackathon not found' });
        res.json(hackathon);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.deleteHackathon = async (req, res) => {
    try {
        const { id } = req.params;
        const hackathon = await Hackathon.findOneAndDelete({ _id: id, userId: req.user.id });
        if (!hackathon) return res.status(404).json({ msg: 'Hackathon not found' });
        res.json({ msg: 'Hackathon removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.addCertification = async (req, res) => {
    try {
        const certification = new Certification({ ...req.body, userId: req.user.id });
        await certification.save();
        res.json(certification);
    } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
};

exports.addSkill = async (req, res) => {
    try {
        const skill = new Skill({ ...req.body, userId: req.user.id });
        await skill.save();
        res.json(skill);
    } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
};
