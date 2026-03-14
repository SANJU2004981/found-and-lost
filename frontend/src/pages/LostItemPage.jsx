import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import lostItemService from '../services/lostItemService';
import LocationPickerMap from '../components/LocationPickerMap';
import './ItemForm.css';

const LostItemPage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleLocationSelect = (lat, lng) => {
        setLatitude(lat);
        setLongitude(lng);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        setLoading(true);

        const user = authService.getCurrentUser();
        if (!user) {
            setMessage('You must be logged in to post an item.');
            setIsError(true);
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('location', location);
            if (latitude)  formData.append('latitude', latitude);
            if (longitude) formData.append('longitude', longitude);
            if (image)     formData.append('image', image);

            await lostItemService.createLostItem(formData);
            setMessage('Lost item posted successfully!');
            setIsError(false);
            
            // Clean up
            setTitle(''); setDescription(''); setLocation('');
            setLatitude(''); setLongitude(''); setImage(null); setImagePreview(null);
            
            setTimeout(() => navigate('/items'), 2000);
        } catch (err) {
            setMessage(err.error || 'Failed to post item. Please try again.');
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="item-form-page">
            <div className="item-form-container">
                {/* Sidebar */}
                <aside className="item-form-sidebar lost-sidebar">
                    <div className="sidebar-icon">🔍</div>
                    <h2>File a Lost Report</h2>
                    <p>Provide detailed information to help the community identify your property. Accurate details significantly increase recovery chances.</p>
                    <div className="sidebar-tips">
                        <h4>Report Checklist:</h4>
                        <ul>
                            <li>📸 Attach a high-quality photo</li>
                            <li>📍 Pin the exact area on the map</li>
                            <li>📝 Document unique markings or serials</li>
                            <li>🗺️ Provide GPS markers for the map</li>
                        </ul>
                    </div>
                </aside>

                {/* Form */}
                <div className="item-form-card">
                    <div className="item-form-header lost-header">
                        <span className="badge badge-lost">LOST REPORT</span>
                        <h3>Item Specifications</h3>
                    </div>

                    {message && (
                        <div className={`status-card ${isError ? 'error' : 'success'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="item-form">
                        <div className="form-group">
                            <label htmlFor="title">Report Title *</label>
                            <input id="title" type="text" className="form-control"
                                placeholder="Short descriptive name, e.g. Blue Dell Laptop" value={title}
                                onChange={e => setTitle(e.target.value)} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Detailed Description *</label>
                            <textarea id="description" className="form-control"
                                placeholder="Include distinguishing features, condition, or contents..."
                                value={description}
                                onChange={e => setDescription(e.target.value)} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="location">General Location Name *</label>
                            <input id="location" type="text" className="form-control"
                                placeholder="e.g. Central Park East, Near Water Fountain"
                                value={location}
                                onChange={e => setLocation(e.target.value)} required />
                        </div>

                        {/* Interactive Map Picker */}
                        <div className="form-group">
                            <label>Geospatial Pinpoint <span className="optional">(Precise Location)</span></label>
                            <LocationPickerMap 
                                onLocationSelect={handleLocationSelect}
                                initialLat={latitude}
                                initialLng={longitude}
                            />
                        </div>

                        <div className="form-group">
                            <label>Product Imagery <span className="optional">(Recommended)</span></label>
                            <label className="file-upload-zone" htmlFor="image-upload">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="image-preview" />
                                ) : (
                                    <div className="file-upload-placeholder">
                                        <span>📷</span>
                                        <span>Click to upload evidence photo</span>
                                        <span className="file-hint">Standard formats up to 10MB</span>
                                    </div>
                                )}
                            </label>
                            <input id="image-upload" type="file" accept="image/*"
                                style={{ display: 'none' }} onChange={handleImageChange} />
                        </div>

                        <button type="submit" className="btn btn-lost item-form-submit" disabled={loading}>
                            {loading ? 'Processing...' : '📋 Submit Lost Report'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LostItemPage;
