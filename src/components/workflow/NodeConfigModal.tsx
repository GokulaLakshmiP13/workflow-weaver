import React, { useState } from 'react';
import { WorkflowNode } from '@/lib/workflow-manager';
import { NODE_TYPE_CONFIG } from '@/lib/workflow-constants';

interface Props {
  node: WorkflowNode;
  onClose: () => void;
  onSave: (config: Record<string, unknown>) => void;
}

export function NodeConfigModal({ node, onClose, onSave }: Props) {
  const [config, setConfig] = useState<Record<string, unknown>>({ ...node.config });
  const cfg = NODE_TYPE_CONFIG[node.type];

  const updateField = (key: string, value: unknown) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const renderFields = () => {
    switch (node.type) {
      case 'audience':
        return (
          <>
            <Field label="Segment Name" value={config.segmentName as string || ''} onChange={v => updateField('segmentName', v)} />
            <Field label="Segment ID" value={config.segmentId as string || ''} onChange={v => updateField('segmentId', v)} />
          </>
        );
      case 'filter':
        return (
          <>
            <Field label="Field" value={config.field as string || ''} onChange={v => updateField('field', v)} />
            <Field label="Operator" value={config.operator as string || ''} onChange={v => updateField('operator', v)} placeholder="equals, contains, gt, lt" />
            <Field label="Value" value={config.value as string || ''} onChange={v => updateField('value', v)} />
          </>
        );
      case 'split':
        return (
          <>
            <Field label="Split Type" value={config.splitType as string || 'ab'} onChange={v => updateField('splitType', v)} placeholder="ab, random, percentage" />
            <Field label="Ratio (%)" value={config.ratio as string || '50'} onChange={v => updateField('ratio', v)} />
          </>
        );
      case 'action':
        return (
          <>
            <Field label="Action Type" value={config.actionType as string || ''} onChange={v => updateField('actionType', v)} placeholder="email, sms, webhook" />
            <Field label="Template ID" value={config.templateId as string || ''} onChange={v => updateField('templateId', v)} />
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
          <Field label="End Reason" value={config.reason as string || ''} onChange={v => updateField('reason', v)} placeholder="completed, dropped, etc." />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-xl workflow-shadow-lg w-[400px] max-w-[90vw] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: cfg.color + '18', color: cfg.color }}>
            {cfg.icon}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Configure {node.type}</h3>
            <p className="text-[11px] text-muted-foreground">{cfg.description}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {renderFields()}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-border bg-muted/30">
          <button onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg text-muted-foreground hover:bg-accent transition-colors">
            Cancel
          </button>
          <button onClick={() => { onSave(config); onClose(); }}
            className="px-4 py-2 text-sm rounded-lg font-medium text-primary-foreground transition-colors"
            style={{ backgroundColor: cfg.color }}>
            Save
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
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/30 transition"
      />
    </div>
  );
}
