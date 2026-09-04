import { useState, useRef } from 'react';
import { Modal } from '../common';
import { scanHomeworkWithGemini, getApiKey, setApiKey } from '../../services/gemini';
import { SUBJECTS, subjInfo } from '../../constants/data';
import { uid, todayISO } from '../../utils/helpers';

function processFile(selectedFile) {
  return new Promise((resolve, reject) => {
    if (selectedFile.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        resolve({
          dataUrl,
          base64: dataUrl.split(',')[1],
          mimeType: 'application/pdf',
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(selectedFile);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1920;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve({
          dataUrl,
          base64: dataUrl.split(',')[1],
          mimeType: 'image/jpeg',
        });
      };
      img.onerror = () => {
        const dataUrl = e.target.result;
        resolve({
          dataUrl,
          base64: dataUrl.split(',')[1],
          mimeType: selectedFile.type || 'image/jpeg',
        });
      };
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(selectedFile);
  });
}

export function ScannerModal({ data, update, onClose, onFinish }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [base64Data, setBase64Data] = useState(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [promptHint, setPromptHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState({});
  const [keyInput, setKeyInput] = useState('');
  const [showKeyPrompt, setShowKeyPrompt] = useState(!getApiKey());

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;
    setError(null);
    setFile(selectedFile);

    try {
      const { dataUrl, base64, mimeType: resolvedMime } = await processFile(selectedFile);
      setPreviewUrl(dataUrl);
      setBase64Data(base64);
      setMimeType(resolvedMime);
    } catch (e) {
      setError('Could not process this image. Please try another file.');
    }
  };

  const handleScan = async () => {
    if (!base64Data) {
      setError('Please select or capture an image or PDF first.');
      return;
    }

    const currentKey = getApiKey();
    if (!currentKey) {
      setShowKeyPrompt(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await scanHomeworkWithGemini({
        base64Data,
        mimeType,
        promptHint,
        data,
      });

      if (!result.tasks || result.tasks.length === 0) {
        setError('Gemini scanned the image, but could not detect any homework or assignments on the paper. Try taking a clearer picture with good lighting.');
      } else {
        setExtractedData(result);
        // Select all tasks by default
        const initialSelected = {};
        result.tasks.forEach((_, idx) => {
          initialSelected[idx] = true;
        });
        setSelectedTasks(initialSelected);
      }
    } catch (err) {
      console.error('Scan error:', err);
      if (err.message?.includes('API key')) {
        setShowKeyPrompt(true);
      }
      setError(err.message || 'Failed to scan image. Check your internet or API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTasks = () => {
    if (!extractedData || !extractedData.tasks) return;

    const tasksToAdd = extractedData.tasks.filter((_, idx) => selectedTasks[idx]);
    if (tasksToAdd.length === 0) {
      setError('Please select at least one task to add.');
      return;
    }

    update((d) => {
      tasksToAdd.forEach((t) => {
        d.homework.unshift({
          id: uid(),
          name: t.name || 'New Homework Assignment',
          subject: t.subject || 'other',
          teacher: t.teacher || subjInfo(t.subject)?.teacher || '',
          dueDate: t.dueDate || todayISO(),
          assignedDate: todayISO(),
          priority: t.priority || 'medium',
          estMinutes: Number(t.estMinutes) || 30,
          status: 'not_started',
          notes: t.notes ? `[Scanned via AI]: ${t.notes}` : 'Extracted from homework photo',
        });
      });
    });

    if (onFinish) onFinish(tasksToAdd.length);
    onClose();
  };

  const handleSaveKey = () => {
    if (keyInput.trim()) {
      setApiKey(keyInput.trim());
      setShowKeyPrompt(false);
      setError(null);
    }
  };

  const updateTaskField = (idx, field, value) => {
    setExtractedData((prev) => {
      if (!prev) return prev;
      const newTasks = [...prev.tasks];
      newTasks[idx] = { ...newTasks[idx], [field]: value };
      return { ...prev, tasks: newTasks };
    });
  };

  return (
    <Modal title="📷 AI Homework & Document Scanner" onClose={onClose} width={580}>
      {/* Hidden inputs for camera capture and file picker */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileSelect(e.target.files?.[0])}
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={(e) => handleFileSelect(e.target.files?.[0])}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
      />

      {/* API Key prompt if missing */}
      {showKeyPrompt && (
        <div
          style={{
            padding: 16,
            background: 'var(--blue-dim)',
            border: '1px solid var(--blue)',
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue-light)', marginBottom: 4 }}>
            🔑 Enter Gemini API Key to Enable AI Vision
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10 }}>
            SENIOR OS uses Google Gemini 1.5 Flash to read handwriting & Arabic text.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              style={{ flex: 1, fontSize: 12, padding: '7px 10px' }}
            />
            <button onClick={handleSaveKey} className="btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>
              Save Key
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Upload or Capture Screen */}
      {!extractedData && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 14, lineHeight: 1.5 }}>
            Snap a photo of your homework sheet, notebook, or whiteboard (handwritten or printed in <b>Arabic</b> or <b>English</b>). SENIOR will read it and automatically sort tasks into Mathematics, Physics, Chemistry, Biology, and more!
          </div>

          {!file ? (
            <div
              style={{
                border: '2px dashed var(--border-bright)',
                borderRadius: 16,
                padding: '36px 20px',
                textAlign: 'center',
                background: 'var(--bg-elev)',
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 42, marginBottom: 12 }}>📸</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                Upload or Snap Homework
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 20 }}>
                Supports camera snapshots, photos, and PDF files
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: 13 }}
                >
                  <span>📷</span> Take Photo with Camera
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-ghost"
                  style={{ padding: '10px 18px', fontSize: 13 }}
                >
                  <span>📁</span> Choose Image or PDF
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              {/* File Preview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: 12,
                  background: 'var(--bg-elev)',
                  borderRadius: 12,
                  border: '1px solid var(--border-soft)',
                  marginBottom: 14,
                }}
              >
                {mimeType.startsWith('image/') && previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Homework preview"
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                  />
                ) : (
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 8,
                      background: 'var(--card-hi)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                    }}
                  >
                    📄
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2 }}>
                    {(file.size / 1024).toFixed(0)} KB · {mimeType.startsWith('image/') ? 'Image' : 'PDF Document'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-ghost"
                  style={{ fontSize: 11.5, padding: '4px 10px' }}
                >
                  Replace
                </button>
              </div>

              {/* Optional Note/Prompt Hint */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6 }}>
                  Optional Note / Context (Arabic or English):
                </label>
                <input
                  type="text"
                  placeholder="e.g. واجب كيمياء وفيزياء للأستاذ شادي وأنس..."
                  value={promptHint}
                  onChange={(e) => setPromptHint(e.target.value)}
                  style={{ width: '100%', fontSize: 13, padding: '9px 12px' }}
                />
              </div>

              {/* Scan Trigger Button */}
              <button
                type="button"
                onClick={handleScan}
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: 14,
                  fontWeight: 700,
                  opacity: loading ? 0.7 : 1,
                  background: 'linear-gradient(135deg, var(--blue), var(--violet))',
                }}
              >
                {loading ? (
                  <span>🔄 Scanning handwriting & Arabic text...</span>
                ) : (
                  <span>✨ Scan & Sort Homework with AI</span>
                )}
              </button>
            </div>
          )}

          {error && (
            <div
              style={{
                padding: '12px 14px',
                background: 'var(--red-dim)',
                border: '1px solid var(--red)',
                borderRadius: 10,
                color: 'var(--red-light)',
                fontSize: 12.5,
                marginTop: 12,
              }}
            >
              ⚠️ {error}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Extracted Tasks Review & Save */}
      {extractedData && (
        <div>
          {/* Summary Badge */}
          <div
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(16,185,129,0.12))',
              border: '1px solid var(--blue-glow)',
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✓</span> {extractedData.summary || `Extracted ${extractedData.tasks?.length} assignments from your document`}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 4 }}>
              Review the detected subjects and due dates below. Uncheck any task you don't want to save.
            </div>
          </div>

          {/* Tasks List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '52vh', overflowY: 'auto', paddingRight: 4 }}>
            {extractedData.tasks.map((task, idx) => {
              const subj = subjInfo(task.subject);
              const isChecked = !!selectedTasks[idx];

              return (
                <div
                  key={idx}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: isChecked ? 'var(--bg-elev)' : 'rgba(255,255,255,0.02)',
                    border: isChecked ? `1px solid ${subj.color || 'var(--blue)'}` : '1px solid var(--border-soft)',
                    borderLeft: `5px solid ${subj.color || 'var(--blue)'}`,
                    opacity: isChecked ? 1 : 0.6,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => setSelectedTasks({ ...selectedTasks, [idx]: e.target.checked })}
                      style={{ width: 17, height: 17, cursor: 'pointer', accentColor: 'var(--green)' }}
                    />

                    {/* Subject Selector */}
                    <select
                      value={task.subject}
                      onChange={(e) => updateTaskField(idx, 'subject', e.target.value)}
                      style={{ fontSize: 12, padding: '3px 8px', fontWeight: 600, color: subj.color }}
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.emoji} {s.label} ({s.teacher})
                        </option>
                      ))}
                    </select>

                    <span className="chip" style={{ background: 'var(--bg)', fontSize: 10.5, marginLeft: 'auto' }}>
                      ⏱️ {task.estMinutes || 30}m
                    </span>
                  </div>

                  {/* Task Name Input */}
                  <input
                    type="text"
                    value={task.name}
                    onChange={(e) => updateTaskField(idx, 'name', e.target.value)}
                    placeholder="Assignment description..."
                    style={{ width: '100%', fontSize: 13.5, fontWeight: 600, marginBottom: 8, padding: '6px 10px' }}
                  />

                  {/* Due Date & Teacher Details */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text-faint)' }}>
                      <span>📅 Due:</span>
                      <input
                        type="date"
                        value={task.dueDate}
                        onChange={(e) => updateTaskField(idx, 'dueDate', e.target.value)}
                        style={{ fontSize: 11.5, padding: '3px 6px' }}
                      />
                    </div>

                    {task.notes && (
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', flex: 1, minWidth: 160, fontStyle: 'italic' }}>
                        "{task.notes}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border-soft)' }}>
            <button
              type="button"
              onClick={() => {
                setExtractedData(null);
                setFile(null);
                setBase64Data(null);
                setPreviewUrl(null);
              }}
              className="btn-ghost"
              style={{ fontSize: 12.5 }}
            >
              ← Scan Another
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={onClose} className="btn-ghost" style={{ fontSize: 12.5 }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTasks}
                className="btn-primary"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--green), #059669)',
                  padding: '8px 18px',
                }}
              >
                ✓ Add to Homework ({Object.values(selectedTasks).filter(Boolean).length})
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
