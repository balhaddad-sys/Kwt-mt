import { useState, useEffect } from 'react';
import { Palette, RotateCcw, Save, Eye, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors, defaultThemeColors } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ColorInputProps {
  label: string;
  colorKey: keyof ThemeColors;
  value: string;
  onChange: (key: keyof ThemeColors, value: string) => void;
  description?: string;
}

function ColorInput({ label, colorKey, value, onChange, description }: ColorInputProps) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setInputValue(newValue);
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(colorKey, newValue);
    }
  };

  const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(inputValue);

  return (
    <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
      <div className="flex-shrink-0">
        <label className="relative cursor-pointer">
          <input
            type="color"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-12 h-12"
          />
          <div
            className="w-12 h-12 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 shadow-inner transition-all hover:scale-105"
            style={{ backgroundColor: value }}
          />
        </label>
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-1">
          {label}
        </label>
        {description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">{description}</p>
        )}
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            className={`w-full px-3 py-2 text-sm font-mono border rounded-md focus:outline-none focus:ring-2 ${
              isValidHex
                ? 'border-neutral-300 dark:border-neutral-600 focus:ring-primary-500'
                : 'border-red-500 focus:ring-red-500'
            } bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white`}
            placeholder="#000000"
          />
          {!isValidHex && (
            <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
          )}
        </div>
      </div>
    </div>
  );
}

function ContrastChecker({ foreground, background }: { foreground: string; background: string }) {
  const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const toLinear = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };

    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };

  const getContrastRatio = (l1: number, l2: number) => {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const ratio = getContrastRatio(getLuminance(foreground), getLuminance(background));
  const passesAA = ratio >= 4.5;
  const passesAAA = ratio >= 7;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-neutral-600 dark:text-neutral-400">Contrast:</span>
      <span className="font-mono font-medium">{ratio.toFixed(2)}:1</span>
      {passesAAA ? (
        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs">
          AAA
        </span>
      ) : passesAA ? (
        <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded text-xs">
          AA
        </span>
      ) : (
        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-xs">
          Fail
        </span>
      )}
    </div>
  );
}

export default function ThemeEditor() {
  const { colors, updateColors, resetColors, isLoadingColors } = useTheme();
  const [localColors, setLocalColors] = useState<ThemeColors>(colors);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalColors(colors);
  }, [colors]);

  useEffect(() => {
    const hasUnsavedChanges = Object.keys(localColors).some(
      (key) => localColors[key as keyof ThemeColors] !== colors[key as keyof ThemeColors]
    );
    setHasChanges(hasUnsavedChanges);
  }, [localColors, colors]);

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setLocalColors((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
    setError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await updateColors(localColors);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save theme. Please try again.');
      console.error('Error saving theme:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all colors to default?')) {
      setIsSaving(true);
      setError(null);
      try {
        await resetColors();
        setLocalColors(defaultThemeColors);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
        setError('Failed to reset theme. Please try again.');
        console.error('Error resetting theme:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const colorFields: { key: keyof ThemeColors; label: string; description: string }[] = [
    { key: 'primary', label: 'Primary Navy', description: 'Main brand color for headers and primary actions' },
    { key: 'secondary', label: 'Teal Accent', description: 'Secondary color for links and highlights' },
    { key: 'accent', label: 'Red Accent', description: 'Used for urgent items and medical events' },
    { key: 'gold', label: 'Gold Accent', description: 'Premium elements and achievements' },
    { key: 'background', label: 'Background', description: 'Main page background color' },
    { key: 'text', label: 'Text Dark', description: 'Primary text on light backgrounds' },
    { key: 'textLight', label: 'Text Light', description: 'Text on dark backgrounds' },
  ];

  if (isLoadingColors) {
    return (
      <Card padding="lg">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
            <Palette className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-neutral-900 dark:text-white">
              Theme Colors
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Customize site colors
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-xs text-amber-600 dark:text-amber-400 hidden sm:inline">Unsaved</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            leftIcon={<RotateCcw className="w-4 h-4" />}
            disabled={isSaving}
          >
            <span className="hidden sm:inline">Reset</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            leftIcon={saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? '...' : saveSuccess ? 'Saved!' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Color Inputs */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4 uppercase tracking-wider">
            Brand Colors
          </h3>
          <div className="space-y-3">
            {colorFields.map((field) => (
              <ColorInput
                key={field.key}
                label={field.label}
                colorKey={field.key}
                value={localColors[field.key]}
                onChange={handleColorChange}
                description={field.description}
              />
            ))}
          </div>

          {/* Contrast Checkers */}
          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">
              Accessibility Check
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Dark text on background:
                </span>
                <ContrastChecker foreground={localColors.text} background={localColors.background} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Light text on primary:
                </span>
                <ContrastChecker foreground={localColors.textLight} background={localColors.primary} />
              </div>
            </div>
          </div>
        </Card>

        {/* Live Preview */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-neutral-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
              Live Preview
            </h3>
          </div>

          {/* Preview Container */}
          <div
            className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700"
            style={{ backgroundColor: localColors.background }}
          >
            {/* Preview Header */}
            <div
              className="p-4"
              style={{ backgroundColor: localColors.primary }}
            >
              <h4
                className="text-lg font-bold"
                style={{ color: localColors.textLight }}
              >
                KWT-MT
              </h4>
              <p
                className="text-sm opacity-90"
                style={{ color: localColors.textLight }}
              >
                Kuwaiti Student Association in Malta
              </p>
            </div>

            {/* Preview Content */}
            <div className="p-4 space-y-4">
              <h5
                className="text-lg font-semibold"
                style={{ color: localColors.text }}
              >
                Welcome to Our Community
              </h5>
              <p
                className="text-sm"
                style={{ color: localColors.text, opacity: 0.7 }}
              >
                Join us for exciting events and connect with fellow students.
              </p>

              {/* Preview Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: localColors.primary,
                    color: localColors.textLight,
                  }}
                >
                  Primary Button
                </button>
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: localColors.secondary,
                    color: localColors.textLight,
                  }}
                >
                  Secondary
                </button>
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: localColors.gold,
                    color: localColors.text,
                  }}
                >
                  Gold
                </button>
              </div>

              {/* Preview Event Cards */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: localColors.secondary + '20' }}
                >
                  <div
                    className="w-8 h-8 rounded-full mb-2"
                    style={{ backgroundColor: localColors.secondary }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: localColors.text }}
                  >
                    Sports Event
                  </span>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: localColors.accent + '20' }}
                >
                  <div
                    className="w-8 h-8 rounded-full mb-2"
                    style={{ backgroundColor: localColors.accent }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: localColors.text }}
                  >
                    Medical Event
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Color Palette Quick View */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 uppercase tracking-wider">
          Color Palette Overview
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(localColors).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center gap-2 px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
            >
              <div
                className="w-6 h-6 rounded border border-neutral-300 dark:border-neutral-600"
                style={{ backgroundColor: value }}
              />
              <div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                  {key}
                </span>
                <span className="block text-xs font-mono text-neutral-700 dark:text-neutral-300">
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
