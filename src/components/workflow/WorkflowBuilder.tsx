import { WorkflowProvider } from '@/hooks/use-workflow';
import { WorkflowSidebar } from '@/components/workflow/WorkflowSidebar';
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';

export function WorkflowBuilder() {
  return (
    <WorkflowProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        <WorkflowSidebar />
        <WorkflowCanvas />
      </div>
    </WorkflowProvider>
  );
}
