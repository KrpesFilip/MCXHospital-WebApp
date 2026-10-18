package org.acme.websockets;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ServerEndpoint("/hospital/notifications/{hospitalId}")
@ApplicationScoped
public class HospitalNotificationSocket {
    public static final Map<Long, Session> sessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("hospitalId") Long hospitalId) {
        sessions.put(hospitalId, session);
    }

    @OnClose
    public void onClose(Session session, @PathParam("hospitalId") Long hospitalId) {
        sessions.remove(hospitalId);
    }

    public void notifyHospital(Long hospitalId, String notification) {
        Session session = sessions.get(hospitalId);
        if (session != null && session.isOpen()) {
            session.getAsyncRemote().sendText(notification);
        }
    }
}
