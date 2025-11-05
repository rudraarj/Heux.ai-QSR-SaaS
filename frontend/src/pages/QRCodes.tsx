import { useState, useRef } from 'react';
import { Download, Copy, Check, ChevronDown, ChevronUp, Filter, FileText } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useDashboard } from '../contexts/DashboardContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusBadge } from '../components/ui/StatusBadge';

const QRCodes = () => {
  const { restaurants, sections } = useDashboard();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedRestaurants, setExpandedRestaurants] = useState<string[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const qrRefs = useRef<Record<string, SVGSVGElement | null>>({});
  const templateCanvasRef = useRef<HTMLCanvasElement>(null);

  const toggleRestaurant = (restaurantId: string) => {
    setExpandedRestaurants(prev => 
      prev.includes(restaurantId)
        ? prev.filter(id => id !== restaurantId)
        : [...prev, restaurantId]
    );
  };

  // const getQRValue = (sectionId: string) => {
  //   const section = sections.find(s => s.id === sectionId);
  //   const restaurant = restaurants.find(r => r.id === section?.restaurantId);
  //   return `https://api.whatsapp.com/send?phone=16476912142&text=${
  //     encodeURIComponent(restaurant?.name || 'Restaurant')
  //   }+${encodeURIComponent(restaurant?.location || 'location')}+%3A+Start+${
  //     encodeURIComponent(section?.name || 'Section')
  //   }+Inspection`;
  // };
  const getQRValue = (sectionId: string) => {
  const section = sections.find(s => s.id === sectionId);
  const restaurant = restaurants.find(r => r.id === section?.restaurantId);
  
  // Format: restaurantId_location : start-sectionName-inspection
  const restaurantId = restaurant?.name || 'unknown';
  const location = restaurant?.location?.toLowerCase().replace(/\s+/g, '-') || 'location';
  const sectionName = section?.name?.toLowerCase().replace(/\s+/g, '-') || 'section';
  
  return `https://api.whatsapp.com/send?phone=16476912142&text=${restaurantId}_${location}+%3A+start-${sectionName}-inspection`;
};

  // Helper function to create a single QR code template
  const createQRTemplate = async (sectionId: string, canvas: HTMLCanvasElement) => {
    const section = sections.find(s => s.id === sectionId);
    const restaurant = restaurants.find(r => r.id === section?.restaurantId);
    
    if (!section || !restaurant) {
      console.error('Section or restaurant not found for sectionId:', sectionId);
      return null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Exact PDF dimensions
    canvas.width = 480;
    canvas.height = 680;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Black border matching PDF exactly
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
    
    try {
      // Load HeyOpey.ai logo image
      const heyOpeyLogo = new Image();
      await new Promise<void>((resolve) => {
        heyOpeyLogo.onload = () => resolve();
        heyOpeyLogo.onerror = () => {
          console.warn('HeyOpey logo not found, falling back to text');
          resolve();
        };
        heyOpeyLogo.src = '/images/heyopey-logo.png';
      });
      
      // Draw HeyOpey.ai logo if loaded, otherwise draw text
      if (heyOpeyLogo.complete && heyOpeyLogo.naturalWidth > 0) {
        const logoMaxWidth = 300;
        const logoMaxHeight = 60;
        const logoAspectRatio = heyOpeyLogo.naturalWidth / heyOpeyLogo.naturalHeight;
        
        let logoWidth = logoMaxWidth;
        let logoHeight = logoMaxWidth / logoAspectRatio;
        
        if (logoHeight > logoMaxHeight) {
          logoHeight = logoMaxHeight;
          logoWidth = logoMaxHeight * logoAspectRatio;
        }
        
        const logoX = (canvas.width - logoWidth) / 2;
        const logoY = 40;
        
        ctx.drawImage(heyOpeyLogo, logoX, logoY, logoWidth, logoHeight);
      } else {
        // Fallback to text if image not found
        ctx.fillStyle = '#4A5568';
        ctx.font = 'bold 42px Arial, sans-serif';
        ctx.textAlign = 'center';
        
        const centerX = canvas.width / 2;
        const logoY = 85;
        
        const heyWidth = ctx.measureText('Hey').width;
        const opeyaiWidth = ctx.measureText('pey.ai').width;
        const totalWidth = heyWidth + 32 + opeyaiWidth;
        
        const startX = centerX - (totalWidth / 2);
        
        ctx.textAlign = 'left';
        ctx.fillText('Hey', startX, logoY);
        
        const circleX = startX + heyWidth + 16;
        const circleY = logoY - 14;
        
        ctx.beginPath();
        ctx.arc(circleX, circleY, 16, 0, 2 * Math.PI);
        ctx.fillStyle = '#40E0D0';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(circleX, circleY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        
        ctx.fillStyle = '#4A5568';
        ctx.fillText('pey.ai', circleX + 16, logoY);
      }
      
      // "Ops. On Demand." subtitle
      ctx.fillStyle = '#000000';
      ctx.font = '20px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Ops. On Demand.', canvas.width / 2, 125);
      
      // Station name with text wrapping
      ctx.font = 'bold 22px Arial, sans-serif';
      const stationText = `${section.name} Station`;
      const maxWidth = canvas.width - 40; // Leave 20px margin on each side
      
      // Function to wrap text
      const wrapText = (text: string, maxWidth: number, ctx: CanvasRenderingContext2D) => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const width = ctx.measureText(currentLine + ' ' + word).width;
          if (width < maxWidth) {
            currentLine += ' ' + word;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        lines.push(currentLine);
        return lines;
      };
      
      const lines = wrapText(stationText, maxWidth, ctx);
      const lineHeight = 28;
      const startY = 165 - ((lines.length - 1) * lineHeight / 2);
      
      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, startY + (index * lineHeight));
      });
      
      // QR Code section - Enhanced with better error handling
      const qrSvgElement = qrRefs.current[sectionId];
      console.log('QR SVG Element for section', section.name, ':', qrSvgElement);
      
      if (qrSvgElement) {
        try {
          const qrCanvas = document.createElement('canvas');
          const qrCtx = qrCanvas.getContext('2d');
          const qrSize = 290;
          qrCanvas.width = qrSize;
          qrCanvas.height = qrSize;
          
          if (qrCtx) {
            // White background for QR code
            qrCtx.fillStyle = '#ffffff';
            qrCtx.fillRect(0, 0, qrSize, qrSize);
            
            // Create QR code manually if SVG method fails
            const qrValue = getQRValue(sectionId);
            console.log('QR Value:', qrValue);
            
            // Try to serialize the SVG
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(qrSvgElement);
            
            // Create image from SVG
            const qrImg = new Image();
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const qrUrl = URL.createObjectURL(svgBlob);
            
            await new Promise<void>((resolve) => {
              qrImg.onload = () => {
                console.log('QR image loaded successfully for section:', section.name);
                qrCtx.drawImage(qrImg, 0, 0, qrSize, qrSize);
                URL.revokeObjectURL(qrUrl);
                resolve();
              };
              qrImg.onerror = (error) => {
                console.error('Failed to load QR image for section:', section.name, error);
                URL.revokeObjectURL(qrUrl);
                
                // Fallback: Draw a placeholder QR pattern
                qrCtx.fillStyle = '#000000';
                qrCtx.fillText('QR Code', qrSize / 2 - 30, qrSize / 2);
                resolve();
              };
              qrImg.src = qrUrl;
            });
            
            // Draw the QR code on main canvas
            const qrX = (canvas.width - qrSize) / 2;
            const qrY = startY + (lines.length * lineHeight) + 10; // Position below the text with some spacing
            ctx.drawImage(qrCanvas, qrX, qrY);
          }
        } catch (qrError) {
          console.error('Error processing QR code for section:', section.name, qrError);
          
          // Fallback: Draw placeholder
          const fallbackQrY = startY + (lines.length * lineHeight) + 10;
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect((canvas.width - 290) / 2, fallbackQrY, 290, 290);
          ctx.fillStyle = '#000000';
          ctx.font = '16px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('QR Code', canvas.width / 2, fallbackQrY + 145);
          ctx.fillText(`${section.name}`, canvas.width / 2, fallbackQrY + 165);
        }
      } else {
        console.warn('No QR SVG element found for section:', section.name);
        
        // Draw placeholder when QR element is not found
        const fallbackQrY = startY + (lines.length * lineHeight) + 10;
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect((canvas.width - 290) / 2, fallbackQrY, 290, 290);
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('QR Code', canvas.width / 2, fallbackQrY + 145);
        ctx.fillText(`${section.name}`, canvas.width / 2, fallbackQrY + 165);
      }
      
      // "Powered by" text - position dynamically based on QR code position
      const poweredByY = startY + (lines.length * lineHeight) + 10 + 290 + 20; // QR code height + spacing
      ctx.fillStyle = '#000000';
      ctx.font = '18px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Powered by', canvas.width / 2, poweredByY);
      
      // Load HUEX logo image
      const huexLogo = new Image();
      await new Promise<void>((resolve) => {
        huexLogo.onload = () => resolve();
        huexLogo.onerror = () => {
          console.warn('HUEX logo not found, falling back to text');
          resolve();
        };
        huexLogo.src = '/images/huex-logo.png';
      });
      
      // Draw HUEX logo if loaded, otherwise draw text
      if (huexLogo.complete && huexLogo.naturalWidth > 0) {
        const huexMaxWidth = 120;
        const huexMaxHeight = 80;
        const huexAspectRatio = huexLogo.naturalWidth / huexLogo.naturalHeight;
        
        let huexWidth = huexMaxWidth;
        let huexHeight = huexMaxWidth / huexAspectRatio;
        
        if (huexHeight > huexMaxHeight) {
          huexHeight = huexMaxHeight;
          huexWidth = huexMaxHeight * huexAspectRatio;
        }
        
        const huexX = (canvas.width - huexWidth) / 2;
        const huexY = poweredByY + 20; // Position below "Powered by" text
        
        ctx.drawImage(huexLogo, huexX, huexY, huexWidth, huexHeight);
      } else {
        // Fallback to text if image not found
        ctx.font = 'bold 52px Arial, sans-serif';
        ctx.fillStyle = '#FF0000';
        
        const centerX = canvas.width / 2;
        const huexY = poweredByY + 50;
        
        ctx.textAlign = 'right';
        ctx.fillText('HU', centerX - 5, huexY);
        
        ctx.textAlign = 'left';
        ctx.fillText('EX', centerX + 5, huexY);
        
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX + 5, huexY - 35);
        ctx.lineTo(centerX - 5, huexY + 5);
        ctx.stroke();
      }
      
    } catch (error) {
      console.error('Error loading images for section:', section.name, error);
    }
    
    return canvas.toDataURL('image/png', 1.0);
  };

  // New function to download all QR codes as PDF for a specific restaurant
