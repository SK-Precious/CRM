import React, { useState } from 'react';
import { useRole } from '../hooks/useRole';
import { supabase } from '../lib/supabase';
import { Camera, Upload, AlertTriangle, CheckCircle } from 'lucide-react';

export default function OcrIntake() {
  const { hasAccess } = useRole();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Security check: Only Sales, GM, Director
  if (!hasAccess(['junior_sales', 'gm', 'director'])) {
    return <div className="p-8 text-red-600">Access Denied: You do not have permission to utilize OCR Intake.</div>;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (x) => setImagePreview(x.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const processForm = async () => {
    if (!imagePreview) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke('ocr-intake', {
        body: { base64Image: imagePreview, mimeType: imageFile?.type }
      });
      if (error) throw error;
      setExtractedData(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gemini processing failed');
    } finally {
      setLoading(false);
    }
  };

  const submitBooking = async () => {
    alert('Booking Submitted Successfully!');
    setExtractedData(null);
    setImagePreview(null);
    setImageFile(null);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Camera className="mr-3" /> Gemini 1.5 OCR Intake
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition relative">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleImageChange}
            />
            {imagePreview ? (
              <img src={imagePreview} className="max-h-64 object-contain rounded" alt="Preview"/>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 font-medium">Click or drag a physical booking form</p>
                <p className="text-xs text-gray-400 mt-2">JPEG, PNG up to 10MB</p>
              </>
            )}
          </div>
          
          <button 
            disabled={!imageFile || loading}
            onClick={processForm}
            className={`w-full py-3 rounded-lg font-bold flex justify-center items-center ${
              !imageFile || loading ? 'bg-gray-300 text-gray-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {loading ? '🧠 Scanning with Gemini...' : 'Analyze Form Parameters'}
          </button>
          
          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" /> {errorMsg}
            </div>
          )}
        </div>

        <div>
          <div className="bg-white p-6 rounded-lg shadow min-h-[400px]">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Extracted Data Review</h2>
            {!extractedData ? (
              <div className="text-gray-400 flex items-center justify-center h-48">Waiting for AI extraction...</div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Client Name</label>
                    <input type="text" className="w-full border p-2 rounded" defaultValue={extractedData.name} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Contact</label>
                    <input type="text" className="w-full border p-2 rounded" defaultValue={extractedData.contact} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Event Date (DOF)</label>
                    <input type="date" className="w-full border p-2 rounded" defaultValue={extractedData.dof} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">PAX</label>
                    <input type="number" className="w-full border p-2 rounded" defaultValue={extractedData.pax} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Expected Amount</label>
                    <input type="text" className="w-full border p-2 rounded bg-amber-50 border-amber-200" defaultValue={extractedData.total_amount} />
                  </div>
                </div>
                
                <button 
                  onClick={submitBooking}
                  className="w-full py-3 mt-6 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex justify-center items-center"
                >
                  <CheckCircle className="mr-2" /> Confirm & Generate Booking
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
