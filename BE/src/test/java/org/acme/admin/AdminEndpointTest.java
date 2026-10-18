package org.acme.admin;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.*;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

import io.smallrye.jwt.build.Jwt;
import java.time.Duration;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS) // keep state between tests
public class AdminEndpointTest {

    private Long userId;
/*
    private String adminToken() {
        return Jwt.issuer("https://localhost:8080/")
                .subject("1")
                .groups("ADMIN")
                .expiresIn(Duration.ofHours(1))
                .sign();
    }
*/
/*
    @BeforeEach
    void beforeEach(TestInfo testInfo) {
        System.out.println("STARTING TEST: " + testInfo.getDisplayName());
    }

    @AfterEach
    void afterEach(TestInfo testInfo) {
        System.out.println("FINISHED TEST: " + testInfo.getDisplayName());
    }

    @Test
    @Order(1)
    void testCreateUser() {
        // Create a test user and store its ID
        userId = ((Integer) given()
                .contentType(ContentType.JSON)
                //.header("Authorization", "Bearer " + adminToken())
                .body("{\"username\":\"test_user\",\"password\":\"password123\",\"role\":\"HOSPITAL\"}")
                .when()
                .post("/admin/users")
                .then()
                .statusCode(201)
                .body("username", equalTo("test_user"))
                .extract()
                .path("id")).longValue();
    }

    @Test
    @Order(2)
    void testDeleteUser() {
        // Delete the previously created user
        given()
                //.header("Authorization", "Bearer " + adminToken())
                .when()
                .delete("/admin/users/" + userId)
                .then()
                .statusCode(204);
    }*/
}

