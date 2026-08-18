import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Modal from '../UI/Modal';
import { UploadCloud, FileText, X, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MAX_FILE_MB = 50;

export default function UploadModal({ isOpen, onClose, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setUploadError(null);
      if (rejectedFiles?.length > 0) {
        setUploadError(rejectedFiles[0].errors?.[0]?.message || 'Invalid file.');
        return;
      }
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        if (!title) {
          setTitle(file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '));
        }
      }
    },
    [title]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: MAX_FILE_MB * 1024 * 1024,
  });

  const handleClose = () => {
    setSelectedFile(null);
    setTitle('');
    setUploadError(null);
    setUploading(false);
    onClose();
  };

  const handleUpload = async () => {
    if (!selectedFile) { setUploadError('Please select a PDF file.'); return; }
    if (!title.trim()) { setUploadError('Please provide a title for this paper.'); return; }

    setUploading(true);
    setUploadError(null);

    try {
      const form = new FormData();
      form.append('file', selectedFile);
      await api.post(`/papers/upload?title=${encodeURIComponent(title.trim())}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Paper uploaded! 🚀 AI analysis running in background.', { duration: 4000 });
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Upload failed. Please try again.';
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-xl">
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-textPrimary">Upload Research Paper</h2>
          <p className="text-xs text-textSecondary mt-1">PDF only · Max {MAX_FILE_MB}MB · AI analysis runs automatically</p>
        </div>

        {/* Dropzone or file preview */}
        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-accent bg-accent/5 scale-[1.02]'
                : 'border-border hover:border-accent/50 hover:bg-bgCard'
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud size={42} className={`mx-auto mb-3 ${isDragActive ? 'text-accent' : 'text-textMuted'}`} />
            {isDragActive ? (
              <p className="text-sm font-semibold text-accent">Drop to upload...</p>
            ) : (
              <>
                <p className="text-sm font-semibold text-textPrimary mb-1">Drag & drop your PDF here</p>
                <p className="text-xs text-textMuted">or <span className="text-accent font-semibold">click to browse</span></p>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-bgCard border border-border rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <FileText size={20} className="text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-textPrimary truncate">{selectedFile.name}</p>
              <p className="text-xs text-textMuted">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
            </div>
            <button
              onClick={() => { setSelectedFile(null); setTitle(''); }}
              className="p-1 rounded text-textMuted hover:text-danger transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Title field */}
        <div>
          <label className="block text-xs font-medium text-textSecondary mb-1">Paper Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter paper title"
            className="form-input"
          />
        </div>

        {/* Error */}
        {uploadError && (
          <div className="flex items-center gap-2 text-xs text-danger p-3 bg-danger/10 border border-danger/20 rounded-lg">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium text-textSecondary hover:text-textPrimary border border-border hover:border-textMuted rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || !title.trim() || uploading}
            className="flex items-center gap-2 px-5 py-2 bg-accent hover:bg-accentHover text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud size={15} />
                <span>Upload & Analyze</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
