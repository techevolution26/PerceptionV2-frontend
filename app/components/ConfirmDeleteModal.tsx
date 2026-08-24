//app/components/ConfirmDeleteModal.tsx
"use client";

import type { MouseEvent } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Button from "./ui/Button";

interface ConfirmDeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({ onConfirm, onCancel }: ConfirmDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-card border border-border-hairline bg-surface p-6 text-center shadow-2xl"
        onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-danger/10 text-danger">
          <ExclamationTriangleIcon className="h-5 w-5" />
        </div>
        <h2 className="mb-1.5 text-lg font-semibold text-foreground">Delete perception?</h2>
        <p className="mb-6 text-sm text-foreground-subtle">
          This action is permanent and cannot be undone.
        </p>

        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1 !border-danger !bg-danger !text-white hover:!bg-danger/90">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
