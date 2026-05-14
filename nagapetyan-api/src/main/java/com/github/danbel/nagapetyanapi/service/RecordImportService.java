package com.github.danbel.nagapetyanapi.service;

import com.github.danbel.nagapetyanapi.dto.ImportResultResponse;
import com.github.danbel.nagapetyanapi.dto.LogisticsRecordRequest;
import com.github.danbel.nagapetyanapi.model.ActorContext;
import com.github.danbel.nagapetyanapi.model.LogisticsRecord;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class RecordImportService {

    private final RecordService recordService;

    public RecordImportService(RecordService recordService) {
        this.recordService = recordService;
    }

    public ImportResultResponse importFile(ActorContext context, Long organizationId, MultipartFile file) throws IOException {
        List<LogisticsRecordRequest> requests = file.getOriginalFilename() != null && file.getOriginalFilename().toLowerCase(Locale.ROOT).endsWith(".csv")
                ? parseCsv(file.getBytes())
                : parseExcel(file.getInputStream());

        long imported = 0;
        long skipped = 0;

        for (LogisticsRecordRequest request : requests) {
            if (request.shipmentNumber() == null || request.shipmentNumber().isBlank()) {
                skipped++;
                continue;
            }
            recordService.createRecord(context, organizationId, request);
            imported++;
        }

        return new ImportResultResponse(imported, skipped);
    }

    private List<LogisticsRecordRequest> parseCsv(byte[] content) {
        String text = new String(content);
        String[] lines = text.split("\\R");
        if (lines.length < 2) {
            return List.of();
        }

        String[] headers = splitLine(lines[0]);
        List<LogisticsRecordRequest> requests = new ArrayList<>();
        for (int i = 1; i < lines.length; i++) {
            if (lines[i].isBlank()) {
                continue;
            }
            requests.add(mapRow(headers, splitLine(lines[i])));
        }
        return requests;
    }

    private List<LogisticsRecordRequest> parseExcel(InputStream inputStream) throws IOException {
        try (Workbook workbook = WorkbookFactory.create(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(sheet.getFirstRowNum());
            if (headerRow == null) {
                return List.of();
            }

            DataFormatter formatter = new DataFormatter();
            Map<Integer, String> headers = new LinkedHashMap<>();
            for (Cell cell : headerRow) {
                headers.put(cell.getColumnIndex(), normalize(formatter.formatCellValue(cell)));
            }

            List<LogisticsRecordRequest> requests = new ArrayList<>();
            for (int i = sheet.getFirstRowNum() + 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) {
                    continue;
                }
                String[] orderedHeaders = new String[headers.size()];
                String[] values = new String[headers.size()];
                int position = 0;
                for (Map.Entry<Integer, String> entry : headers.entrySet()) {
                    Cell cell = row.getCell(entry.getKey(), Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                    orderedHeaders[position] = entry.getValue();
                    values[position] = cell == null ? "" : formatter.formatCellValue(cell);
                    position++;
                }
                requests.add(mapRow(orderedHeaders, values));
            }
            return requests;
        }
    }

    private LogisticsRecordRequest mapRow(String[] headers, String[] values) {
        Map<String, String> row = new HashMap<>();
        for (int i = 0; i < headers.length && i < values.length; i++) {
            row.put(normalize(headers[i]), values[i]);
        }

        return new LogisticsRecordRequest(
                row.get("shipmentnumber"),
                row.getOrDefault("routefrom", ""),
                row.getOrDefault("routeto", ""),
                parseDate(row.get("shippedat")),
                parseDate(row.get("planneddeliverydate")),
                parseOptionalDate(row.get("deliveredat")),
                parseStatus(row.get("status")),
                row.getOrDefault("responsibledepartment", ""),
                row.getOrDefault("note", "")
        );
    }

    private String[] splitLine(String line) {
        return line.contains(";") ? line.split(";", -1) : line.split(",", -1);
    }

    private String normalize(String value) {
        return value == null ? "" : value.replaceAll("[^a-zA-Z0-9]", "").toLowerCase(Locale.ROOT);
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return LocalDate.now();
        }
        try {
            String normalized = value.trim();
            if (normalized.contains("T")) {
                normalized = normalized.substring(0, 10);
            }
            if (normalized.contains(".")) {
                String[] parts = normalized.split("\\.");
                return LocalDate.of(Integer.parseInt(parts[2]), Integer.parseInt(parts[1]), Integer.parseInt(parts[0]));
            }
            if (normalized.contains("/")) {
                String[] parts = normalized.split("/");
                return LocalDate.of(Integer.parseInt(parts[2]), Integer.parseInt(parts[1]), Integer.parseInt(parts[0]));
            }
            return LocalDate.parse(normalized);
        } catch (Exception exception) {
            return LocalDate.now();
        }
    }

    private LocalDate parseOptionalDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return parseDate(value);
    }

    private com.github.danbel.nagapetyanapi.model.ReportStatus parseStatus(String value) {
        if (value == null || value.isBlank()) {
            return com.github.danbel.nagapetyanapi.model.ReportStatus.IN_TRANSIT;
        }
        return com.github.danbel.nagapetyanapi.model.ReportStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }
}
