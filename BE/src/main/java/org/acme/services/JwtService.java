package org.acme.services;

import io.smallrye.jwt.build.Jwt;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.models.User;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Duration;
import java.util.Base64;
import java.util.Set;

@ApplicationScoped
public class JwtService {

    private PrivateKey privateKey;

    @PostConstruct
    void init() {
        try {
            InputStream is = getClass().getClassLoader().getResourceAsStream("privateKey.pem");
            if (is == null) {
                throw new RuntimeException("privateKey.pem not found");
            }
            
            String pem = new String(is.readAllBytes(), StandardCharsets.UTF_8)
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s+", "");
            
            byte[] decoded = Base64.getDecoder().decode(pem);
            PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(decoded);
            this.privateKey = KeyFactory.getInstance("RSA").generatePrivate(spec);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to load RSA private key", e);
        }
    }

    public String generateToken(User user) {
        return Jwt.issuer("https://localhost:8080/")
                .subject(user.id.toString())
                .claim("name", user.getName())
                .groups(Set.of(user.getRole().name()))
                .expiresIn(Duration.ofHours(4))
                .sign(privateKey);
    }
}