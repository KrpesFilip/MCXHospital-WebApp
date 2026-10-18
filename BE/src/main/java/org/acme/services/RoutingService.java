package org.acme.services;

import jakarta.enterprise.context.ApplicationScoped;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Locale;

@ApplicationScoped
public class RoutingService {

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();


    private static final double HOSPITAL_LAT = 45.558125;
    private static final double HOSPITAL_LON = 18.713756;

    public double calculateEtaInMinutes(double startLat, double startLon) {
        try {
            String url = String.format(Locale.US, "http://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=false",
                    startLon, startLat, HOSPITAL_LON, HOSPITAL_LAT);

            HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).GET().build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            JsonNode root = mapper.readTree(response.body());

            double seconds = root.path("routes").get(0).path("duration").asDouble();

            return Math.round((seconds / 60.0) * 10.0) / 10.0;
        } catch (Exception e) {
            System.err.println("Failed to fetch OSRM routing data: " + e.getMessage());
            return -1.0;
        }
    }
}