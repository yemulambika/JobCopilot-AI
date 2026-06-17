const ResumeVersion = require("../models/ResumeVersion");

/**
 * @desc    Get all versions for the user (optionally filtered by masterResumeId)
 * @route   GET /api/resume-versions
 * @access  Private
 */
const getVersions = async (req, res) => {
  try {
    const { masterResumeId } = req.query;
    const filter = { userId: req.user.id };
    if (masterResumeId) filter.masterResumeId = masterResumeId;

    const versions = await ResumeVersion.find(filter)
      .sort({ createdAt: -1 })
      .select("-content"); // Exclude full content for list view

    res.json({ count: versions.length, versions });
  } catch (error) {
    console.error("getVersions error:", error);
    res.status(500).json({ error: "Failed to fetch versions" });
  }
};

/**
 * @desc    Get a single version with full content
 * @route   GET /api/resume-versions/:id
 * @access  Private
 */
const getVersion = async (req, res) => {
  try {
    const version = await ResumeVersion.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!version) {
      return res.status(404).json({ error: "Version not found" });
    }

    res.json({ version });
  } catch (error) {
    console.error("getVersion error:", error);
    res.status(500).json({ error: "Failed to fetch version" });
  }
};

/**
 * @desc    Create a new version (save original or save tailored result)
 * @route   POST /api/resume-versions
 * @access  Private
 */
const createVersion = async (req, res) => {
  try {
    const {
      masterResumeId,
      label,
      type,
      content,
      jobDescription,
      metadata,
    } = req.body;

    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }

    // Auto-calculate version number
    const existingCount = await ResumeVersion.countDocuments({
      userId: req.user.id,
      masterResumeId: masterResumeId || null,
    });

    const version = await ResumeVersion.create({
      userId: req.user.id,
      masterResumeId: masterResumeId || null,
      label: label || (type === "tailored" ? `Tailored v${existingCount + 1}` : "Original"),
      type: type || "tailored",
      content,
      jobDescription: jobDescription || "",
      isActive: true,
      versionNumber: existingCount + 1,
      metadata: metadata || {},
    });

    console.log(`📝 Resume version created: ${version.label} (v${version.versionNumber}) for user`);

    res.status(201).json({
      message: "Version created",
      version: {
        id: version._id,
        label: version.label,
        type: version.type,
        versionNumber: version.versionNumber,
        metadata: version.metadata,
        createdAt: version.createdAt,
      },
    });
  } catch (error) {
    console.error("createVersion error:", error);
    res.status(500).json({ error: "Failed to create version" });
  }
};

/**
 * @desc    Restore a version (set isActive, unset others for same master)
 * @route   PATCH /api/resume-versions/:id/restore
 * @access  Private
 */
const restoreVersion = async (req, res) => {
  try {
    const version = await ResumeVersion.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!version) {
      return res.status(404).json({ error: "Version not found" });
    }

    // Mark this version as active, deactivate others for same master resume
    await ResumeVersion.updateMany(
      {
        userId: req.user.id,
        masterResumeId: version.masterResumeId,
        _id: { $ne: version._id },
      },
      { isActive: false }
    );

    version.isActive = true;
    await version.save();

    console.log(`♻️  Version restored: ${version.label} (v${version.versionNumber})`);

    res.json({
      message: "Version restored as active",
      version: {
        id: version._id,
        label: version.label,
        type: version.type,
        isActive: version.isActive,
        content: version.content,
      },
    });
  } catch (error) {
    console.error("restoreVersion error:", error);
    res.status(500).json({ error: "Failed to restore version" });
  }
};

/**
 * @desc    Compare two versions side by side
 * @route   GET /api/resume-versions/compare
 * @access  Private
 */
const compareVersions = async (req, res) => {
  try {
    const { versionA, versionB } = req.query;

    if (!versionA || !versionB) {
      return res.status(400).json({ error: "Both versionA and versionB query params are required" });
    }

    const [a, b] = await Promise.all([
      ResumeVersion.findOne({ _id: versionA, userId: req.user.id }),
      ResumeVersion.findOne({ _id: versionB, userId: req.user.id }),
    ]);

    if (!a || !b) {
      return res.status(404).json({ error: "One or both versions not found" });
    }

    // Generate a simple word-level diff
    const diff = generateDiff(a.content, b.content);

    res.json({
      versionA: { id: a._id, label: a.label, content: a.content, type: a.type, metadata: a.metadata },
      versionB: { id: b._id, label: b.label, content: b.content, type: b.type, metadata: b.metadata },
      diff,
    });
  } catch (error) {
    console.error("compareVersions error:", error);
    res.status(500).json({ error: "Failed to compare versions" });
  }
};

/**
 * @desc    Download a version as plain text
 * @route   GET /api/resume-versions/:id/download
 * @access  Private
 */
const downloadVersion = async (req, res) => {
  try {
    const version = await ResumeVersion.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!version) {
      return res.status(404).json({ error: "Version not found" });
    }

    const filename = `${version.label.replace(/[^a-zA-Z0-9]/g, "_")}_v${version.versionNumber}.txt`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "text/plain");
    res.send(version.content);
  } catch (error) {
    console.error("downloadVersion error:", error);
    res.status(500).json({ error: "Failed to download version" });
  }
};

/**
 * @desc    Delete a version
 * @route   DELETE /api/resume-versions/:id
 * @access  Private
 */
const deleteVersion = async (req, res) => {
  try {
    const version = await ResumeVersion.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!version) {
      return res.status(404).json({ error: "Version not found" });
    }

    res.json({ message: "Version deleted" });
  } catch (error) {
    console.error("deleteVersion error:", error);
    res.status(500).json({ error: "Failed to delete version" });
  }
};

/**
 * Simple line-level diff generator.
 * Returns an array of { type: 'added'|'removed'|'unchanged', text: string }
 */
function generateDiff(textA, textB) {
  const linesA = textA.split("\n");
  const linesB = textB.split("\n");
  const result = [];

  const maxLen = Math.max(linesA.length, linesB.length);

  for (let i = 0; i < maxLen; i++) {
    const lineA = linesA[i];
    const lineB = linesB[i];

    if (lineA === undefined) {
      result.push({ type: "added", text: lineB, line: i + 1 });
    } else if (lineB === undefined) {
      result.push({ type: "removed", text: lineA, line: i + 1 });
    } else if (lineA === lineB) {
      result.push({ type: "unchanged", text: lineA, line: i + 1 });
    } else {
      result.push({ type: "removed", text: lineA, line: i + 1 });
      result.push({ type: "added", text: lineB, line: i + 1 });
    }
  }

  return result;
}

module.exports = {
  getVersions,
  getVersion,
  createVersion,
  restoreVersion,
  compareVersions,
  downloadVersion,
  deleteVersion,
};