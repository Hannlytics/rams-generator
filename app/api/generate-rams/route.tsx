import { NextResponse } from 'next/server';
import jsPDF from 'jspdf';

export async function POST(request: Request) {
  try {
    const formData = await request.json();
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('RISK ASSESSMENT & METHOD STATEMENT', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Generated: ' + new Date().toLocaleDateString('en-GB'), 105, 30, { align: 'center' });
    
    // Add line separator
    doc.line(20, 35, 190, 35);
    
    // Project Information
    doc.setFontSize(14);
    doc.text('PROJECT INFORMATION', 20, 45);
    
    doc.setFontSize(10);
    doc.text(`Project Name: ${formData.projectName || 'Not specified'}`, 20, 55);
    doc.text(`Client: ${formData.clientName || 'Not specified'}`, 20, 62);
    doc.text(`Site Address: ${formData.siteAddress || 'Not specified'}`, 20, 69);
    doc.text(`Start Date: ${formData.startDate || 'TBC'}`, 20, 76);
    doc.text(`End Date: ${formData.endDate || 'TBC'}`, 110, 76);
    doc.text(`Duration: ${formData.duration || 'TBC'}`, 20, 83);
    doc.text(`Job Reference: ${formData.jobReference || 'N/A'}`, 110, 83);
    doc.text(`Site Contact: ${formData.siteContactPerson || 'N/A'}`, 20, 90);
    
    // Work Details
    doc.line(20, 95, 190, 95);
    doc.setFontSize(14);
    doc.text('WORK DETAILS', 20, 105);
    
    doc.setFontSize(10);
    doc.text(`Trade: ${formData.trade || 'Not specified'}`, 20, 115);
    doc.text(`Task Type: ${formData.taskType || 'Not specified'}`, 20, 122);
    
    // Scope of Work
    doc.text('Scope of Work:', 20, 132);
    const scopeLines = doc.splitTextToSize(formData.scopeOfWork || 'Not provided', 170);
    doc.text(scopeLines, 20, 139);
    
    // Method Statement
    let yPosition = 139 + (scopeLines.length * 5) + 10;
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(14);
    doc.text('METHOD STATEMENT', 20, yPosition);
    doc.setFontSize(10);
    const methodLines = doc.splitTextToSize(formData.methodStatement || 'Not provided', 170);
    doc.text(methodLines, 20, yPosition + 10);
    
    // Risk Assessment - New Page
    doc.addPage();
    doc.setFontSize(14);
    doc.text('RISK ASSESSMENT', 20, 20);
    
    // Hazards
    doc.setFontSize(10);
    doc.text('Identified Hazards:', 20, 30);
    const hazards = formData.selectedHazards || [];
    let hazardY = 37;
    hazards.forEach((hazard: string) => {
      doc.text(`• ${hazard}`, 25, hazardY);
      hazardY += 7;
    });
    
    // PPE
    doc.text('PPE Requirements:', 20, hazardY + 5);
    let ppeY = hazardY + 12;
    const ppeList = formData.selectedPPE || [];
    ppeList.forEach((ppe: string) => {
      doc.text(`• ${ppe}`, 25, ppeY);
      ppeY += 7;
    });
    
    // Control Measures
    doc.text('Control Measures:', 20, ppeY + 5);
    const controlLines = doc.splitTextToSize(formData.controls || 'Not provided', 170);
    doc.text(controlLines, 20, ppeY + 12);
    
    // Emergency Procedures - New Page if needed
    doc.addPage();
    doc.setFontSize(14);
    doc.text('EMERGENCY PROCEDURES', 20, 20);
    
    doc.setFontSize(10);
    doc.text('First Aid Arrangements:', 20, 30);
    const firstAidLines = doc.splitTextToSize(formData.firstAidArrangements || 'Not provided', 170);
    doc.text(firstAidLines, 20, 37);
    
    let emergY = 37 + (firstAidLines.length * 5) + 10;
    doc.text('Fire Precautions:', 20, emergY);
    const fireLines = doc.splitTextToSize(formData.firePrecautions || 'Not provided', 170);
    doc.text(fireLines, 20, emergY + 7);
    
    emergY = emergY + 7 + (fireLines.length * 5) + 10;
    doc.text('Emergency Contacts:', 20, emergY);
    const emergencyLines = doc.splitTextToSize(formData.emergencyContacts || 'Not provided', 170);
    doc.text(emergencyLines, 20, emergY + 7);
    
    // Sign-off Section
    doc.setFontSize(14);
    doc.text('AUTHORIZATION', 20, 200);
    
    doc.setFontSize(10);
    doc.text(`Prepared By: ${formData.preparedBy || 'Not specified'}`, 20, 210);
    doc.text(`Reviewed By: ${formData.reviewedBy || 'Not specified'}`, 20, 217);
    doc.text(`Site Manager: ${formData.siteManager || 'Not specified'}`, 20, 224);
    doc.text(`Contact Number: ${formData.contactNumber || 'Not specified'}`, 20, 231);
    doc.text(`Review Date: ${formData.reviewDate || 'Not specified'}`, 20, 238);
    doc.text(`Revision Number: ${formData.revisionNumber || '1'}`, 20, 245);
    
    // Footer
    doc.setFontSize(8);
    doc.text('This RAMS document must be reviewed by a competent person before use.', 105, 270, { align: 'center' });
    doc.text('Compliance with CDM 2015 regulations required.', 105, 275, { align: 'center' });
    
    // Convert PDF to base64
    const pdfBase64 = doc.output('datauristring');
    
    return NextResponse.json({
      success: true,
      pdfData: pdfBase64,
      message: 'RAMS document generated successfully',
      filename: `RAMS_${formData.projectName?.replace(/\s+/g, '_') || 'document'}_${Date.now()}.pdf`
    });
    
  } catch (error) {
    console.error('Error generating RAMS document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate RAMS document' }, 
      { status: 500 }
    );
  }
}