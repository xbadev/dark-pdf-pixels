
import React, { useState, useCallback } from 'react';
import { Upload, Download, Zap, FileImage, File as FileIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface ConversionFile {
  id: string;
  file: File;
  status: 'pending' | 'converting' | 'completed' | 'error';
  progress: number;
  outputUrl?: string;
}

const FileConverter = () => {
  const [files, setFiles] = useState<ConversionFile[]>([]);
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
  };

  const handleFiles = (fileList: File[]) => {
    const validFiles = fileList.filter(file => {
      const isValidType = file.type === 'image/jpeg' || file.type === 'application/pdf';
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a JPG or PDF file.`,
          variant: "destructive",
        });
      }
      return isValidType;
    });

    const newFiles: ConversionFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const simulateConversion = async (fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'converting' as const } : f
    ));

    // Simulate conversion progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress } : f
      ));
    }

    // Simulate completion
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { 
        ...f, 
        status: 'completed' as const, 
        outputUrl: URL.createObjectURL(f.file) // In real app, this would be the converted file
      } : f
    ));

    toast({
      title: "Conversion completed!",
      description: "Your file has been successfully converted.",
    });
  };

  const convertFile = (fileId: string) => {
    simulateConversion(fileId);
  };

  const downloadFile = (file: ConversionFile) => {
    if (file.outputUrl) {
      const link = document.createElement('a');
      link.href = file.outputUrl;
      const outputExtension = file.file.type === 'image/jpeg' ? 'pdf' : 'jpg';
      link.download = `${file.file.name.split('.')[0]}_converted.${outputExtension}`;
      link.click();
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getConversionDirection = (file: File) => {
    return file.type === 'image/jpeg' ? 'JPG → PDF' : 'PDF → JPG';
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Zap className="w-12 h-12 text-neon-cyan animate-pulse-neon" />
              <div className="absolute inset-0 animate-glow"></div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent neon-text">
              NeonConvert
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transform your files with lightning speed. Convert between JPG and PDF formats 
            with our cutting-edge neon-powered converter.
          </p>
        </div>

        {/* Upload Area */}
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
                <label htmlFor="file-upload">
                  <Button className="bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-purple hover:to-neon-cyan text-black font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
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

        {/* File List */}
        {files.length > 0 && (
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
                        {file.file.type === 'image/jpeg' ? (
                          <FileImage className="w-8 h-8 text-neon-green" />
                        ) : (
                          <FileIcon className="w-8 h-8 text-neon-pink" />
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
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === 'pending' && (
                        <Button
                          onClick={() => convertFile(file.id)}
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
                          onClick={() => downloadFile(file)}
                          className="bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-blue hover:to-neon-green text-black font-medium"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                      <Button
                        onClick={() => removeFile(file.id)}
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
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 py-8">
          <Card className="glass-card p-6 text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-neon-cyan to-neon-blue rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-pulse">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-gray-400">Convert your files in seconds with our optimized processing engine.</p>
          </Card>
          <Card className="glass-card p-6 text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-neon-purple to-neon-pink rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-pulse">
              <FileImage className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">High Quality</h3>
            <p className="text-gray-400">Maintain perfect quality in your converted files with advanced algorithms.</p>
          </Card>
          <Card className="glass-card p-6 text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-neon-green to-neon-yellow rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-pulse">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Easy to Use</h3>
            <p className="text-gray-400">Simple drag & drop interface makes file conversion effortless.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FileConverter;
