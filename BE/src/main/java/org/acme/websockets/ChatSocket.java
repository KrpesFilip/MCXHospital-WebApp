package org.acme.websockets;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import org.acme.dtos.messages.MessageRequest;
import org.acme.services.MessageService;
import org.eclipse.microprofile.context.ManagedExecutor;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ServerEndpoint("/chat/{caseId}/{userId}")
@ApplicationScoped
public class ChatSocket {

    @Inject
    MessageService messageService;

    @Inject
    ManagedExecutor managedExecutor;

    private static final Map<Long, Map<Long, Session>> sessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("caseId") Long caseId, @PathParam("userId") Long userId) {
        sessions.computeIfAbsent(caseId, k -> new ConcurrentHashMap<>()).put(userId, session);
    }

    @OnClose
    public void onClose(Session session, @PathParam("caseId") Long caseId, @PathParam("userId") Long userId) {
        if (sessions.containsKey(caseId)) {
            sessions.get(caseId).remove(userId);
            if (sessions.get(caseId).isEmpty()) {
                sessions.remove(caseId);
            }
        }
    }

    @OnMessage
    public void onMessage(String messageContent, @PathParam("caseId") Long caseId, @PathParam("userId") Long userId) {
        try {
            managedExecutor.runAsync(() -> {
                try {
                    messageService.saveMessage(new MessageRequest(caseId, userId, messageContent));
                } catch (Exception ignored) {

                }
            });
        } catch (Exception ignored) {

        }
    }

    public void broadcast(Long caseId, String message) {
        Map<Long, Session> caseSessions = sessions.get(caseId);
        if (caseSessions != null) {
            caseSessions.values().forEach(s -> {
                if (s.isOpen()) {
                    s.getAsyncRemote().sendText(message, result -> {
                    });
                }
            });
        }
    }
}