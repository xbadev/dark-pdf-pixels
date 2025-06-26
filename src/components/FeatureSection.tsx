
import React from 'react';
import { Zap, FileImage, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';

const FeatureSection = () => {
  return (
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
  );
};

export default FeatureSection;
