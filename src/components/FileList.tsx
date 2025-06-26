
import React from 'react';
import { Download, Zap, FileImage, File as FileIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ConversionFile } from '@/types/fileConverter';

interface FileListProps {
  files: ConversionFile[];
  onConvert: (fileId: string) => void;
  onDownload: (fileId: string) => void;
  onRemove: (fileId: string) => void;
}

const FileList = ({ files, onConvert, onDownload, onRemove }: FileListProps) => {
  const getConversionDirection = (file: File) => {
    return file.type === 'application/pdf' ? 'PDF → JPG' : 'JPG → PDF';
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
        <Zap className="w-6 h-6 text-neon-green" />
        Conversion Queue
      </h2>
      <div className="space-y-3">
        {files.map((file) => (
          <Card key={file.id} className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-shrink-0">
                  {file.file.type === 'application/pdf' ? (
                    <FileIcon className="w-8 h-8 text-neon-pink" />
                  ) : (
                    <FileImage className="w-8 h-8 text-neon-green" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {file.file.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {getConversionDirection(file.file)} • {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {file.status === 'converting' && (
                    <div className="mt-2">
                      <Progress value={file.progress} className="h-2" />
                      <p className="text-xs text-neon-cyan mt-1">{file.progress}% converted</p>
                    </div>
                  )}
                  {file.status === 'error' && (
                    <p className="text-xs text-red-400 mt-1">Conversion failed</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {file.status === 'pending' && (
                  <Button
                    onClick={() => onConvert(file.id)}
                    className="neon-border bg-transparent hover:bg-neon-cyan/10 text-neon-cyan"
                    size="sm"
                  >
                    Convert
                  </Button>
                )}
                {file.status === 'converting' && (
                  <div className="flex items-center gap-2 text-neon-cyan">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Converting...</span>
                  </div>
                )}
                {file.status === 'completed' && (
                  <Button
                    onClick={() => onDownload(file.id)}
                    className="bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-blue hover:to-neon-green text-black font-medium"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
                {file.status === 'error' && (
                  <Button
                    onClick={() => onConvert(file.id)}
                    className="neon-border bg-transparent hover:bg-red-500/10 text-red-400"
                    size="sm"
                  >
                    Retry
                  </Button>
                )}
                <Button
                  onClick={() => onRemove(file.id)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                >
                  ✕
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FileList;
