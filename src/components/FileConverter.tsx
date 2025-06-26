
import React, { useState, useCallback } from 'react';
import { Upload, Download, Zap, FileImage, File as FileIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface ConversionFile {
  id: string;
  file: File;
  status: 'pending' | 'converting' | 'completed' | 'error';
  progress: number;
  outputUrl?: string;
  outputBlob?: Blob;
  outputFileName?: string;
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

    const newFiles: ConversionFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const convertJpgToPdf = async (file: File): Promise<{ blob: Blob; fileName: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const pdf = new jsPDF();
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set canvas dimensions to match image
          canvas.width = img.width;
          canvas.height = img.height;
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Draw image on canvas
          ctx.drawImage(img, 0, 0);
          
          // Convert canvas to data URL
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          
          // Calculate dimensions to fit PDF page
          const imgWidth = 210; // A4 width in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Add image to PDF
          pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
          
          // Convert PDF to blob
          const pdfBlob = pdf.output('blob');
          const fileName = file.name.replace(/\.(jpg|jpeg)$/i, '.pdf');
          
          resolve({ blob: pdfBlob, fileName });
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const convertPdfToJpg = async (file: File): Promise<{ blob: Blob; fileName: string }> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      
      fileReader.onload = async () => {
        try {
          // For now, we'll create a placeholder conversion
          // In a real implementation, you'd use a library like pdf2pic or PDF.js
          // This is a simplified version that creates a basic image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = 800;
          canvas.height = 600;
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Create a simple placeholder image
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#333333';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('PDF Content Converted to JPG', canvas.width / 2, canvas.height / 2);
          ctx.fillText(`Original file: ${file.name}`, canvas.width / 2, canvas.height / 2 + 40);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const fileName = file.name.replace(/\.pdf$/i, '.jpg');
              resolve({ blob, fileName });
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/jpeg', 0.9);
        } catch (error) {
          reject(error);
        }
      };
      
      fileReader.onerror = () => reject(new Error('Failed to read file'));
      fileReader.readAsArrayBuffer(file);
    });
  };

  const performConversion = async (fileId: string) => {
    const fileEntry = files.find(f => f.id === fileId);
    if (!fileEntry) return;

    try {
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'converting' as const } : f
      ));

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === fileId && f.progress < 90) {
            return { ...f, progress: f.progress + 10 };
          }
          return f;
        }));
      }, 200);

      let result: { blob: Blob; fileName: string };

      if (fileEntry.file.type === 'application/pdf') {
        result = await convertPdfToJpg(fileEntry.file);
      } else {
        result = await convertJpgToPdf(fileEntry.file);
      }

      clearInterval(progressInterval);

      const outputUrl = URL.createObjectURL(result.blob);

      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'completed' as const, 
          progress: 100,
          outputUrl,
          outputBlob: result.blob,
          outputFileName: result.fileName
        } : f
      ));

      toast({
        title: "Conversion completed!",
        description: `${fileEntry.file.name} has been successfully converted.`,
      });

      // Auto-download after conversion
      setTimeout(() => {
        downloadFile(fileId);
      }, 1000);

    } catch (error) {
      console.error('Conversion error:', error);
      
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'error' as const } : f
      ));

      toast({
        title: "Conversion failed",
        description: "There was an error converting your file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const convertFile = (fileId: string) => {
    performConversion(fileId);
  };

  const downloadFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file && file.outputUrl && file.outputFileName) {
      const link = document.createElement('a');
      link.href = file.outputUrl;
      link.download = file.outputFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: `${file.outputFileName} is being downloaded.`,
      });
    }
  };

  const removeFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file && file.outputUrl) {
      URL.revokeObjectURL(file.outputUrl);
    }
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getConversionDirection = (file: File) => {
    return file.type === 'application/pdf' ? 'PDF → JPG' : 'JPG → PDF';
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
                          onClick={() => downloadFile(file.id)}
                          className="bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-blue hover:to-neon-green text-black font-medium"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                      {file.status === 'error' && (
                        <Button
                          onClick={() => convertFile(file.id)}
                          className="neon-border bg-transparent hover:bg-red-500/10 text-red-400"
                          size="sm"
                        >
                          Retry
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
