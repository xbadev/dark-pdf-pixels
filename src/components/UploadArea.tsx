
import React, { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface UploadAreaProps {
  onFilesAdded: (files: File[]) => void;
}

const UploadArea = ({ onFilesAdded }: UploadAreaProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
    // Reset the input to allow selecting the same file again
    e.target.value = '';
  };

  const handleFiles = (fileList: File[]) => {
    const validFiles = fileList.filter(file => {
      const isValidType = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'application/pdf';
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a JPG or PDF file.`,
          variant: "destructive",
        });
      }
      return isValidType;
    });

    onFilesAdded(validFiles);
  };

  return (
    <Card className="glass-card p-8">
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
          isDragActive ? 'drag-active' : 'border-gray-600 hover:border-neon-cyan/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="animate-float">
            <Upload className="w-16 h-16 text-neon-cyan mx-auto mb-4" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              Drop your files here
            </h3>
            <p className="text-gray-400 mb-6">
              Support for JPG to PDF and PDF to JPG conversion
            </p>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button 
                type="button"
                className="bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-purple hover:to-neon-cyan text-black font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Choose Files
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".jpg,.jpeg,.pdf"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UploadArea;
