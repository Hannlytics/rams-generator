import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.json();

    // This is a simplified placeholder for generating the document content.
    const content = `
      RAMS DOCUMENT
      =================================
      Project Name: ${formData.projectName}
      Client: ${formData.clientName}
      Start Date: ${formData.startDate}
      Job Reference: ${formData.jobReference || 'N/A'}
      Site Contact: ${formData.siteContactPerson || 'N/A'}
      =================================
      
      Scope of Work:
      ${formData.scopeOfWork}
      
      Sequence of Operations:
      ${formData.sequenceOfOperations}

      Method Statement:
      ${formData.methodStatement}
      
      Control Measures:
      ${formData.controls}
      
      Prepared By: ${formData.preparedBy}
      Reviewed By: ${formData.reviewedBy}
      Revision: ${formData.revisionNumber}
      Review Date: ${formData.reviewDate}
    `;

    return NextResponse.json({ data: { content } });

  } catch (_error) { // FIX: Prefixed 'error' with an underscore to mark as unused
    console.error('Error generating RAMS document:', _error);
    return NextResponse.json({ error: 'Failed to generate RAMS document' }, { status: 500 });
  }
}

