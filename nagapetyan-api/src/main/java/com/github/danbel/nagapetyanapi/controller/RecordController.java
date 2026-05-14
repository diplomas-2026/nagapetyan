package com.github.danbel.nagapetyanapi.controller;

import com.github.danbel.nagapetyanapi.dto.ImportResultResponse;
import com.github.danbel.nagapetyanapi.dto.LogisticsRecordRequest;
import com.github.danbel.nagapetyanapi.dto.LogisticsRecordResponse;
import com.github.danbel.nagapetyanapi.model.ActorContext;
import com.github.danbel.nagapetyanapi.model.ActorRole;
import com.github.danbel.nagapetyanapi.service.RecordImportService;
import com.github.danbel.nagapetyanapi.service.RecordService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/organizations/{organizationId}/reports")
public class RecordController {

    private final RecordService recordService;
    private final RecordImportService recordImportService;

    public RecordController(RecordService recordService, RecordImportService recordImportService) {
        this.recordService = recordService;
        this.recordImportService = recordImportService;
    }

    @GetMapping
    public List<LogisticsRecordResponse> list(@RequestHeader(value = "X-Role", defaultValue = "SYSTEM_ADMIN") ActorRole role,
                                              @RequestHeader(value = "X-Organization-Id", required = false) Long organizationHeaderId,
                                              @PathVariable Long organizationId) {
        return recordService.listRecordResponses(new ActorContext(role, organizationHeaderId), organizationId);
    }

    @GetMapping("/{recordId}")
    public LogisticsRecordResponse get(@RequestHeader(value = "X-Role", defaultValue = "SYSTEM_ADMIN") ActorRole role,
                                       @RequestHeader(value = "X-Organization-Id", required = false) Long organizationHeaderId,
                                       @PathVariable Long organizationId,
                                       @PathVariable Long recordId) {
        return recordService.getRecordResponse(new ActorContext(role, organizationHeaderId), organizationId, recordId);
    }

    @PostMapping
    public LogisticsRecordResponse create(@RequestHeader(value = "X-Role", defaultValue = "SYSTEM_ADMIN") ActorRole role,
                                          @RequestHeader(value = "X-Organization-Id", required = false) Long organizationHeaderId,
                                          @PathVariable Long organizationId,
                                          @Valid @RequestBody LogisticsRecordRequest request) {
        return recordService.createRecordResponse(new ActorContext(role, organizationHeaderId), organizationId, request);
    }

    @PutMapping("/{recordId}")
    public LogisticsRecordResponse update(@RequestHeader(value = "X-Role", defaultValue = "SYSTEM_ADMIN") ActorRole role,
                                          @RequestHeader(value = "X-Organization-Id", required = false) Long organizationHeaderId,
                                          @PathVariable Long organizationId,
                                          @PathVariable Long recordId,
                                          @Valid @RequestBody LogisticsRecordRequest request) {
        return recordService.updateRecordResponse(new ActorContext(role, organizationHeaderId), organizationId, recordId, request);
    }

    @DeleteMapping("/{recordId}")
    public void delete(@RequestHeader(value = "X-Role", defaultValue = "SYSTEM_ADMIN") ActorRole role,
                       @RequestHeader(value = "X-Organization-Id", required = false) Long organizationHeaderId,
                       @PathVariable Long organizationId,
                       @PathVariable Long recordId) {
        recordService.deleteRecord(new ActorContext(role, organizationHeaderId), organizationId, recordId);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ImportResultResponse importFile(@RequestHeader(value = "X-Role", defaultValue = "SYSTEM_ADMIN") ActorRole role,
                                           @RequestHeader(value = "X-Organization-Id", required = false) Long organizationHeaderId,
                                           @PathVariable Long organizationId,
                                           @RequestPart("file") MultipartFile file) throws IOException {
        return recordImportService.importFile(new ActorContext(role, organizationHeaderId), organizationId, file);
    }
}
