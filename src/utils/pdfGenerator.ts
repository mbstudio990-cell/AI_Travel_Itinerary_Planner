import jsPDF from 'jspdf';
import { Itinerary } from '../types';

export const generatePDF = async (itinerary: Itinerary): Promise<void> => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10): number => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * (fontSize * 0.4));
  };

  // Helper function to check if we need a new page
  const checkNewPage = (requiredHeight: number): number => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      return margin;
    }
    return yPosition;
  };

  // Header
  pdf.setFillColor(37, 99, 235); // Blue background
  pdf.rect(0, 0, pageWidth, 60, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('WanderAI Travel Itinerary', margin, 25);
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text(itinerary.destination, margin, 40);
  
  pdf.setFontSize(12);
  const dateRange = `${new Date(itinerary.startDate).toLocaleDateString()} - ${new Date(itinerary.endDate).toLocaleDateString()}`;
  pdf.text(dateRange, margin, 50);

  yPosition = 80;

  // Trip Overview
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Trip Overview', margin, yPosition);
  yPosition += 15;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const overviewData = [
    ['Destination:', itinerary.destination],
    ['Duration:', `${itinerary.days.length} days`],
    ['Budget Level:', itinerary.preferences.budget],
    ['Total Budget:', itinerary.totalBudget],
    ['Interests:', itinerary.preferences.interests.join(', ')],
    ['Created:', new Date(itinerary.createdAt).toLocaleDateString()]
  ];

  overviewData.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    yPosition = addWrappedText(value, margin + 40, yPosition, contentWidth - 40, 11);
    yPosition += 5;
  });

  yPosition += 10;

  // Daily Itineraries
  for (const day of itinerary.days) {
    yPosition = checkNewPage(40);
    
    // Day header
    pdf.setFillColor(239, 246, 255); // Light blue background
    pdf.rect(margin, yPosition - 5, contentWidth, 25, 'F');
    
    pdf.setTextColor(30, 64, 175); // Dark blue text
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Day ${day.day} - ${day.date}`, margin + 5, yPosition + 8);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Estimated Cost: ${day.totalEstimatedCost}`, margin + 5, yPosition + 18);
    
    yPosition += 35;

    // Activities
    for (const activity of day.activities) {
      yPosition = checkNewPage(60);
      
      // Activity time and title
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${activity.time} - ${activity.title}`, margin, yPosition);
      yPosition += 8;
      
      // Category and cost
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128); // Gray text
      pdf.text(`Category: ${activity.category} | Cost: ${activity.costEstimate}`, margin, yPosition);
      yPosition += 8;
      
      // Location
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Location:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(activity.location, margin + 25, yPosition, contentWidth - 25, 9);
      yPosition += 5;
      
      // Description
      pdf.setFont('helvetica', 'bold');
      pdf.text('Description:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(activity.description, margin + 30, yPosition, contentWidth - 30, 9);
      yPosition += 5;
      
      // Tips
      if (activity.tips) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('💡 Tips:', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        yPosition = addWrappedText(activity.tips, margin + 20, yPosition, contentWidth - 20, 9);
        yPosition += 5;
      }
      
      // Add separator line
      pdf.setDrawColor(229, 231, 235);
      pdf.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
      yPosition += 15;
    }
    
    yPosition += 10;
  }

  // Footer
  yPosition = checkNewPage(40);
  pdf.setFillColor(249, 250, 251); // Light gray background
  pdf.rect(margin, yPosition, contentWidth, 30, 'F');
  
  pdf.setTextColor(107, 114, 128);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Generated by WanderAI - Your AI Travel Companion', margin + 5, yPosition + 12);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin + 5, yPosition + 22);

  // Add page numbers
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(8);
    pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
  }

  // Generate filename
  const sanitizedDestination = itinerary.destination.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `WanderAI_${sanitizedDestination}_${new Date(itinerary.startDate).toISOString().split('T')[0]}.pdf`;

  // Save the PDF
  pdf.save(filename);
};