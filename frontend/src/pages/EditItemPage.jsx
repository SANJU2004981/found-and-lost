import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import lostItemService from '../services/lostItemService';
import foundItemService from '../services/foundItemService';
import LocationPickerMap from '../components/LocationPickerMap';
import './ItemForm.css';

const EditItemPage = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const service = type === 'lost' ? lostItemService : foundItemService;

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const item = type === 'lost' 
                    ? await lostItemService.getLostItemById(id)
                    : await foundItemService.getFoundItemById(id);
                
                setTitle(item.title);
                setDescription(item.description);
                setLocation(item.location || item.location_name);
                setLatitude(item.latitude);
                setLongitude(item.longitude);
                setImagePreview(item.image_url);
            } catch (err) {
                setMessage('Failed to load item data.');
                setIsError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id, type]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleLocationSelect = (lat, lng) => {
        setLatitude(lat);
        setLongitude(lng);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('location', location);
            if (latitude) formData.append('latitude', latitude);
            if (longitude) formData.append('longitude', longitude);
            if (image) formData.append('image', image);

            if (type === 'lost') {
                await lostItemService.updateLostItem(id, formData);
            } else {
                await foundItemService.updateFoundItem(id, formData);
            }

            setMessage('Changes saved successfully!');
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setMessage(err.error || 'Failed to update item.');
            setIsError(true);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-screen"><div className="spinner" /><p>Retrieving post data...</p></div>;

    return (
        <div className="item-form-page">
            <div className="item-form-container">
                <aside className={`item-form-sidebar ${type}-sidebar`}>
                    <div className="sidebar-icon">{type === 'lost' ? '🔍' : '📦'}</div>
                    <h2>Update Report</h2>
                    <p>Modify your post details to keep the community informed. Updated photos and precise markers improve recovery speed.</p>
                </aside>

                <div className="item-form-card">
                    <div className={`item-form-header ${type}-header`}>
                        <span className={`badge badge-${type}`}>EDITING {type.toUpperCase()}</span>
                        <h3>Revise Specifications</h3>
                    </div>

                    {message && <div className={`status-card ${isError ? 'error' : 'success'}`}>{message}</div>}

                    <form onSubmit={handleSubmit} className="item-form">
                        <div className="form-group">
                            <label>Report Title *</label>
                            <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
                        </div>

                        <div className="form-group">
                            <label>Detailed Description *</label>
                            <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} required />
                        </div>

                        <div className="form-group">
                            <label>General Location Name *</label>
                            <input type="text" className="form-control" value={location} onChange={e => setLocation(e.target.value)} required />
                        </div>

                        <div className="form-group">
                            <label>Geospatial Pinpoint <span className="optional">(Precise Location)</span></label>
                            <LocationPickerMap 
                                onLocationSelect={handleLocationSelect}
                                initialLat={parseFloat(latitude)}
                                initialLng={parseFloat(longitude)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Product Imagery <span className="optional">(Leave blank to keep existing)</span></label>
                            <label className="file-upload-zone" htmlFor="image-upload">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="image-preview" />
                                ) : (
                                    <div className="file-upload-placeholder">
                                        <span>📷</span>
                                        <span>Update evidence photo</span>
                                    </div>
                                )}
                            </label>
                            <input id="image-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                        </div>

                        <div className="form-row" style={{ gap: '12px' }}>
                            <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')} style={{ flex: 1 }}>
                                Cancel
                            </button>
                            <button type="submit" className={`btn btn-${type}`} disabled={saving} style={{ flex: 2 }}>
                                {saving ? 'Saving...' : '💾 Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditItemPage;
