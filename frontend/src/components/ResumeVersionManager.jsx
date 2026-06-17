import { useState } from "react";
import {
  useResumeVersions,
  useResumeVersion,
  useCreateResumeVersion,
  useRestoreResumeVersion,
  useCompareResumeVersions,
  useDownloadResumeVersion,
  useDeleteResumeVersion,
} from "../hooks/useResumeVersions";

/**
 * ResumeVersionManager — displays version history, allows compare, restore, download.
 * @param {string} [masterResumeId] — filter versions by this resume
 * @param {string} [activeVersionId] — currently selected version to show
 * @param {function} [onVersionSelect] — callback when a version is restored/selected
 */
export default function ResumeVersionManager({
  masterResumeId,
  activeVersionId,
  onVersionSelect,
}) {
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const [showCompare, setShowCompare] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data: versionsData, isLoading } = useResumeVersions(masterResumeId);
  const createMutation = useCreateResumeVersion();
  const restoreMutation = useRestoreResumeVersion();
  const downloadMutation = useDownloadResumeVersion();
  const deleteMutation = useDeleteResumeVersion();

  const versions = versionsData?.versions || [];

  const handleRestore = async (versionId) => {
    const result = await restoreMutation.mutateAsync(versionId);
    if (onVersionSelect && result.data?.version) {
      onVersionSelect(result.data.version);
    }
  };

  const handleDownload = (versionId) => {
    downloadMutation.mutate(versionId);
  };

  const handleDelete = (versionId) => {
    deleteMutation.mutate(versionId);
    setConfirmDelete(null);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="animate-pulse text-gray-400">Loading versions...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-cyan-400">
          📋 Version History
          {versions.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({versions.length} version{versions.length !== 1 ? "s" : ""})
            </span>
          )}
        </h3>
        {versions.length >= 2 && (
          <button
            onClick={() => setShowCompare(!showCompare)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-900/50 text-purple-300 border border-purple-700 hover:bg-purple-800/50 transition-colors"
          >
            {showCompare ? "✕ Close Compare" : "⚖️ Compare"}
          </button>
        )}
      </div>

      {/* Compare Selection */}
      {showCompare && (
        <ComparePanel
          versions={versions}
          compareA={compareA}
          compareB={compareB}
          setCompareA={setCompareA}
          setCompareB={setCompareB}
        />
      )}

      {/* Version List */}
      {versions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-3xl mb-2">📄</p>
          <p className="text-sm">No versions saved yet.</p>
          <p className="text-xs text-gray-600 mt-1">
            Save your original or tailored resume to start tracking versions.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {versions.map((v) => (
            <VersionCard
              key={v._id}
              version={v}
              isActive={v._id === activeVersionId}
              isCompareSelected={v._id === compareA || v._id === compareB}
              showCompare={showCompare}
              onRestore={() => handleRestore(v._id)}
              onDownload={() => handleDownload(v._id)}
              onDelete={() => setConfirmDelete(v._id)}
              onCompareSelect={(pos) => {
                if (pos === "A") setCompareA(v._id);
                else setCompareB(v._id);
              }}
              confirmDelete={confirmDelete === v._id}
              onConfirmDelete={() => handleDelete(v._id)}
              onCancelDelete={() => setConfirmDelete(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Version card component.
 */
function VersionCard({
  version,
  isActive,
  isCompareSelected,
  showCompare,
  onRestore,
  onDownload,
  onDelete,
  onCompareSelect,
  confirmDelete,
  onConfirmDelete,
  onCancelDelete,
}) {
  const date = new Date(version.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const typeBadge =
    version.type === "original"
      ? "bg-blue-900/50 text-blue-300 border-blue-700"
      : "bg-emerald-900/50 text-emerald-300 border-emerald-700";

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        isActive
          ? "bg-cyan-950/30 border-cyan-600 shadow-lg shadow-cyan-900/20"
          : "bg-gray-700/30 border-gray-600 hover:border-gray-500"
      } ${isCompareSelected ? "ring-2 ring-purple-500" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${typeBadge}`}>
              {version.type}
            </span>
            <span className="text-sm font-medium text-gray-200 truncate">
              {version.label}
            </span>
            {isActive && (
              <span className="text-xs text-cyan-400 font-medium">● Active</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{date}</span>
            {version.metadata?.companyName && (
              <span className="text-gray-400">→ {version.metadata.companyName}</span>
            )}
            {version.versionNumber && (
              <span>v{version.versionNumber}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {showCompare && (
            <div className="flex gap-1 mr-2">
              <button
                onClick={() => onCompareSelect("A")}
                className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                  isCompareSelected
                    ? "bg-purple-800 text-purple-200 border-purple-600"
                    : "bg-gray-700 text-gray-400 border-gray-600 hover:bg-gray-600"
                }`}
                title="Select as version A"
              >
                A
              </button>
              <button
                onClick={() => onCompareSelect("B")}
                className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                  isCompareSelected
                    ? "bg-purple-800 text-purple-200 border-purple-600"
                    : "bg-gray-700 text-gray-400 border-gray-600 hover:bg-gray-600"
                }`}
                title="Select as version B"
              >
                B
              </button>
            </div>
          )}

          {!isActive && !showCompare && (
            <button
              onClick={onRestore}
              className="text-xs px-2 py-1 rounded bg-cyan-800/50 text-cyan-300 border border-cyan-700 hover:bg-cyan-700/50 transition-colors"
              title="Restore this version"
            >
              ♻️ Restore
            </button>
          )}

          <button
            onClick={onDownload}
            className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 transition-colors"
            title="Download as .txt"
          >
            📥
          </button>

          {confirmDelete ? (
            <div className="flex gap-1">
              <button
                onClick={onConfirmDelete}
                className="text-xs px-2 py-1 rounded bg-red-800 text-red-200 border border-red-600 hover:bg-red-700 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={onCancelDelete}
                className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={onDelete}
              className="text-xs px-2 py-1 rounded bg-gray-700 text-red-400 border border-gray-600 hover:bg-red-900/30 hover:border-red-700 transition-colors"
              title="Delete version"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compare panel — select two versions to compare side by side.
 */
function ComparePanel({ versions, compareA, compareB, setCompareA, setCompareB }) {
  const compareMutation = useCompareResumeVersions();
  const [diff, setDiff] = useState(null);

  const handleCompare = async () => {
    if (!compareA || !compareB) return;
    const result = await compareMutation.mutateAsync({
      versionA: compareA,
      versionB: compareB,
    });
    setDiff(result.data);
  };

  return (
    <div className="mb-4 p-4 bg-gray-750 rounded-lg border border-purple-800">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Version A</label>
          <select
            value={compareA}
            onChange={(e) => setCompareA(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 text-sm focus:border-purple-500 focus:outline-none"
          >
            <option value="">Select version A...</option>
            {versions.map((v) => (
              <option key={v._id} value={v._id}>
                {v.label} ({v.type})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Version B</label>
          <select
            value={compareB}
            onChange={(e) => setCompareB(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 text-sm focus:border-purple-500 focus:outline-none"
          >
            <option value="">Select version B...</option>
            {versions.map((v) => (
              <option key={v._id} value={v._id}>
                {v.label} ({v.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleCompare}
        disabled={!compareA || !compareB || compareA === compareB || compareMutation.isPending}
        className="px-4 py-2 bg-purple-700 text-white rounded-lg text-sm font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {compareMutation.isPending ? "Comparing..." : "⚖️ Compare Versions"}
      </button>

      {compareA === compareB && compareA && (
        <p className="text-xs text-amber-400 mt-2">Select two different versions to compare.</p>
      )}

      {/* Diff Display */}
      {diff && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-300">Diff Result</h4>
            <div className="flex gap-3 text-xs">
              <span className="text-emerald-400">+ {diff.versionA.label}</span>
              <span className="text-red-400">− {diff.versionB.label}</span>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 max-h-64 overflow-y-auto font-mono text-xs">
            {diff.diff.map((line, i) => (
              <div
                key={i}
                className={`py-0.5 px-2 ${
                  line.type === "added"
                    ? "bg-emerald-900/30 text-emerald-300"
                    : line.type === "removed"
                    ? "bg-red-900/30 text-red-300"
                    : "text-gray-500"
                }`}
              >
                <span className="inline-block w-8 text-gray-600 select-none">
                  {line.line}
                </span>
                <span className="mr-2">
                  {line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}
                </span>
                {line.text || "\u00A0"}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}