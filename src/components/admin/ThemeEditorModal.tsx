import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Check, Loader2, Eye } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors, defaultThemeColors } from '../../types';

interface ThemeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ColorFieldConfig {
  key: keyof ThemeColors;
  label: string;
  description: string;
}

const colorFields: ColorFieldConfig[] = [
  { key: 'primary', label: 'Primary (Navy)', description: 'Main brand color for headers and buttons' },
  { key: 'secondary', label: 'Secondary (Teal)', description: 'Accent color for highlights' },
  { key: 'accent', label: 'Accent (Red)', description: 'Call-to-action and important elements' },
  { key: 'gold', label: 'Gold', description: 'Premium elements and highlights' },
  { key: 'background', label: 'Background', description: 'Page background color' },
  { key: 'text', label: 'Text Dark', description: 'Main text color' },
  { key: 'textLight', label: 'Text Light', description: 'Light text on dark backgrounds' },
];

export default function ThemeEditorModal({ isOpen, onClose }: ThemeEditorModalProps) {
  const { colors, updateColors, resetColors, isLoadingColors } = useTheme();
  const [localColors, setLocalColors] = useState<ThemeColors>(colors);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local colors with context colors
  useEffect(() => {
    if (!isSaving) {
      setLocalColors(colors);
    }
  }, [colors, isSaving]);

  // Check for changes
  useEffect(() => {
    const changed = Object.keys(localColors).some(
      (key) => localColors[key as keyof ThemeColors] !== colors[key as keyof ThemeColors]
    );
    setHasChanges(changed);
  }, [localColors, colors]);

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setLocalColors((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateColors(localColors);
      onClose();
    } catch (error) {
      console.error('Error saving colors:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetColors();
      setLocalColors(defaultThemeColors);
    } catch (error) {
      console.error('Error resetting colors:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleCancel = () => {
    setLocalColors(colors);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && handleCancel()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Theme Editor
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Customize your brand colors
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoadingColors ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Color Fields */}
                <div className="grid gap-4">
                  {colorFields.map((field) => (
                    <div
                      key={field.key}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                    >
                      {/* Color Picker */}
                      <div className="relative">
                        <input
                          type="color"
                          value={localColors[field.key]}
                          onChange={(e) => handleColorChange(field.key, e.target.value)}
                          className="w-14 h-14 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-600"
                        />
                        <div
                          className="absolute inset-0 rounded-lg pointer-events-none"
                          style={{
                            boxShadow: `0 0 0 2px ${localColors[field.key]}20`,
                          }}
                        />
                      </div>

                      {/* Label and Description */}
                      <div className="flex-1">
                        <label className="block font-medium text-gray-900 dark:text-white">
                          {field.label}
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {field.description}
                        </p>
                      </div>

                      {/* Hex Input */}
                      <div className="relative">
                        <input
                          type="text"
                          value={localColors[field.key]}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                              handleColorChange(field.key, value);
                            }
                          }}
                          className="w-28 px-3 py-2 text-sm font-mono bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                          placeholder="#000000"
                        />
                      </div>

                      {/* Change Indicator */}
                      {localColors[field.key] !== colors[field.key] && (
                        <div className="w-3 h-3 bg-gold rounded-full" title="Changed" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Preview Toggle */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <Eye size={18} />
                    <span className="text-sm">
                      {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </span>
                  </button>
                </div>

                {/* Color Preview */}
                <AnimatePresence>
                  {showPreview && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                          Live Preview
                        </h4>

                        {/* Preview Card */}
                        <div
                          className="rounded-xl p-6"
                          style={{ backgroundColor: localColors.background }}
                        >
                          <div
                            className="rounded-lg p-4 mb-4"
                            style={{ backgroundColor: localColors.primary }}
                          >
                            <h3
                              className="text-xl font-bold mb-1"
                              style={{ color: localColors.textLight }}
                            >
                              KWT-MT Header
                            </h3>
                            <p
                              className="text-sm opacity-90"
                              style={{ color: localColors.textLight }}
                            >
                              Kuwaiti Student Association Malta
                            </p>
                          </div>

                          <p
                            className="mb-4"
                            style={{ color: localColors.text }}
                          >
                            Sample text content with your theme colors applied.
                          </p>

                          <div className="flex gap-3">
                            <button
                              className="px-4 py-2 rounded-lg font-medium transition-transform hover:scale-105"
                              style={{
                                backgroundColor: localColors.secondary,
                                color: localColors.textLight,
                              }}
                            >
                              Secondary
                            </button>
                            <button
                              className="px-4 py-2 rounded-lg font-medium transition-transform hover:scale-105"
                              style={{
                                backgroundColor: localColors.accent,
                                color: localColors.textLight,
                              }}
                            >
                              Accent
                            </button>
                            <button
                              className="px-4 py-2 rounded-lg font-medium transition-transform hover:scale-105"
                              style={{
                                backgroundColor: localColors.gold,
                                color: localColors.text,
                              }}
                            >
                              Gold
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isResetting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <RotateCcw size={18} />
              )}
              Reset to Defaults
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-gold text-white rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Check size={18} />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
