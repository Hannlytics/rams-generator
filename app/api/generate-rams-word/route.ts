import { NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export async function POST(request: Request) {
  try {
    const formData = await request.json();
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "RISK ASSESSMENT & METHOD STATEMENT",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          
          new Paragraph({
            text: `Generated: ${new Date().toLocaleDateString('en-GB')}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          
          // Project Information
          new Paragraph({
            text: "PROJECT INFORMATION",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Project Name: ", bold: true }),
              new TextRun(formData.projectName || 'Not specified'),
            ],
            spacing: { after: 120 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Client: ", bold: true }),
              new TextRun(formData.clientName || 'Not specified'),
            ],
            spacing: { after: 120 },
          }),
          
          // Work Details
          new Paragraph({
            text: "WORK DETAILS",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Scope of Work:", bold: true }),
            ],
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            text: formData.scopeOfWork || 'Not provided',
            spacing: { after: 200 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Method Statement:", bold: true }),
            ],
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            text: formData.methodStatement || 'Not provided',
            spacing: { after: 200 },
          }),
          
          // Hazards
          new Paragraph({
            text: "IDENTIFIED HAZARDS",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),
          ...(formData.selectedHazards || []).map((hazard: string) => 
            new Paragraph({
              text: `• ${hazard}`,
              indent: { left: 400 },  // Changed from spacing.left to indent.left
              spacing: { after: 100 },
            })
          ),
          
          // PPE
          new Paragraph({
            text: "PPE REQUIREMENTS",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),
          ...(formData.selectedPPE || []).map((ppe: string) => 
            new Paragraph({
              text: `• ${ppe}`,
              indent: { left: 400 },  // Changed from spacing.left to indent.left
              spacing: { after: 100 },
            })
          ),
          
          // Authorization
          new Paragraph({
            text: "AUTHORIZATION",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Prepared By: ", bold: true }),
              new TextRun(formData.preparedBy || 'Not specified'),
            ],
            spacing: { after: 120 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Site Manager: ", bold: true }),
              new TextRun(formData.siteManager || 'Not specified'),
            ],
            spacing: { after: 400 },
          }),
          
          // Footer
          new Paragraph({
            text: "This RAMS document must be reviewed by a competent person before use.",
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
          }),
        ],
      }],
    });
    
    // Generate buffer
    const buffer = await Packer.toBuffer(doc);
    
    // Convert to base64
    const base64 = buffer.toString('base64');
    
    return NextResponse.json({
      success: true,
      docData: `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`,
      filename: `RAMS_${formData.projectName?.replace(/\s+/g, '_') || 'document'}_${Date.now()}.docx`,
      message: 'Word document generated successfully'
    });
    
  } catch (error) {
    console.error('Error generating Word document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate Word document' }, 
      { status: 500 }
    );
  }
}