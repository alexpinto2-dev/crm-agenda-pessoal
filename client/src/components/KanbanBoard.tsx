import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Client {
  id: number;
  userId: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: "em_qualificacao" | "em_negociacao" | "proposta_enviada" | "cliente_fechado" | "cliente_desistiu";
  pipelineStage: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface KanbanBoardProps {
  statusGroups: Record<string, Client[]>;
  statusLabels: Record<string, string>;
  statusColors: Record<string, string>;
  onStatusChange: (clientId: number, newStatus: string) => Promise<void>;
  onEdit: (client: Client) => void;
  onDelete: (clientId: number) => void;
  onClientClick: (client: Client) => void;
}

// Componente para cada card de cliente
function KanbanCard({
  client,
  onEdit,
  onDelete,
  onClientClick,
}: {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (clientId: number) => void;
  onClientClick: (client: Client) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `client-${client.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-card hover:shadow-elegant transition-all cursor-grab active:cursor-grabbing"
    >
      <div
        className="flex items-start gap-2 mb-2"
        onClick={() => onClientClick(client)}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{client.name}</p>
          {client.company && (
            <p className="text-xs text-muted-foreground truncate">
              {client.company}
            </p>
          )}
          {client.email && (
            <p className="text-xs text-muted-foreground truncate">
              {client.email}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-1 mt-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(client);
          }}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(client.id);
          }}
        >
          <Trash2 className="h-3 w-3 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

// Componente para cada coluna do Kanban
function KanbanColumn({
  status,
  label,
  color,
  clients,
  onEdit,
  onDelete,
  onClientClick,
}: {
  status: string;
  label: string;
  color: string;
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (clientId: number) => void;
  onClientClick: (client: Client) => void;
}) {
  const { setNodeRef } = useSortable({
    id: `column-${status}`,
    data: { type: "column", status },
  });

  const clientIds = clients.map((c) => `client-${c.id}`);

  return (
    <div
      ref={setNodeRef}
      className="bg-muted/50 rounded-lg p-4 space-y-3 min-h-[500px]"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>
            {label}
          </span>
          <span className="text-sm text-muted-foreground">({clients.length})</span>
        </h3>
      </div>
      <SortableContext
        items={clientIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {clients.map((client) => (
            <KanbanCard
              key={client.id}
              client={client}
              onEdit={onEdit}
              onDelete={onDelete}
              onClientClick={onClientClick}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

// Componente principal do Kanban Board
export function KanbanBoard({
  statusGroups,
  statusLabels,
  statusColors,
  onStatusChange,
  onEdit,
  onDelete,
  onClientClick,
}: KanbanBoardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Se estamos arrastando um cliente sobre uma coluna
    if (activeId.startsWith("client-") && overId.startsWith("column-")) {
      const clientId = parseInt(activeId.replace("client-", ""));
      const newStatus = overId.replace("column-", "");

      // Encontrar o cliente e seu status atual
      let currentStatus = "";
      for (const [status, clients] of Object.entries(statusGroups)) {
        if (clients.some((c) => c.id === clientId)) {
          currentStatus = status;
          break;
        }
      }

      // Se o status mudou, atualizar
      if (currentStatus !== newStatus && currentStatus) {
        handleStatusChange(clientId, newStatus);
      }
    }
  };

  const handleStatusChange = async (clientId: number, newStatus: string) => {
    try {
      setIsLoading(true);
      await onStatusChange(clientId, newStatus);
      toast.success("Cliente movido com sucesso!");
    } catch (error) {
      toast.error("Erro ao mover cliente");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = () => {
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(statusGroups).map(([status, clients]) => (
          <KanbanColumn
            key={status}
            status={status}
            label={statusLabels[status] || status}
            color={statusColors[status] || "bg-gray-100 text-gray-800"}
            clients={clients}
            onEdit={onEdit}
            onDelete={onDelete}
            onClientClick={onClientClick}
          />
        ))}
      </div>
    </DndContext>
  );
}
