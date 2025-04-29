import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

export function ImageDialog({ isOpen, onClose, imageUrl }: ImageDialogProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 rounded-full bg-black/20 hover:bg-black/40 text-white"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        <div className="relative w-full h-full flex items-center justify-center">
          <img src={imageUrl} alt="Full size image" className="max-h-[80vh] max-w-full object-contain" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
