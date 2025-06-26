
import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConversionFile } from '@/types/fileConverter';
import { convertJpgToPdf, convertPdfToJpg } from '@/utils/conversionUtils';
import UploadArea from './UploadArea';
import FileList from './FileList';
import FeatureSection from './FeatureSection';

const FileConverter = () => {
  const [files, setFiles] = useState<ConversionFile[]>([]);
  const { toast } = useToast();

  const handleFilesAdded = (fileList: File[]) => {
    const newFiles: ConversionFile[] = fileList.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
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
        <UploadArea onFilesAdded={handleFilesAdded} />

        {/* File List */}
        <FileList 
          files={files}
          onConvert={performConversion}
          onDownload={downloadFile}
          onRemove={removeFile}
        />

        {/* Features */}
        <FeatureSection />
      </div>
    </div>
  );
};

export default FileConverter;
