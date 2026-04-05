import React, { useState } from 'react';
import { WorkflowNode } from '@/lib/workflow-manager';
import { NODE_TYPE_CONFIG } from '@/lib/workflow-constants';
import { X } from 'lucide-react';

interface Props {
  node: WorkflowNode;
  onClose: () => void;
  onSave: (config: Record<string, unknown>) => void;
}

export function NodeConfigModal({ node, onClose, onSave }: Props) {
  const [config, setConfig] = useState<Record<string, unknown>>({ ...node.config });
  const cfg = NODE_TYPE_CONFIG[node.type];
  const Icon = cfg.icon;

  const updateField = (key: string, value: unknown) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const renderFields = () => {
    switch (node.type) {
      case 'audience':
        return (
          <>
            <Field label="Segment Name" value={config.segmentName as string || ''} onChange={v => updateField('segmentName', v)} placeholder="e.g. High-value users" />
            <Field label="Segment ID" value={config.segmentId as string || ''} onChange={v => updateField('segmentId', v)} placeholder="seg_01H8X..." />
          </>
        );
      case 'filter':
        return (
          <>
            <Field label="Field" value={config.field as string || ''} onChange={v => updateField('field', v)} placeholder="e.g. country" />
            <Field label="Operator" value={config.operator as string || ''} onChange={v => updateField('operator', v)} placeholder="equals, contains, gt, lt" />
            <Field label="Value" value={config.value as string || ''} onChange={v => updateField('value', v)} placeholder="e.g. US" />
          </>
        );
      case 'split':
        return (
          <>
            <Field label="Split Type" value={config.splitType as string || 'ab'} onChange={v => updateField('splitType', v)} placeholder="ab, random, percentage" />
            <Field label="Ratio (%)" value={config.ratio as string || '50'} onChange={v => updateField('ratio', v)} placeholder="50" />
          </>
        );
      case 'action':
        return (
          <>
            <Field label="Channel" value={config.actionType as string || ''} onChange={v => updateField('actionType', v)} placeholder="email, sms, webhook, push" />
            <Field label="Template ID" value={config.templateId as string || ''} onChange={v => updateField('templateId', v)} placeholder="tpl_9f3k..." />
          </>
        );
      case 'wait':
        return (
          <>
            <Field label="Duration" value={config.duration as string || ''} onChange={v => updateField('duration', v)} placeholder="e.g. 24" />
            <Field label="Unit" value={config.unit as string || 'hours'} onChange={v => updateField('unit', v)} placeholder="minutes, hours, days" />
          </>
        );
      case 'end':
        return (
          <Field label="Exit Reason" value={config.reason as string || ''} onChange={v => updateField('reason', v)} placeholder="completed, unsubscribed, dropped" />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]" />
      <div className="relative bg-card rounded-xl workflow-shadow-lg w-[380px] max-w-[90vw] overflow-hidden border border-border" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: cfg.color + '14', color: cfg.color }}
            >
              <Icon size={16} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{cfg.label} Settings</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{cfg.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3.5">
          {renderFields()}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-border bg-muted/20">
          <button onClick={onClose}
            className="px-3.5 py-1.5 text-[13px] rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            Cancel
          </button>
          <button onClick={() => { onSave(config); onClose(); }}
            className="px-3.5 py-1.5 text-[13px] rounded-md font-medium text-white transition-colors"
            style={{ backgroundColor: cfg.color }}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-[13px] rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition"
        style={{ fontFamily: "var(--font-sans)" }}
      />
    </div>
  );
}
