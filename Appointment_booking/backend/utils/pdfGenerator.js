import PDFDocument from 'pdfkit';

const generateAppointmentPDF = (appointment, res) => {
    const doc = new PDFDocument({ margin: 50 });

    // Set the response headers so the client knows it's a PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=appointment-${appointment._id}.pdf`
    );

    // Pipe the PDF directly to the response stream
    doc.pipe(res);

    // Add a Header
    doc
        .fontSize(20)
        .text('Hospital Appointment Booking', { align: 'center' })
        .moveDown();

    doc
        .fontSize(16)
        .text('Appointment Details', { underline: true })
        .moveDown(0.5);

    // Details
    doc.fontSize(12);
    doc.text(`Booking ID: ${appointment._id}`);
    doc.text(`Patient Name: ${appointment.user.name}`);
    doc.text(`Hospital: ${appointment.hospital.name}`);
    doc.text(`Service: ${appointment.service.name}`);

    // Format Date gracefully
    const formattedDate = new Date(appointment.date).toLocaleDateString();

    doc.text(`Date: ${formattedDate}`);
    doc.text(`Time Slot: ${appointment.timeSlot}`);
    doc.text(`Status: ${appointment.status}`);

    doc.moveDown();
    doc.text(`Hospital Location: ${appointment.hospital.location.address}, ${appointment.hospital.location.city}`);

    doc.moveDown(2);
    doc.text('Thank you for using our service!', { align: 'center' });

    // Finalize the PDF and end the stream
    doc.end();
};

export default generateAppointmentPDF;
