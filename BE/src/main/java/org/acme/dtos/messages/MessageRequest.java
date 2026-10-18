package org.acme.dtos.messages;

public record MessageRequest(
    Long caseId,
    Long senderId,
    String content
) {
}
