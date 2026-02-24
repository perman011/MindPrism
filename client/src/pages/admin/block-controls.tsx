import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Copy, Trash2, MessageSquare } from "lucide-react";

interface BlockControlsProps {
  onAdd: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onComment?: () => void;
  deleteWarning?: string;
  showComment?: boolean;
}

export function BlockControls({ onAdd, onCopy, onDelete, onComment, deleteWarning, showComment = true }: BlockControlsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="absolute -right-1 top-1/2 -translate-y-1/2 translate-x-full opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col gap-1 pl-2" data-testid="block-controls">
      <Button variant="ghost" size="icon" className="h-7 w-7 bg-white dark:bg-gray-800 shadow-sm border" onClick={onAdd} title="Add new" data-testid="button-block-add">
        <Plus className="w-3.5 h-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7 bg-white dark:bg-gray-800 shadow-sm border" onClick={onCopy} title="Duplicate" data-testid="button-block-copy">
        <Copy className="w-3.5 h-3.5" />
      </Button>
      {showComment && onComment && (
        <Button variant="ghost" size="icon" className="h-7 w-7 bg-white dark:bg-gray-800 shadow-sm border" onClick={onComment} title="Comment" data-testid="button-block-comment">
          <MessageSquare className="w-3.5 h-3.5" />
        </Button>
      )}
      {showDeleteConfirm ? (
        <div className="flex flex-col gap-1 bg-white dark:bg-gray-800 shadow-md border rounded-md p-2 min-w-[120px]">
          {deleteWarning && <p className="text-[10px] text-destructive">{deleteWarning}</p>}
          <div className="flex gap-1">
            <Button variant="destructive" size="sm" className="h-6 text-[10px] flex-1" onClick={() => { onDelete(); setShowDeleteConfirm(false); }} data-testid="button-confirm-delete">
              Delete
            </Button>
            <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setShowDeleteConfirm(false)} data-testid="button-cancel-delete">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="ghost" size="icon" className="h-7 w-7 bg-white dark:bg-gray-800 shadow-sm border text-destructive hover:text-destructive" onClick={() => setShowDeleteConfirm(true)} title="Delete" data-testid="button-block-delete">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}