const downloadRestaurantQRCodesAsPDF = async (restaurantId: string) => {
  setIsDownloadingPDF(true);
  
  try {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (!restaurant) return;

    // Get sections for this specific restaurant
    const restaurantSections = sections.filter(s => s.restaurantId === restaurantId);
    
    if (restaurantSections.length === 0) {
      alert('No QR codes found for this restaurant.');
      return;
    }

    // Dynamically import jsPDF
    const { jsPDF } = await import('jspdf');
    
    // A4 size configuration (210mm x 297mm)
    const a4Width = 210; // mm
    const a4Height = 297; // mm
    const cols = 2; // Number of columns
    const rows = 2; // Number of rows per page
    const qrPerPage = cols * rows; // 6 QR codes per page
    
    // Calculate QR code dimensions to fit A4 with margins
    const margin = 10; // mm margin
    const qrWidth = (a4Width - (margin * (cols + 1))) / cols; // mm
    const qrHeight = (a4Height - (margin * (rows + 1))) / rows; // mm
    
    // Create PDF with A4 size
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Process each section
    for (let i = 0; i < restaurantSections.length; i++) {
      const section = restaurantSections[i];
      
      // Calculate which page this QR code should go on
      const pageIndex = Math.floor(i / qrPerPage);
      const positionInPage = i % qrPerPage;
      
      // Add new page if needed (except for the first page)
      if (pageIndex > 0 && positionInPage === 0) {
        pdf.addPage();
      }
      
      // Calculate position in grid for current page
      const row = Math.floor(positionInPage / cols);
      const col = positionInPage % cols;
      
      const x = margin + (col * (qrWidth + margin));
      const y = margin + (row * (qrHeight + margin));
      
      // Create a temporary canvas for this QR code
      const tempCanvas = document.createElement('canvas');
      
      // Generate QR code image data
      const imageData = await createQRTemplate(section.id, tempCanvas);
      
      if (imageData) {
        // Add the image to PDF at calculated position
        pdf.addImage(imageData, 'PNG', x, y, qrWidth, qrHeight);
      }
    }
    
    // Generate filename for specific restaurant
    const filename = `QR_Codes_${restaurant.name.replace(/\s+/g, '_')}.pdf`;
    
    // Save the PDF
    pdf.save(filename);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  } finally {
    setIsDownloadingPDF(false);
  }
};


  // Template that exactly matches the PDF design - Updated with image support
  const downloadQRCodeWithTemplate = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    const restaurant = restaurants.find(r => r.id === section?.restaurantId);
    
    if (!section || !restaurant || !templateCanvasRef.current) return;

    const canvas = templateCanvasRef.current;
    const imageData = await createQRTemplate(sectionId, canvas);
    
    if (imageData) {
      // Download
      const link = document.createElement('a');
      link.download = `${section.name.replace(/\s+/g, '_')}_Station_QR.png`;
      link.href = imageData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
      {/* Hidden canvas for template generation */}
      <canvas 
        ref={templateCanvasRef} 
        style={{ display: 'none' }}
        width={480}
        height={680}
      />
      
      {/* Hidden QR codes container for PDF generation - always rendered */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden' }}>
        {sections.map(section => (
          <div key={`hidden-${section.id}`} className="p-3 bg-white rounded-lg border border-gray-200">
            <QRCode 
              ref={(el: any) => {
                qrRefs.current[section.id] = el;
              }}
              value={getQRValue(section.id)} 
              size={150}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">QR Codes</h2>
        
        {/* No global download button - each restaurant will have its own */}
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
                  setSelectedSection('all');
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

      {/* QR Codes by Restaurant */}
      <div className="space-y-6">
        {Object.entries(sectionsByRestaurant).map(([restaurantId, restaurantSections]) => {
          const restaurant = restaurants.find(r => r.id === restaurantId);
          const isExpanded = expandedRestaurants.includes(restaurantId);
          
          if (!restaurant) return null;
          
          return (
            <Card key={restaurantId} className='w-[80vw]'>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
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
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2'>
                      <span>Meta approval status: </span>
                      <StatusBadge status={restaurant.status}/>
                    </div>
                    
                    {/* Download PDF button for this restaurant */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent toggle when clicking download
                        downloadRestaurantQRCodesAsPDF(restaurantId);
                      }}
                      disabled={isDownloadingPDF}
                      icon={<FileText size={16} />}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isDownloadingPDF ? 'Generating...' : `Download PDF (${restaurantSections.length})`}
                    </Button>
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
                              <Button 
                                size="sm"
                                icon={<Download size={16} />}
                                onClick={() => downloadQRCodeWithTemplate(section.id)}
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
            {selectedRestaurant !== 'all' || selectedSection !== 'all' && (
              <p className="text-gray-500 mt-2">
                Try adjusting your filter criteria.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodes;