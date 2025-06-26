
export interface ConversionFile {
  id: string;
  file: File;
  status: 'pending' | 'converting' | 'completed' | 'error';
  progress: number;
  outputUrl?: string;
  outputBlob?: Blob;
  outputFileName?: string;
}
