import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, X } from 'lucide-react-native';

export type DateRangePreset = 'ALL' | 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS';

interface DateRangeFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (preset: DateRangePreset, start: string | null, end: string | null) => void;
}

export const DateRangeFilterModal: React.FC<DateRangeFilterModalProps> = ({ visible, onClose, onApply }) => {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('ALL');

  const handleApply = () => {
    let start = null;
    let end = null;
    const now = new Date();
    
    if (selectedPreset === 'TODAY') {
      start = new Date(now.setHours(0,0,0,0)).toISOString().split('T')[0] + "T00:00:00";
      end = new Date(now.setHours(23,59,59,999)).toISOString().split('T')[0] + "T23:59:59";
    } else if (selectedPreset === 'LAST_7_DAYS') {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      start = new Date(past.setHours(0,0,0,0)).toISOString().split('T')[0] + "T00:00:00";
      end = new Date(new Date().setHours(23,59,59,999)).toISOString().split('T')[0] + "T23:59:59";
    } else if (selectedPreset === 'LAST_30_DAYS') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      start = new Date(past.setHours(0,0,0,0)).toISOString().split('T')[0] + "T00:00:00";
      end = new Date(new Date().setHours(23,59,59,999)).toISOString().split('T')[0] + "T23:59:59";
    }

    onApply(selectedPreset, start, end);
    onClose();
  };

  const PRESETS = [
    { id: 'ALL', label: 'All Reports' },
    { id: 'TODAY', label: 'Today' },
    { id: 'LAST_7_DAYS', label: 'Last 7 Days' },
    { id: 'LAST_30_DAYS', label: 'Last 30 Days' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter by Date</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[styles.presetRow, selectedPreset === preset.id && styles.presetRowActive]}
                onPress={() => setSelectedPreset(preset.id as DateRangePreset)}
              >
                <Calendar size={20} color={selectedPreset === preset.id ? '#2563EB' : '#6B7280'} />
                <Text style={[styles.presetText, selectedPreset === preset.id && styles.presetTextActive]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  body: {
    marginBottom: 20,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  presetRowActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  presetText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  presetTextActive: {
    color: '#2563EB',
  },
  footer: {
    marginTop: 'auto',
  },
  applyBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
