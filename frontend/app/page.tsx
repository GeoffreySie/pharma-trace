'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SketchButton from '@/components/SketchButton/SketchButton';

export default function Home() {
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [status, setStatus] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [productInfo, setProductInfo] = useState<null | { productId: string; productName: string; status: string; history: { timestamp: string; status: string; }[] }>(null);
  const [nodeStatus, setNodeStatus] = useState('Connecting...');

  useEffect(() => {
    // Check connection to Substrate node
    const checkNodeConnection = async () => {
      try {
        await axios.get('http://localhost:3000'); // This should match the backend URL
        setNodeStatus('Connected to Substrate node');
      } catch (error) {
        console.error('Failed to connect to Substrate node:', error);
        setNodeStatus('Failed to connect to Substrate node');
      }
    };
    checkNodeConnection();
  }, []);

  const registerProduct = async () => {
    try {
      const response = await axios.post('http://localhost:3000/register', { productId, productName, status });
      setQrCode(response.data.qrCode);
      toast.success('Product registered successfully!');
    } catch (error) {
      console.error('Failed to register product:', error);
      toast.error('Failed to register product');
    }
  };

  const updateStatus = async () => {
    try {
      const response = await axios.post('http://localhost:3000/update-status', { productId, newStatus: status });
      if (response.data.success) {
        toast.success('Status updated successfully');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/product/${productId}`);
      setProductInfo(response.data);
      toast.success('Product fetched successfully');
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to fetch product');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">PharmaTrace</h1>
      <div className="mb-4 text-green-500">{nodeStatus}</div>
      <input
        type="text"
        placeholder="Product ID"
        className="mb-2 p-2 border border-gray-300 rounded"
        onChange={(e) => setProductId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Product Name"
        className="mb-2 p-2 border border-gray-300 rounded"
        onChange={(e) => setProductName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Status"
        className="mb-2 p-2 border border-gray-300 rounded"
        onChange={(e) => setStatus(e.target.value)}
      />
      <div className="flex space-x-4 pt-4">
        <SketchButton onClick={registerProduct}>Register Product</SketchButton>
        <SketchButton onClick={updateStatus}>Update Status</SketchButton>
        <SketchButton onClick={fetchProduct}>Fetch Product</SketchButton>
      </div>
      {qrCode && (
        <div className="mb-4">
          <QRCode value={qrCode} />
        </div>
      )}
      {productInfo && (
        <div className="mt-4 p-4 border border-gray-300 rounded bg-white">
          <h2 className="text-xl font-bold mb-2">Product Details</h2>
          <p><strong>ID:</strong> {productInfo.productId}</p>
          <p><strong>Name:</strong> {productInfo.productName}</p>
          <p><strong>Status:</strong> {productInfo.status}</p>
          <p><strong>History:</strong></p>
          <ul>
            {productInfo.history.map((entry, index) => (
              <li key={index}>
                {entry.timestamp}: {entry.status}
              </li>
            ))}
          </ul>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}