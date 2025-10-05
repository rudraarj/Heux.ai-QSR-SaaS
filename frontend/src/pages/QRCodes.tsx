import React, { useState, useRef } from 'react';
import { Download, Copy, Check, Plus, ChevronDown, ChevronUp, X, Filter } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useDashboard } from '../contexts/DashboardContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusBadge } from '../components/ui/StatusBadge';

interface QRCodeFormData {
  restaurantId: string;
  sectionId: string;
  message: string;
}


const QRCodes = () => {
  const { restaurants, sections } = useDashboard();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedRestaurants, setExpandedRestaurants] = useState<string[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [formData, setFormData] = useState<QRCodeFormData>({
    restaurantId: '',
    sectionId: '',
    message: '',
  });

  const qrRefs = useRef<Record<string, SVGSVGElement | null>>({});


  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();
    // Add the new section to expanded restaurants
    setExpandedRestaurants(prev => 
      prev.includes(formData.restaurantId) 
        ? prev 
        : [...prev, formData.restaurantId]
    );
    setShowCreateForm(false);
    setFormData({ restaurantId: '', sectionId: '', message: '' });
  };

  const toggleRestaurant = (restaurantId: string) => {
    setExpandedRestaurants(prev => 
      prev.includes(restaurantId)
        ? prev.filter(id => id !== restaurantId)
        : [...prev, restaurantId]
    );
  };

  const getQRValue = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    const restaurant = restaurants.find(r => r.id === section?.restaurantId);
    console.log(restaurant?.location)
    // https://api.whatsapp.com/send?phone=919935391074&text=Tim+Hortons+Canada%3A+Start+Soup+and+Sandwich+Inspection
    return `https://api.whatsapp.com/send?phone=919935391074&text=${
      encodeURIComponent(restaurant?.name || 'Restaurant')
    }+${encodeURIComponent(restaurant?.location || 'location')}+%3A+Start+${
      encodeURIComponent(section?.name || 'Section')
    }+Inspection`;
  };

  const downloadQRCode = (sectionId: string) => {
  const svgElement = qrRefs.current[sectionId];
  if (!svgElement) return;

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const canvas = document.createElement('canvas');
  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    const pngUrl = canvas.toDataURL('image/png');

    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${sectionId}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  img.src = url;
};


  const handleCopyLink = (sectionId: string) => {
    const link = getQRValue(sectionId);
    navigator.clipboard.writeText(link);
    setCopiedId(sectionId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter sections based on selected restaurant and section
  const filteredSections = sections.filter(section => {
    const matchesRestaurant = selectedRestaurant === 'all' || section.restaurantId === selectedRestaurant;
    const matchesSection = selectedSection === 'all' || section.id === selectedSection;
    return matchesRestaurant && matchesSection;
  });

  // Group filtered sections by restaurant
  const sectionsByRestaurant = restaurants.reduce((acc, restaurant) => {
    const restaurantSections = filteredSections.filter(s => s.restaurantId === restaurant.id);
    if (restaurantSections.length > 0) {
      acc[restaurant.id] = restaurantSections;
    }
    return acc;
  }, {} as Record<string, typeof sections>);

  // Get available sections based on selected restaurant
  const availableSections = selectedRestaurant === 'all' 
    ? sections 
    : sections.filter(section => section.restaurantId === selectedRestaurant);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">QR Codes</h2>
        <Button icon={<Plus size={16} />} onClick={() => setShowCreateForm(true)}>
          Create QR Code
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center flex-1">
              <Filter size={16} className="text-gray-500 mr-2" />
              <select
                className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex-1"
                value={selectedRestaurant}
                onChange={(e) => {
                  setSelectedRestaurant(e.target.value);
                  setSelectedSection('all'); // Reset section when restaurant changes
                }}
              >
                <option value="all">All Restaurants</option>
                {restaurants.map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center flex-1">
              <select
                className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex-1"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={selectedRestaurant === 'all'}
              >
                <option value="all">All Sections</option>
                {availableSections.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create QR Code Form */}
      {showCreateForm && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
            onClick={() => setShowCreateForm(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 animate-slide-in-right">
            <div className="h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Create QR Code</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500"
                  onClick={() => setShowCreateForm(false)}
                  icon={<X size={16} />}
                />
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleCreateNotification} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Restaurant
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={formData.restaurantId}
                      onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value, sectionId: '' })}
                      required
                    >
                      <option value="">Select a restaurant</option>
                      {restaurants.map(restaurant => (
                        <option key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Section
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={formData.sectionId}
                      onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                      required
                      disabled={!formData.restaurantId}
                    >
                      <option value="">Select a section</option>
                      {formData.restaurantId && sections
                        .filter(section => section.restaurantId === formData.restaurantId)
                        .map(section => (
                          <option key={section.id} value={section.id}>
                            {section.name}
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp Message
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Enter the message that will be pre-filled in WhatsApp"
                      required
                    />
                  </div>
                </form>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateNotification}>
                    Create QR Code
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* QR Codes by Restaurant */}
      <div className="space-y-6">
        {Object.entries(sectionsByRestaurant).map(([restaurantId, restaurantSections]) => {
          const restaurant = restaurants.find(r => r.id === restaurantId);
          const isExpanded = expandedRestaurants.includes(restaurantId);
          
          if (!restaurant) return null;
          
          return (
            <Card key={restaurantId} className='w-[80vw]'>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors duration-200 "
                
              >
                <div className="flex items-center justify-between w-[100%]">
                  <div className='flex items-center'>
                    <CardTitle className="flex items-center">
                    {restaurant.name}
                    <Badge variant="outline" className="ml-2">
                      {restaurantSections.length} QR Codes
                    </Badge>
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleRestaurant(restaurantId)}
                    icon={isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  />
                  </div>
                  <div className='w-[19%] flex justify-between'>
                  <span>Meta approval status:  </span>
                  <StatusBadge status={restaurant.status}/>
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent>
                  <div className="overflow-x-auto w-[100%]">
                    <div className="inline-flex space-x-4 pb-4 min-w-full">
                      <div className="flex gap-4 snap-x snap-mandatory overflow-x-auto pb-4 -mb-4">
                        {restaurantSections.map(section => (
                          <Card key={section.id} className="w-64 flex-shrink-0 snap-start">
                            <CardContent className="p-4">
                              <div className="flex justify-center mb-4">
                                <div className="p-3 bg-white rounded-lg border border-gray-200">
                                  <QRCode 
                                    ref={(el:any) => {
                                      qrRefs.current[section.id] = el;
                                    }}
                                    value={getQRValue(section.id)} 
                                    size={150}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                  />
                                </div>
                              </div>
                              <h3 className="font-medium text-gray-900 mb-2">{section.name}</h3>
                              <p className="text-sm text-gray-500 truncate">
                                {getQRValue(section.id)}
                              </p>
                            </CardContent>
                            <CardFooter className="flex justify-between bg-gray-50 p-3">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleCopyLink(section.id)}
                                icon={copiedId === section.id ? <Check size={16} /> : <Copy size={16} />}
                              >
                                {copiedId === section.id ? 'Copied!' : 'Copy'}
                              </Button>
                              <Button size="sm"
                                      icon={<Download size={16}
                                      />}
                                      onClick={()=> downloadQRCode(section.id)}
                                      >
                                Download
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {Object.keys(sectionsByRestaurant).length === 0 && (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No QR codes found.</p>
            {selectedRestaurant !== 'all' || selectedSection !== 'all' ? (
              <p className="text-gray-500 mt-2">
                Try adjusting your filter criteria.
              </p>
            ) : (
              <div className="mt-4">
                <Button icon={<Plus size={16} />} onClick={() => setShowCreateForm(true)}>
                  Create Your First QR Code
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodes;