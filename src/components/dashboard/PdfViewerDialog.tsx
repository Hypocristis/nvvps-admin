import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface PdfViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string;
}

export const PdfViewerDialog: React.FC<PdfViewerDialogProps> = ({
  open,
  onOpenChange,
  pdfUrl,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div className="bg-card w-4/5 h-4/5 rounded-lg shadow-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">Podgląd dokumentu</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={pdfUrl} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-1" />
                Pobierz
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <iframe src={pdfUrl} className="w-full h-full border-0" title="PDF Viewer" />
        </div>
      </div>
    </div>
  );
}; 