package com.github.danbel.nagapetyanapi.service;

import com.github.danbel.nagapetyanapi.dto.ExportFileResponse;
import com.github.danbel.nagapetyanapi.dto.LogisticsRecordResponse;
import com.github.danbel.nagapetyanapi.model.ActorContext;
import com.github.danbel.nagapetyanapi.model.Organization;
import com.github.danbel.nagapetyanapi.model.ReportStatus;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class RecordExportService {

    private final InMemoryStore store;
    private final RecordService recordService;

    public RecordExportService(InMemoryStore store, RecordService recordService) {
        this.store = store;
        this.recordService = recordService;
    }

    public ExportFileResponse exportRecords(ActorContext context, Long organizationId, String format) {
        List<LogisticsRecordResponse> records = recordService.listRecordResponses(context, organizationId);
        Organization organization = store.getOrganization(organizationId);
        String organizationName = organization == null ? "organization-" + organizationId : organization.getName();
        String normalizedFormat = format == null ? "xlsx" : format.trim().toLowerCase();
        return switch (normalizedFormat) {
            case "pdf" -> new ExportFileResponse(
                    exportPdf(records, organizationId, organizationName),
                    buildFilename(organizationName, "pdf"),
                    MediaType.APPLICATION_PDF);
            case "xlsx", "excel", "xls" -> new ExportFileResponse(
                    exportXlsx(records),
                    buildFilename(organizationName, "xlsx"),
                    MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            default -> new ExportFileResponse(
                    exportXlsx(records),
                    buildFilename(organizationName, "xlsx"),
                    MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        };
    }

    private byte[] exportXlsx(List<LogisticsRecordResponse> records) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Отправления");
            DataFormat dataFormat = workbook.createDataFormat();

            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.setDataFormat(dataFormat.getFormat("dd.MM.yyyy"));

            Row header = sheet.createRow(0);
            String[] titles = {
                    "№",
                    "Номер отправления",
                    "Откуда",
                    "Куда",
                    "Дата отправки",
                    "Плановая доставка",
                    "Фактическая доставка",
                    "Статус",
                    "Вес, кг",
                    "Стоимость, руб.",
                    "Срок, дн.",
                    "Задержка",
                    "Подразделение",
                    "Комментарий"
            };

            for (int i = 0; i < titles.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(titles[i]);
            }

            int rowIndex = 1;
            for (LogisticsRecordResponse record : records) {
                Row row = sheet.createRow(rowIndex++);
                int column = 0;
                row.createCell(column++).setCellValue(record.id() == null ? 0 : record.id());
                row.createCell(column++).setCellValue(nullToEmpty(record.shipmentNumber()));
                row.createCell(column++).setCellValue(nullToEmpty(record.routeFrom()));
                row.createCell(column++).setCellValue(nullToEmpty(record.routeTo()));
                writeDateCell(row, column++, record.shippedAt(), dateStyle);
                writeDateCell(row, column++, record.plannedDeliveryDate(), dateStyle);
                writeDateCell(row, column++, record.deliveredAt(), dateStyle);
                row.createCell(column++).setCellValue(record.status() == null ? "" : statusLabel(record.status()));
                row.createCell(column++).setCellValue(record.weight() == null ? 0 : record.weight().doubleValue());
                row.createCell(column++).setCellValue(record.cost() == null ? 0 : record.cost().doubleValue());
                row.createCell(column++).setCellValue(record.transitDays());
                row.createCell(column++).setCellValue(record.delayed() ? "Да" : "Нет");
                row.createCell(column++).setCellValue(nullToEmpty(record.responsibleDepartment()));
                row.createCell(column).setCellValue(nullToEmpty(record.note()));
            }

            for (int i = 0; i < titles.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Не удалось сформировать Excel-файл", exception);
        }
    }

    private byte[] exportPdf(List<LogisticsRecordResponse> records, Long organizationId, String organizationName) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate(), 18, 18, 18, 18);
            PdfWriter.getInstance(document, outputStream);
            Font titleFont = loadFont(16, Font.BOLD);
            Font textFont = loadFont(9, Font.NORMAL);
            Font headerFont = loadFont(9, Font.BOLD);
            document.open();

            document.add(new Paragraph("Экспорт отправлений", titleFont));
            document.add(new Paragraph("Организация: " + organizationName + " (ID " + organizationId + ")", textFont));
            document.add(new Paragraph(" ", textFont));

            PdfPTable table = new PdfPTable(9);
            table.setWidthPercentage(100);
            table.setSpacingBefore(8f);

            addPdfHeader(table, "Номер", headerFont);
            addPdfHeader(table, "Маршрут", headerFont);
            addPdfHeader(table, "Дата отправки", headerFont);
            addPdfHeader(table, "План", headerFont);
            addPdfHeader(table, "Статус", headerFont);
            addPdfHeader(table, "Вес", headerFont);
            addPdfHeader(table, "Стоимость", headerFont);
            addPdfHeader(table, "Срок", headerFont);
            addPdfHeader(table, "Подразделение", headerFont);

            for (LogisticsRecordResponse record : records) {
                table.addCell(textCell(nullToEmpty(record.shipmentNumber()), textFont));
                table.addCell(textCell((nullToEmpty(record.routeFrom()) + " → " + nullToEmpty(record.routeTo())).trim(), textFont));
                table.addCell(textCell(formatDate(record.shippedAt()), textFont));
                table.addCell(textCell(formatDate(record.plannedDeliveryDate()), textFont));
                table.addCell(textCell(record.status() == null ? "-" : statusLabel(record.status()), textFont));
                table.addCell(textCell(formatDecimal(record.weight()), textFont));
                table.addCell(textCell(formatDecimal(record.cost()), textFont));
                table.addCell(textCell(record.transitDays() + " дн.", textFont));
                table.addCell(textCell(nullToEmpty(record.responsibleDepartment()), textFont));
            }

            document.add(table);
            document.close();
            return outputStream.toByteArray();
        } catch (DocumentException | IOException exception) {
            throw new IllegalStateException("Не удалось сформировать PDF-файл", exception);
        }
    }

    private void writeDateCell(Row row, int column, LocalDate date, CellStyle style) {
        Cell cell = row.createCell(column);
        if (date != null) {
            cell.setCellValue(java.sql.Date.valueOf(date));
            cell.setCellStyle(style);
        }
    }

    private void addPdfHeader(PdfPTable table, String title, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(title, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private PdfPCell textCell(String value, Font font) {
        return new PdfPCell(new Phrase(value, font));
    }

    private Font loadFont(int size, int style) {
        try (InputStream inputStream = RecordExportService.class.getResourceAsStream("/fonts/Verdana.ttf")) {
            if (inputStream != null) {
                byte[] fontBytes = inputStream.readAllBytes();
                BaseFont baseFont = BaseFont.createFont(
                        "Verdana.ttf",
                        BaseFont.IDENTITY_H,
                        BaseFont.EMBEDDED,
                        true,
                        fontBytes,
                        null);
                return new Font(baseFont, size, style);
            }
        } catch (Exception ignored) {
            // Fallback ниже.
        }
        return FontFactory.getFont(FontFactory.HELVETICA, size, style);
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private String formatDate(LocalDate date) {
        return date == null ? "-" : date.toString();
    }

    private String formatDecimal(BigDecimal value) {
        return value == null ? "-" : value.stripTrailingZeros().toPlainString();
    }

    private String statusLabel(ReportStatus status) {
        return switch (status) {
            case IN_TRANSIT -> "В пути";
            case DELIVERED -> "Доставлено";
            case DELAYED -> "С задержкой";
            case CANCELED -> "Отменено";
        };
    }

    private String buildFilename(String organizationName, String extension) {
        String safeName = organizationName == null ? "organization" : organizationName.trim().toLowerCase().replaceAll("[^a-z0-9._-]+", "-");
        safeName = safeName.replaceAll("^-+|-+$", "");
        if (safeName.isBlank()) {
            safeName = "organization";
        }
        return safeName + "-reports." + extension;
    }
}
