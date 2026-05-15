package com.github.danbel.nagapetyanapi.dto;

import org.springframework.http.MediaType;

public record ExportFileResponse(
        byte[] content,
        String filename,
        MediaType contentType
) {
}
