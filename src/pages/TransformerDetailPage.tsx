import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import { UploadCloud, Image, Sun, Cloud, CloudRain, Upload, X, ChevronLeft, Check } from 'lucide-react';

interface UploadProgress {
  isVisible: boolean;
  progress: number;
  fileName: string;
  type: 'thermal' | 'baseline';
}

const TransformerDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const thermalInputRef = useRef<HTMLInputElement>(null);
    const baselineInputRef = useRef<HTMLInputElement>(null);

    // State management
    const [thermalCondition, setThermalCondition] = useState('Sunny');
    const [baselineCondition, setBaselineCondition] = useState('Sunny');
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
        isVisible: false,
        progress: 0,
        fileName: '',
        type: 'thermal'
    });
    
    // Mock existing baseline image (you can set this to null if no existing image)
    const [existingBaseline] = useState({
        url: 'https://via.placeholder.com/400x300/4ade80/ffffff?text=Baseline+Image',
        condition: 'Sunny',
        date: '15 May, 2023',
        fileName: 'baseline_sunny_20230515.jpg'
    });

    const [thermalImage, setThermalImage] = useState<{url: string, fileName: string} | null>(null);
    const [baselineImage, setBaselineImage] = useState<{url: string, fileName: string} | null>(
        existingBaseline ? { url: existingBaseline.url, fileName: existingBaseline.fileName } : null
    );

    const environmentalConditions = [
        { name: 'Sunny', icon: <Sun size={16} /> },
        { name: 'Cloudy', icon: <Cloud size={16} /> },
        { name: 'Rainy', icon: <CloudRain size={16} /> },
    ];

    const simulateUpload = (file: File, type: 'thermal' | 'baseline') => {
        setUploadProgress({
            isVisible: true,
            progress: 0,
            fileName: file.name,
            type
        });

        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev.progress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setUploadProgress(prev => ({ ...prev, isVisible: false }));
                        // Set the uploaded image
                        const imageUrl = URL.createObjectURL(file);
                        if (type === 'thermal') {
                            setThermalImage({ url: imageUrl, fileName: file.name });
                        } else {
                            setBaselineImage({ url: imageUrl, fileName: file.name });
                        }
                    }, 1000);
                    return { ...prev, progress: 100 };
                }
                return { ...prev, progress: prev.progress + 10 };
            });
        }, 200);
    };

    const handleDrop = (e: React.DragEvent, type: 'thermal' | 'baseline') => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            simulateUpload(files[0], type);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'thermal' | 'baseline') => {
        const files = e.target.files;
        if (files && files.length > 0) {
            simulateUpload(files[0], type);
        }
    };

    const ProgressModal = () => {
        if (!uploadProgress.isVisible) return null;

        return (
            <div 
                className="fixed inset-0 z-50 transition-all duration-300"
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                }}
            >
                <div className="flex justify-center items-center min-h-screen p-4">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                        <div className="text-center">
                            <Upload className="mx-auto mb-4 text-blue-600" size={48} />
                            <h3 className="text-xl font-bold mb-2">
                                Uploading {uploadProgress.type === 'thermal' ? 'Thermal' : 'Baseline'} Image
                            </h3>
                            <p className="text-gray-600 mb-4">{uploadProgress.fileName}</p>
                            
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                                <div 
                                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress.progress}%` }}
                                ></div>
                            </div>
                            
                            <p className="text-sm text-gray-600">{uploadProgress.progress}% completed</p>
                            
                            {uploadProgress.progress === 100 && (
                                <div className="flex items-center justify-center mt-4 text-green-600">
                                    <Check size={20} className="mr-2" />
                                    <span className="font-semibold">Upload Complete!</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Transformer Details" breadcrumb={`Transformer > ${id || 'AZ-8370'}`} />
            <ProgressModal />

            <main className="p-8">
                {/* Header with back button */}
                <div className="flex items-center space-x-4 mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">{id || 'AZ-8370'}</h2>
                        <p className="text-gray-500 text-lg mt-1">Nugegoda "Keels", Embuldeniya</p>
                    </div>
                </div>

                {/* Transformer Info Header */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                    <div className="flex justify-between items-start">
                        <div className="mt-6 pt-4 border-t flex space-x-8 text-sm text-gray-600">
                            <span><strong>Pole No:</strong> EN-122-A</span>
                            <span><strong>Type:</strong> Bulk</span>
                            <span><strong>Capacity:</strong> 102.97</span>
                            <span><strong>No. of Feeders:</strong> 2</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 text-right">Last Inspected</p>
                            <p className="font-semibold text-gray-700">Mon (21), May, 2023 12.55pm</p>
                        </div>
                    </div>
                </div>

                {/* Show both images side by side if both are available */}
                {thermalImage && baselineImage && (
                    <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800">Image Comparison</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-lg font-semibold mb-4 text-blue-600">Thermal Image</h4>
                                <div className="border-2 border-blue-200 rounded-xl overflow-hidden">
                                    <img 
                                        src={thermalImage.url} 
                                        alt="Thermal Image" 
                                        className="w-full h-64 object-cover"
                                    />
                                    <div className="p-4 bg-blue-50">
                                        <p className="text-sm text-gray-600">Condition: {thermalCondition}</p>
                                        <p className="text-sm text-gray-600">File: {thermalImage.fileName}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold mb-4 text-green-600">Baseline Image</h4>
                                <div className="border-2 border-green-200 rounded-xl overflow-hidden">
                                    <img 
                                        src={baselineImage.url} 
                                        alt="Baseline Image" 
                                        className="w-full h-64 object-cover"
                                    />
                                    <div className="p-4 bg-green-50">
                                        <p className="text-sm text-gray-600">Condition: {baselineCondition}</p>
                                        <p className="text-sm text-gray-600">File: {baselineImage.fileName}</p>
                                        {existingBaseline && !thermalImage && (
                                            <p className="text-sm text-gray-600">Date: {existingBaseline.date}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Image Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Thermal Image Upload */}
                    {!thermalImage && (
                        <div className="bg-white p-8 rounded-xl shadow-lg">
                            <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                                <UploadCloud className="mr-3 text-blue-600" size={24} /> 
                                Upload Thermal Image (Maintenance)
                            </h3>
                            
                            <div 
                                className="border-2 border-dashed border-blue-300 rounded-xl p-10 text-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                                onDrop={(e) => handleDrop(e, 'thermal')}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => thermalInputRef.current?.click()}
                            >
                                <div className="flex flex-col items-center">
                                    <Upload className="text-blue-500 mb-4" size={48} />
                                    <p className="text-gray-600 mb-2 text-lg font-semibold">Drop thermal image here</p>
                                    <p className="text-gray-500 mb-6">or click to browse files</p>
                                    <button className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center">
                                        <UploadCloud className="mr-2" size={20} />
                                        Choose File
                                    </button>
                                </div>
                            </div>
                            
                            <input 
                                ref={thermalInputRef}
                                type="file" 
                                accept="image/*" 
                                className="hidden"
                                onChange={(e) => handleFileSelect(e, 'thermal')}
                            />
                            
                            <div className="mt-6">
                                <label className="block text-gray-800 mb-3 font-bold text-lg">Environmental Condition</label>
                                <div className="flex space-x-3">
                                    {environmentalConditions.map(cond => (
                                        <button 
                                            key={cond.name} 
                                            onClick={() => setThermalCondition(cond.name)}
                                            className={`flex-1 p-4 border-2 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 font-semibold ${
                                                thermalCondition === cond.name 
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg transform scale-105' 
                                                    : 'hover:bg-blue-50 border-gray-300 hover:border-blue-300'
                                            }`}
                                        >
                                            {cond.icon}<span>{cond.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Baseline Image Upload - Show only if no existing baseline */}
                    {!baselineImage && (
                        <div className="bg-white p-8 rounded-xl shadow-lg">
                            <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                                <Image className="mr-3 text-green-600" size={24} /> 
                                Upload Baseline Image (Reference)
                            </h3>
                            
                            <div 
                                className="border-2 border-dashed border-green-300 rounded-xl p-10 text-center bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
                                onDrop={(e) => handleDrop(e, 'baseline')}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => baselineInputRef.current?.click()}
                            >
                                <div className="flex flex-col items-center">
                                    <Upload className="text-green-500 mb-4" size={48} />
                                    <p className="text-gray-600 mb-2 text-lg font-semibold">Drop baseline image here</p>
                                    <p className="text-gray-500 mb-6">or click to browse files</p>
                                    <button className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center">
                                        <Image className="mr-2" size={20} />
                                        Choose File
                                    </button>
                                </div>
                            </div>
                            
                            <input 
                                ref={baselineInputRef}
                                type="file" 
                                accept="image/*" 
                                className="hidden"
                                onChange={(e) => handleFileSelect(e, 'baseline')}
                            />
                            
                            <div className="mt-6">
                                <label className="block text-gray-800 mb-3 font-bold text-lg">Environmental Condition</label>
                                <div className="flex space-x-3">
                                    {environmentalConditions.map(cond => (
                                        <button 
                                            key={cond.name} 
                                            onClick={() => setBaselineCondition(cond.name)}
                                            className={`flex-1 p-4 border-2 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 font-semibold ${
                                                baselineCondition === cond.name 
                                                    ? 'bg-green-600 text-white border-green-600 shadow-lg transform scale-105' 
                                                    : 'hover:bg-green-50 border-gray-300 hover:border-green-300'
                                            }`}
                                        >
                                            {cond.icon}<span>{cond.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Show existing baseline image info */}
                    {existingBaseline && baselineImage && !thermalImage && (
                        <div className="bg-white p-8 rounded-xl shadow-lg">
                            <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                                <Image className="mr-3 text-green-600" size={24} /> 
                                Existing Baseline Image
                            </h3>
                            <div className="border-2 border-green-200 rounded-xl overflow-hidden">
                                <img 
                                    src={existingBaseline.url} 
                                    alt="Existing Baseline" 
                                    className="w-full h-64 object-cover"
                                />
                                <div className="p-4 bg-green-50">
                                    <p className="text-sm text-gray-600"><strong>Condition:</strong> {existingBaseline.condition}</p>
                                    <p className="text-sm text-gray-600"><strong>Date:</strong> {existingBaseline.date}</p>
                                    <p className="text-sm text-gray-600"><strong>File:</strong> {existingBaseline.fileName}</p>
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <button 
                                    onClick={() => setBaselineImage(null)}
                                    className="text-red-600 hover:text-red-800 font-semibold"
                                >
                                    Replace Baseline Image
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TransformerDetailPage;