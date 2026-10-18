package org.acme.services;

import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfDocumentInfo;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import org.acme.models.Case;

import jakarta.enterprise.context.ApplicationScoped;
import java.io.ByteArrayOutputStream;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@ApplicationScoped
public class PdfService {

    private static final DeviceRgb PRIMARY_COLOR = new DeviceRgb(33, 33, 33);
    private static final DeviceRgb ACCENT_COLOR = new DeviceRgb(100, 100, 100);
    private static final DeviceRgb SOS_COLOR = new DeviceRgb(220, 53, 69);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    public byte[] generateCasePdf(Case caseEntity) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);

        PdfDocumentInfo info = pdf.getDocumentInfo();
        info.setTitle("Case Report #" + caseEntity.id);

        Document document = new Document(pdf);

        document.setMargins(50, 50, 50, 50);

        addHeader(document, caseEntity);
        addPatientInfo(document, caseEntity);

        if (hasVitalSigns(caseEntity)) {
            addVitalSigns(document, caseEntity);
        }

        addCaseDetails(document, caseEntity);

        document.close();
        return baos.toByteArray();
    }

    private void addHeader(Document document, Case caseEntity) {
        Paragraph title = new Paragraph("Medical Report")
                .setFontSize(28)
                .setFontColor(PRIMARY_COLOR)
                .setMarginBottom(8);
        document.add(title);

        Paragraph caseNumber = new Paragraph("Case #" + caseEntity.id)
                .setFontSize(11)
                .setFontColor(ACCENT_COLOR)
                .setMarginBottom(30);
        document.add(caseNumber);

        if (caseEntity.getIsSos()) {
            Paragraph sosAlert = new Paragraph("SOS Emergency")
                    .setFontSize(12)
                    .setBold()
                    .setFontColor(SOS_COLOR)
                    .setBorderLeft(new SolidBorder(SOS_COLOR, 3))
                    .setPaddingLeft(12)
                    .setMarginBottom(30);
            document.add(sosAlert);
        }
    }

    private void addPatientInfo(Document document, Case caseEntity) {
        addSectionTitle(document, "Patient Information");

        addInfoRow(document, "Full Name", caseEntity.getPatientName());
        addInfoRow(document, "Birth Year", caseEntity.getBirthYear().toString());
        addInfoRow(document, "Sex", caseEntity.getSex());

        document.add(new Paragraph().setMarginBottom(20));
    }

    private void addVitalSigns(Document document, Case caseEntity) {
        addSectionTitle(document, "Vital Signs");

        if (caseEntity.getBpm() != null) {
            addInfoRow(document, "Heart Rate", caseEntity.getBpm() + " bpm");
        }
        if (caseEntity.getSystolicPressure() != null && caseEntity.getDiastolicPressure() != null) {
            addInfoRow(document, "Blood Pressure",
                    caseEntity.getSystolicPressure() + "/" + caseEntity.getDiastolicPressure() + " mmHg");
        }
        if (caseEntity.getResRate() != null) {
            addInfoRow(document, "Respiratory Rate", caseEntity.getResRate() + " /min");
        }
        if (caseEntity.getSaturation() != null) {
            addInfoRow(document, "SpO2", caseEntity.getSaturation() + "%");
        }
        if (caseEntity.getTemperature() != null) {
            addInfoRow(document, "Temperature", String.format("%.1f°C", caseEntity.getTemperature()));
        }

        document.add(new Paragraph().setMarginBottom(20));
    }

    private void addCaseDetails(Document document, Case caseEntity) {
        addSectionTitle(document, "Case Details");

        addInfoRow(document, "Created By",
                caseEntity.getCreatedBy() != null ? caseEntity.getCreatedBy().getName() : "—");
        addInfoRow(document, "Created At",
                caseEntity.getCreatedAt()
                        .atZone(ZoneId.of("CET"))
                        .format(DATE_FORMATTER));
        addInfoRow(document, "Priority",
                caseEntity.getPriority() != null ? caseEntity.getPriority().toString() : "Not Set");

        document.add(new Paragraph().setMarginBottom(15));

        Paragraph descLabel = new Paragraph("Description")
                .setFontSize(10)
                .setFontColor(ACCENT_COLOR)
                .setMarginBottom(8);
        document.add(descLabel);

        Paragraph description = new Paragraph(caseEntity.getDescription())
                .setFontSize(11)
                .setFontColor(PRIMARY_COLOR)
                .setPaddingLeft(0)
                .setMarginBottom(20);
        document.add(description);
    }

    private void addSectionTitle(Document document, String title) {
        Paragraph section = new Paragraph(title)
                .setFontSize(14)
                .setBold()
                .setFontColor(PRIMARY_COLOR)
                .setMarginTop(5)
                .setMarginBottom(15);
        document.add(section);
    }

    private void addInfoRow(Document document, String label, String value) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
                .useAllAvailableWidth()
                .setBorder(Border.NO_BORDER)
                .setMarginBottom(8);

        Cell labelCell = new Cell()
                .add(new Paragraph(label)
                        .setFontSize(10)
                        .setFontColor(ACCENT_COLOR))
                .setBorder(Border.NO_BORDER)
                .setPadding(0);

        Cell valueCell = new Cell()
                .add(new Paragraph(value)
                        .setFontSize(11)
                        .setFontColor(PRIMARY_COLOR))
                .setBorder(Border.NO_BORDER)
                .setPadding(0);

        table.addCell(labelCell);
        table.addCell(valueCell);

        document.add(table);
    }

    private boolean hasVitalSigns(Case caseEntity) {
        return caseEntity.getBpm() != null ||
                caseEntity.getSystolicPressure() != null ||
                caseEntity.getDiastolicPressure() != null ||
                caseEntity.getResRate() != null ||
                caseEntity.getSaturation() != null ||
                caseEntity.getTemperature() != null;
    }
}