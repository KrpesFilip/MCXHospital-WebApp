package org.acme.websockets;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.websocket.*;
import jakarta.websocket.server.ServerEndpoint;
import org.acme.dtos.cases.LocationUpdateRequest;
import org.acme.services.RoutingService;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ServerEndpoint("/ws/cases")
@ApplicationScoped
public class CaseWebSocketEndpoint {

    private static final Map<String, Session> sessions = new ConcurrentHashMap<>();

    @Inject
    ObjectMapper objectMapper;

    @Inject
    RoutingService routingService;

    @OnOpen
    public void onOpen(Session session) {
        sessions.put(session.getId(), session);
    }

    @OnClose
    public void onClose(Session session) {
        sessions.remove(session.getId());
    }

    @OnMessage
    public void onMessage(String message) {
        try {
            LocationUpdateRequest req = objectMapper.readValue(message, LocationUpdateRequest.class);

            if ("LOCATION_UPDATE".equals(req.type())) {
                double eta = routingService.calculateEtaInMinutes(req.latitude(), req.longitude());

                String responsePayload = objectMapper.writeValueAsString(Map.of(
                        "type", "LOCATION_UPDATE",
                        "caseId", req.caseId(),
                        "latitude", req.latitude(),
                        "longitude", req.longitude(),
                        "etaMinutes", eta
                ));

                broadcast(responsePayload);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void broadcast(String message) {
        sessions.values().forEach(session -> {
            try {
                session.getAsyncRemote().sendText(message);
            } catch (Exception e) {
                System.err.println("Error sending message to session " + session.getId() + ": " + e.getMessage());
            }
        });
    }

    public void broadcastCaseUpdate(Object data, String eventType) {
        try {
            broadcast(objectMapper.writeValueAsString(Map.of("type", eventType, "data", data)));
        } catch (Exception e) { e.printStackTrace(); }
    }
}